import { pool } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import paystackService from "../services/paystackService.js";

const normalizeMethod = (method) => (method === "momo" ? "mobile_money" : method);
const normalizeStatus = (status) => (status === "success" ? "completed" : status);

const mapPayment = (row) => ({
  id: row.id,
  saleId: row.sale_id,
  amount: Number(row.amount_paid),
  amountReceived: Number(row.amount_received),
  changeDue: Number(row.change_due),
  paymentMethod: row.method === "mobile_money" ? "momo" : row.method,
  status: row.status === "completed" ? "success" : row.status,
  reference: row.reference,
  createdAt: row.created_at
});

export const createPayment = asyncHandler(async (req, res) => {
  const {
    saleId,
    amount,
    amountReceived,
    paymentMethod,
    status = "success",
    reference = ""
  } = req.body;

  const method = normalizeMethod(paymentMethod);
  const normalizedStatus = normalizeStatus(status);

  const saleResult = await pool.query(
    `SELECT id, total_amount
     FROM sales
     WHERE id = $1`,
    [saleId]
  );

  if (saleResult.rowCount === 0) {
    throw new ApiError(404, "Sale not found");
  }

  const sale = saleResult.rows[0];
  const saleTotal = Number(sale.total_amount);
  const paid = Number(amount);
  const received = Number(amountReceived ?? amount);

  if (normalizedStatus === "completed" && method === "cash" && received < saleTotal) {
    throw new ApiError(400, "Amount received cannot be less than sale total for cash payment");
  }

  if (normalizedStatus === "completed" && paid < saleTotal) {
    throw new ApiError(400, "Amount cannot be less than sale total for successful payment");
  }

  const changeDue = method === "cash" ? Math.max(0, received - saleTotal) : 0;

  const result = await pool.query(
    `INSERT INTO payments
      (sale_id, method, amount_paid, amount_received, change_due, status, reference)
     VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''))
     ON CONFLICT (sale_id)
     DO UPDATE
     SET
       method = EXCLUDED.method,
       amount_paid = EXCLUDED.amount_paid,
       amount_received = EXCLUDED.amount_received,
       change_due = EXCLUDED.change_due,
       status = EXCLUDED.status,
       reference = EXCLUDED.reference
     RETURNING id, sale_id, amount_paid, amount_received, change_due, method, status, reference, created_at`,
    [saleId, method, paid, received, changeDue, normalizedStatus, reference]
  );

  res.status(201).json({
    payment: mapPayment(result.rows[0]),
    message: "Payment saved successfully"
  });
});

/**
 * Initialize Mobile Money payment via Paystack
 * POST /api/payments/momo/initiate
 */
