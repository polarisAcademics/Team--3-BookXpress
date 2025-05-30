import fetch from 'node-fetch';

const testPaymentVerification = async () => {
  console.log('🧪 Testing Payment Verification Flow...');
  
  const paymentData = {
    razorpay_order_id: "order_test_new_booking",
    razorpay_payment_id: "pay_test_new_booking", 
    razorpay_signature: "test_signature",
    bookingData: {
      train: {
        id: "12951",
        name: "Mumbai Rajdhani Express",
        from: "New Delhi", 
        to: "Mumbai Central",
        departure: "16:55",
        arrival: "08:35+1"
      },
      selectedClass: "3A",
      passengers: [
        {name: "Test User", age: 30, gender: "Male"}
      ],
      totalAmount: 2100,
      travelDate: "2025-05-31"
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/payment/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment verification response:', result);
      if (result.booking) {
        console.log('📋 Booking created:');
        console.log('   PNR:', result.booking.pnr);
        console.log('   Status:', result.booking.status);
        console.log('   Amount: ₹' + result.booking.totalAmount);
      }
    } else {
      console.log('❌ Payment verification failed:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testPaymentVerification(); 