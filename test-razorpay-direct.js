import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

console.log('Testing Razorpay configuration...');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_hwRfIuKJQudGqL',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'n3kpcHbWeiCBhZX9Wy4Rl1B5',
});

const testOrder = async () => {
  try {
    const options = {
      amount: 100 * 100, // ₹100 in paisa
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
    };

    console.log('Creating test order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('✅ Success! Order created:', order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('Error code:', error.error?.code);
    console.error('Error description:', error.error?.description);
  }
};

testOrder(); 