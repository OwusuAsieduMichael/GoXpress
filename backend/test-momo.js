/**
 * Test Mobile Money Integration with Paystack
 * Run: node test-momo.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Test phone number - REPLACE THIS WITH YOUR ACTUAL PHONE NUMBER
const TEST_PHONE = process.argv[2] || '+233244123456'; // Pass phone as argument: node test-momo.js 0244123456
const TEST_AMOUNT = 100; // 1 GHS in pesewas

// Format phone number
function formatPhone(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('233')) {
    cleaned = '233' + cleaned;
  }
  return '+' + cleaned;
}

async function testMobileMoneyCharge() {
  console.log('🧪 Testing Paystack Mobile Money Integration\n');
  
  const formattedPhone = formatPhone(TEST_PHONE);
  
  console.log('📋 Configuration:');
  console.log(`   Secret Key: ${PAYSTACK_SECRET_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   Phone (original): ${TEST_PHONE}`);
  console.log(`   Phone (formatted): ${formattedPhone}`);
  console.log(`   Amount: GH₵ ${TEST_AMOUNT / 100}\n`);

  if (!PAYSTACK_SECRET_KEY) {
    console.error('❌ PAYSTACK_SECRET_KEY not found in .env file');
    process.exit(1);
  }

  const reference = `TEST-${Date.now()}`;
  
  const payload = {
    email: `test${Date.now()}@goxpress.com`,
    amount: TEST_AMOUNT,
    currency: 'GHS',
    reference: reference,
    mobile_money: {
      phone: formattedPhone,
      provider: 'mtn'
    },
    metadata: {
      test: true,
      description: 'Test Mobile Money charge'
    }
  };

  try {
    console.log('📤 Sending charge request to Paystack...\n');
    
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/charge`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Paystack Response:\n');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n📊 Key Information:');
    console.log(`   Status: ${response.data.data?.status}`);
    console.log(`   Reference: ${response.data.data?.reference}`);
    console.log(`   Display Text: ${response.data.data?.display_text || 'N/A'}`);
    console.log(`   Message: ${response.data.message}`);

    if (response.data.data?.status === 'send_otp') {
      console.log('\n✉️  Customer should receive SMS with OTP code');
      console.log('   Check your phone for the message');
    } else if (response.data.data?.status === 'pay_offline') {
      console.log('\n📱 Customer should receive payment prompt');
    } else {
      console.log(`\n⚠️  Unexpected status: ${response.data.data?.status}`);
    }

  } catch (error) {
    console.error('❌ ERROR! Paystack returned an error:\n');
    
    if (error.response) {
      console.log(JSON.stringify(error.response.data, null, 2));
      console.log('\n📋 Error Details:');
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message}`);
      
      if (error.response.data?.message?.includes('not enabled')) {
        console.log('\n💡 SOLUTION:');
        console.log('   Mobile Money is not enabled on your Paystack account.');
        console.log('   Steps to fix:');
        console.log('   1. Log in to https://dashboard.paystack.com');
        console.log('   2. Go to Settings → Payment Methods');
        console.log('   3. Enable Mobile Money for Ghana');
        console.log('   4. Complete any required verification');
      }
    } else {
      console.error(error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testMobileMoneyCharge();
