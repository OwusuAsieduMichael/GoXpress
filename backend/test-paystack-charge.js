import paystackService from './src/services/paystackService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testPaystackCharge() {
  console.log('🧪 Testing Paystack Mobile Money Charge\n');
  
  // Test data - REPLACE WITH REAL TEST NUMBER
  const testData = {
    amount: 1, // GHS 1.00 for testing
    phone: '0244123456', // REPLACE with actual test number
    email: 'test@goxpress.com',
    provider: 'mtn', // or 'vod' for Vodafone, 'tgo' for AirtelTigo
    saleId: 'TEST-' + Date.now()
  };

  console.log('📋 Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    console.log('📤 Initiating charge...\n');
    
    const result = await paystackService.initializeMobileMoneyTransaction(testData);
    
    console.log('\n✅ SUCCESS!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    console.log('\n');
    console.log('📱 Charge Status:', result.data.status);
    console.log('📝 Display Text:', result.data.display_text);
    console.log('🔑 Reference:', result.reference);
    
    if (result.data.status === 'send_otp') {
      console.log('\n⚠️  OTP REQUIRED');
      console.log('Customer should receive SMS with OTP code');
      console.log('Use this reference to submit OTP:', result.reference);
    } else if (result.data.status === 'pay_offline') {
      console.log('\n📲 DIRECT PROMPT');
      console.log('Customer should receive prompt on their phone');
      console.log('They need to enter their MoMo PIN to approve');
    } else {
      console.log('\n❓ Status:', result.data.status);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run the test
testPaystackCharge();