export const initiateMoMoPayment = asyncHandler(async (req, res) => {
  const { saleId, amount, phone, email } = req.body;

  // Validation
  if (!saleId || !amount || !phone) {
    throw new ApiError(400, 'Sale ID, amount, and phone number are required');
  }

  // Verify sale exists
  const saleResult = await pool.query(
    'SELECT id, total_amount, status FROM sales WHERE id = $1',
    [saleId]
  );

  if (saleResult.rowCount === 0) {
    throw new ApiError(404, 'Sale not found');
  }

  const sale = saleResult.rows[0];

  // Verify amount matches sale total
  if (parseFloat(amount) !== parseFloat(sale.total_amount)) {
    throw new ApiError(400, 'Payment amount must match sale total');
  }

  // Check if payment already exists for this sale
  const existingPayment = await pool.query(
    'SELECT id, status, reference FROM payments WHERE sale_id = $1',
    [saleId]
  );

  if (existingPayment.rowCount > 0 && existingPayment.rows[0].status === 'completed') {
    throw new ApiError(400, 'Payment already completed for this sale');
  }

  try {
    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeMobileMoneyTransaction({
      amount,
      phone,
      email,
      saleId,
      metadata: {
        user_id: req.user?.userId,
        cashier: req.user?.username || 'system'
      }
    });

    // Create or update payment record with pending status
    const paymentResult = await pool.query(
      `INSERT INTO payments 
        (sale_id, amount, payment_method, status, reference, customer_phone, customer_email, provider, provider_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (sale_id) 
       DO UPDATE SET
         amount = EXCLUDED.amount,
         payment_method = EXCLUDED.payment_method,
         status = EXCLUDED.status,
         reference = EXCLUDED.reference,
         customer_phone = EXCLUDED.customer_phone,
         customer_email = EXCLUDED.customer_email,
         provider = EXCLUDED.provider,
         provider_response = EXCLUDED.provider_response,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        saleId,
        amount,
        'mobile_money',
        'pending',
        paystackResponse.reference,
        phone,
        email || null,
        'paystack',
        JSON.stringify(paystackResponse.data)
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Mobile Money payment initiated. Customer will receive a prompt on their phone.',
      payment: {
        id: paymentResult.rows[0].id,
        reference: paystackResponse.reference,
        status: 'pending',
        amount: amount,
        accessCode: paystackResponse.data.access_code,
        authorizationUrl: paystackResponse.data.authorization_url
      }
    });

  } catch (error) {
    console.error('MoMo initiation error:', error);
    throw new ApiError(500, error.message || 'Failed to initiate mobile money payment');
  }
});

/**
 * Verify payment status
 * GET /api/payments/verify/:reference
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    throw new ApiError(400, 'Payment reference is required');
  }

  try {
    // Verify with Paystack
    const verification = await paystackService.verifyTransaction(reference);

    // Get payment record from database
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE reference = $1',
      [reference]
    );

    if (paymentResult.rowCount === 0) {
      throw new ApiError(404, 'Payment record not found');
    }

    const payment = paymentResult.rows[0];

    // Update payment status based on Paystack response
    const newStatus = verification.success ? 'completed' : 'failed';

    await pool.query(
      `UPDATE payments 
       SET status = $1, 
           provider_response = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE reference = $3`,
      [newStatus, JSON.stringify(verification.fullResponse), reference]
    );

    // If payment successful, update sale status
    if (verification.success) {
      await pool.query(
        `UPDATE sales 
         SET status = 'completed' 
         WHERE id = $1`,
        [payment.sale_id]
      );
    }

    res.status(200).json({
      success: verification.success,
      status: verification.status,
      payment: {
        reference: verification.reference,
        amount: verification.amount,
        status: newStatus,
        paidAt: verification.paidAt,
        channel: verification.channel,
        customer: verification.customer
      },
      message: verification.success 
        ? 'Payment verified successfully' 
        : 'Payment verification failed'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    throw new ApiError(500, error.message || 'Failed to verify payment');
  }
});

/**
 * Paystack webhook handler
 * POST /api/payments/webhook
 */
export const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const body = req.body;

  // Verify webhook signature
  const isValid = paystackService.verifyWebhookSignature(signature, body);

  if (!isValid) {
    console.error('Invalid webhook signature');
    throw new ApiError(401, 'Invalid webhook signature');
  }

  const event = body.event;
  const data = body.data;

  console.log(`📥 Webhook received: ${event}`);

  // Handle different webhook events
  switch (event) {
    case 'charge.success':
      await handleChargeSuccess(data);
      break;
    
    case 'charge.failed':
      await handleChargeFailed(data);
      break;
    
    case 'transfer.success':
    case 'transfer.failed':
      console.log(`Transfer event: ${event}`);
      break;
    
    default:
      console.log(`Unhandled webhook event: ${event}`);
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ success: true });
});

/**
 * Handle successful charge webhook
 */
async function handleChargeSuccess(data) {
  const reference = data.reference;
  const amount = data.amount / 100; // Convert from pesewas to GHS

  try {
    // Update payment status
    const paymentResult = await pool.query(
      `UPDATE payments 
       SET status = 'completed',
           provider_response = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE reference = $2
       RETURNING sale_id`,
      [JSON.stringify(data), reference]
    );

    if (paymentResult.rowCount > 0) {
      const saleId = paymentResult.rows[0].sale_id;

      // Update sale status
      await pool.query(
        `UPDATE sales 
         SET status = 'completed' 
         WHERE id = $1`,
        [saleId]
      );

      console.log(`✅ Payment completed: ${reference} for sale ${saleId}`);
    }
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

/**
 * Handle failed charge webhook
 */
async function handleChargeFailed(data) {
  const reference = data.reference;

  try {
    await pool.query(
      `UPDATE payments 
       SET status = 'failed',
           provider_response = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE reference = $2`,
      [JSON.stringify(data), reference]
    );

    console.log(`❌ Payment failed: ${reference}`);
  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

/**
 * Get payment by sale ID
 * GET /api/payments/sale/:saleId
 */
export const getPaymentBySaleId = asyncHandler(async (req, res) => {
  const { saleId } = req.params;

  const result = await pool.query(
    `SELECT 
      id, sale_id, amount, payment_method, status, 
      reference, customer_phone, customer_email, 
      provider, created_at, updated_at
     FROM payments 
     WHERE sale_id = $1`,
    [saleId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Payment not found for this sale');
  }

  res.status(200).json({
    success: true,
    payment: result.rows[0]
  });
});

/**
 * Check payment status (polling endpoint)
 * GET /api/payments/status/:reference
 */
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const result = await pool.query(
    'SELECT status, amount, payment_method, updated_at FROM payments WHERE reference = $1',
    [reference]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Payment not found');
  }

  const payment = result.rows[0];

  // If still pending, check with Paystack
  if (payment.status === 'pending') {
    try {
      const verification = await paystackService.verifyTransaction(reference);
      
      if (verification.status !== 'pending') {
        const newStatus = verification.success ? 'completed' : 'failed';
        
        await pool.query(
          'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE reference = $2',
          [newStatus, reference]
        );

        payment.status = newStatus;
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  }

  res.status(200).json({
    success: true,
    status: payment.status,
    amount: payment.amount,
    paymentMethod: payment.payment_method,
    lastUpdated: payment.updated_at
  });
});
