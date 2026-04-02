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
  const { saleId, amount, phone, email, provider } = req.body;

  // Validation
  if (!amount || !phone) {
    throw new ApiError(400, 'Amount and phone number are required');
  }

  // If saleId provided, verify sale exists
  if (saleId) {
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
  }

  try {
    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeMobileMoneyTransaction({
      amount,
      phone,
      email,
      provider: provider || 'mtn', // Use provided network or default to MTN
      saleId: saleId || `temp-${Date.now()}`,
      metadata: {
        user_id: req.user?.userId,
        cashier: req.user?.username || 'system',
        has_sale: !!saleId
      }
    });

    // Create or update payment record with pending status (only if saleId exists)
    if (saleId) {
      await pool.query(
        `INSERT INTO payments 
          (sale_id, amount_paid, amount_received, method, status, reference, customer_phone, customer_email, provider, provider_response)
         VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (sale_id) 
         DO UPDATE SET
           amount_paid = EXCLUDED.amount_paid,
           amount_received = EXCLUDED.amount_received,
           method = EXCLUDED.method,
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
    }

    res.status(200).json({
      success: true,
      message: paystackResponse.data.status === 'send_otp' 
        ? 'Customer will receive SMS with code. Enter the code to complete payment.'
        : 'Customer should approve payment on their phone.',
      payment: {
        id: saleId || null,
        reference: paystackResponse.reference,
        status: 'pending',
        amount: amount,
        requiresOTP: paystackResponse.data.status === 'send_otp',
        chargeStatus: paystackResponse.data.status
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
      id, sale_id, amount_paid as amount, method as payment_method, status, 
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
 * Submit OTP for Mobile Money payment
 * POST /api/payments/momo/submit-otp
 */
export const submitMoMoOTP = asyncHandler(async (req, res) => {
  const { reference, otp } = req.body;

  if (!reference || !otp) {
    throw new ApiError(400, 'Reference and OTP are required');
  }

  try {
    // Submit OTP to Paystack
    const result = await paystackService.submitOTP(reference, otp);

    console.log('📤 OTP submitted, waiting 5 seconds before verification...');
    
    // Wait 5 seconds to give Paystack time to process
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify the transaction to get final status
    const verification = await paystackService.verifyTransaction(reference);

    console.log('✅ Verification after OTP:', verification.status);

    // Update payment record if exists
    const paymentResult = await pool.query(
      'SELECT sale_id FROM payments WHERE reference = $1',
      [reference]
    );

    if (paymentResult.rowCount > 0) {
      const saleId = paymentResult.rows[0].sale_id;
      const newStatus = verification.success ? 'completed' : verification.status;

      await pool.query(
        `UPDATE payments 
         SET status = $1, 
             provider_response = $2,
             updated_at = CURRENT_TIMESTAMP 
         WHERE reference = $3`,
        [newStatus, JSON.stringify(verification.fullResponse), reference]
      );

      // Update sale status if payment successful
      if (verification.success && saleId) {
        await pool.query(
          `UPDATE sales SET status = 'completed' WHERE id = $1`,
          [saleId]
        );
      }
    }

    res.status(200).json({
      success: verification.success,
      status: verification.status,
      message: verification.success 
        ? 'Payment completed successfully! 🎉' 
        : verification.status === 'pending'
        ? 'Payment is being processed. Please wait...'
        : `Payment ${verification.status}. ${verification.fullResponse?.gateway_response || 'Please try again.'}`,
      payment: {
        reference: reference,
        amount: verification.amount,
        status: verification.status,
        paidAt: verification.paidAt,
        gatewayResponse: verification.fullResponse?.gateway_response
      }
    });

  } catch (error) {
    console.error('OTP submission error:', error);
    throw new ApiError(500, error.message || 'Failed to submit OTP');
  }
});
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  // First, try to verify with Paystack directly
  try {
    const verification = await paystackService.verifyTransaction(reference);
    
    // Check if we have a payment record in database
    const result = await pool.query(
      'SELECT status, amount_paid as amount, method as payment_method, updated_at FROM payments WHERE reference = $1',
      [reference]
    );

    let currentStatus = verification.status;
    
    // If payment exists in DB, update it
    if (result.rowCount > 0) {
      const payment = result.rows[0];
      
      // If status changed, update database
      if (payment.status !== verification.status) {
        const newStatus = verification.success ? 'completed' : 'failed';
        
        await pool.query(
          'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE reference = $2',
          [newStatus, reference]
        );
        
        currentStatus = newStatus;
      } else {
        currentStatus = payment.status;
      }
    }

    res.status(200).json({
      success: true,
      status: currentStatus,
      amount: verification.amount,
      paymentMethod: 'mobile_money',
      lastUpdated: new Date().toISOString(),
      paystackStatus: verification.status,
      verified: verification.success
    });
  } catch (error) {
    console.error('Status check error:', error);
    
    // If Paystack verification fails, check database only
    const result = await pool.query(
      'SELECT status, amount_paid as amount, method as payment_method, updated_at FROM payments WHERE reference = $1',
      [reference]
    );

    if (result.rowCount === 0) {
      // No record found - payment might still be pending
      res.status(200).json({
        success: true,
        status: 'pending',
        amount: 0,
        paymentMethod: 'mobile_money',
        lastUpdated: new Date().toISOString()
      });
      return;
    }

    const payment = result.rows[0];
    res.status(200).json({
      success: true,
      status: payment.status,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      lastUpdated: payment.updated_at
    });
  }
});
