import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    
    if (!this.secretKey) {
      console.warn('⚠️  PAYSTACK_SECRET_KEY not configured. Payment features will not work.');
    }
  }

  /**
   * Format phone number to Ghana international format
   * @param {string} phone - Phone number (e.g., 0244123456)
   * @returns {string} - Formatted phone (+233244123456)
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    }
    
    // If doesn't start with 233, add it
    if (!cleaned.startsWith('233')) {
      cleaned = '233' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Convert amount to pesewas (Paystack uses smallest currency unit)
   * @param {number} amount - Amount in GHS
   * @returns {number} - Amount in pesewas
   */
  convertToPesewas(amount) {
    return Math.round(parseFloat(amount) * 100);
  }

  /**
   * Generate a unique transaction reference
   * @returns {string} - Unique reference
   */
  generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `GXP-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Initialize Mobile Money transaction (Direct Charge)
   * This sends OTP to customer's phone
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} - Paystack response
   */
  async initializeMobileMoneyTransaction(data) {
    const { amount, phone, email, provider, saleId, metadata = {} } = data;

    if (!this.secretKey) {
      throw new Error('Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.');
    }

    // Format data
    const formattedPhone = this.formatPhoneNumber(phone);
    const amountInPesewas = this.convertToPesewas(amount);
    const reference = this.generateReference();
    
    // Generate email if not provided (use a valid domain)
    const customerEmail = email || `customer${Date.now()}@goxpress.com`;

    // Use the CHARGE endpoint for direct Mobile Money charging
    const payload = {
      email: customerEmail,
      amount: amountInPesewas,
      currency: 'GHS',
      reference: reference,
      mobile_money: {
        phone: formattedPhone,
        provider: provider || 'mtn' // Use provided network or default to MTN
      },
      metadata: {
        sale_id: saleId,
        phone: formattedPhone,
        provider: provider || 'mtn',
        custom_fields: [
          {
            display_name: 'Sale ID',
            variable_name: 'sale_id',
            value: saleId
          }
        ],
        ...metadata
      }
    };

    try {
      console.log('📤 Sending charge request to Paystack:', {
        amount: amountInPesewas,
        phone: formattedPhone,
        provider: provider || 'mtn',
        reference: reference
      });

      // Use /charge endpoint for direct charge
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/charge`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Paystack charge response:', JSON.stringify(response.data, null, 2));
      console.log('📊 Charge status:', response.data.data?.status);
      console.log('📊 Display text:', response.data.data?.display_text);

      return {
        success: true,
        data: response.data.data,
        reference: reference,
        message: 'Mobile Money charge initiated successfully'
      };
    } catch (error) {
      console.error('❌ Paystack charge error:', JSON.stringify(error.response?.data, null, 2) || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to initiate mobile money charge'
      );
    }
  }

  /**
   * Verify transaction status
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} - Transaction details
   */
  async verifyTransaction(reference) {
    if (!this.secretKey) {
      throw new Error('Paystack is not configured.');
    }

    try {
      console.log(`🔍 Verifying transaction: ${reference}`);
      
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      const data = response.data.data;
      
      console.log(`📊 Paystack verification response for ${reference}:`, {
        status: data.status,
        amount: data.amount,
        channel: data.channel,
        paid_at: data.paid_at
      });

      return {
        success: data.status === 'success',
        status: data.status,
        amount: data.amount / 100, // Convert back to GHS
        reference: data.reference,
        paidAt: data.paid_at,
        channel: data.channel,
        currency: data.currency,
        customer: {
          email: data.customer.email,
          phone: data.customer.phone
        },
        metadata: data.metadata,
        authorization: data.authorization,
        fullResponse: data
      };
    } catch (error) {
      console.error('❌ Paystack verification error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to verify payment'
      );
    }
  }

  /**
   * Verify webhook signature
   * @param {string} signature - Signature from webhook header
   * @param {Object} body - Webhook payload
   * @returns {boolean} - Is signature valid
   */
  verifyWebhookSignature(signature, body) {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || this.secretKey;
    
    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    return hash === signature;
  }

  /**
   * Submit OTP for Mobile Money charge
   * @param {string} reference - Transaction reference
   * @param {string} otp - OTP code from customer
   * @returns {Promise<Object>} - Submission response
   */
  async submitOTP(reference, otp) {
    if (!this.secretKey) {
      throw new Error('Paystack is not configured.');
    }

    try {
      console.log(`📤 Submitting OTP for transaction: ${reference}`);
      
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/charge/submit_otp`,
        {
          otp: otp,
          reference: reference
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ OTP submission response:', response.data);

      return {
        success: response.data.status,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OTP submission error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to submit OTP'
      );
    }
  }
}

export default new PaystackService();
