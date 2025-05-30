import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Temporary storage for bookings (in a real app, use a database)
let confirmedBookings = [];

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_hwRfIuKJQudGqL',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'n3kpcHbWeiCBhZX9Wy4Rl1B5',
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_hwRfIuKJQudGqL',
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
});

// Verify payment and create booking
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    // Verify the payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Payment verified successfully, create the booking
    const booking = {
      id: Date.now().toString(),
      pnr: generatePNR(),
      train: bookingData.train,
      selectedClass: bookingData.selectedClass,
      passengers: bookingData.passengers,
      contact: bookingData.contact,
      totalAmount: bookingData.totalAmount,
      appliedDiscount: bookingData.appliedDiscount,
      paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
      },
      status: 'Confirmed',
      createdAt: new Date(),
      travelDate: bookingData.travelDate,
    };

    // Store the booking in our temporary array
    // In a real app, you would save this to your database
    confirmedBookings.push(booking);
    
    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
});

// Get payment status
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
});

// Refund payment (for cancellations)
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason = 'requested_by_customer' } = req.body;
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paisa
      speed: 'normal',
      notes: {
        reason,
      },
    });

    res.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
});

// Get all confirmed bookings
router.get('/bookings', async (req, res) => {
  try {
    res.json({
      success: true,
      bookings: confirmedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
});

// RazorpayX Webhook endpoint - handles only available events
router.post('/webhook', express.json(), async (req, res) => {
  try {
    console.log('🔔 RazorpayX Webhook received');
    console.log('📄 Event:', req.body.event);
    console.log('📄 Payload:', JSON.stringify(req.body, null, 2));
    
    const { event, payload } = req.body;
    
    // Handle only the 4 available RazorpayX events
    switch (event) {
      case 'fund_account.validation.completed':
        console.log('✅ Fund account validation completed');
        // This indicates account is ready for transactions
        break;
        
      case 'transaction.created':
        console.log('💳 Transaction created - potential payment');
        await handleTransactionCreated(payload);
        break;
        
      case 'payout.processed':
        console.log('✅ Payout processed - payment success indicator');
        await handlePayoutProcessed(payload);
        break;
        
      case 'payout.rejected':
        console.log('❌ Payout rejected - payment failure indicator');
        await handlePayoutRejected(payload);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event: ${event}`);
    }
    
    // Always respond with success
    res.status(200).json({
      status: 'success',
      message: 'Webhook processed',
      event: event
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(200).json({
      status: 'error',
      message: 'Webhook processed with error',
      error: error.message
    });
  }
});

// Handle transaction.created event
async function handleTransactionCreated(payload) {
  try {
    console.log('📋 Processing transaction.created');
    
    if (payload && payload.transaction && payload.transaction.entity) {
      const transaction = payload.transaction.entity;
      
      // Create a simple booking record
      const booking = {
        id: generatePNR(),
        transactionId: transaction.id,
        amount: transaction.amount ? transaction.amount / 100 : 0,
        currency: transaction.currency || 'INR',
        status: 'PENDING',
        createdAt: new Date(),
        source: 'webhook_transaction'
      };
      
      // Add to temporary storage (you can enhance this later)
      confirmedBookings.push(booking);
      console.log(`✅ Booking created from transaction: ${booking.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error handling transaction.created:', error);
  }
}

// Handle payout.processed event
async function handlePayoutProcessed(payload) {
  try {
    console.log('✅ Processing payout.processed');
    
    if (payload && payload.payout && payload.payout.entity) {
      const payout = payload.payout.entity;
      
      // Find and update booking status to success
      const booking = confirmedBookings.find(b => 
        b.transactionId === payout.reference_id || 
        b.amount === (payout.amount / 100)
      );
      
      if (booking) {
        booking.status = 'CONFIRMED';
        booking.payoutId = payout.id;
        booking.updatedAt = new Date();
        console.log(`✅ Booking confirmed: ${booking.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling payout.processed:', error);
  }
}

// Handle payout.rejected event
async function handlePayoutRejected(payload) {
  try {
    console.log('❌ Processing payout.rejected');
    
    if (payload && payload.payout && payload.payout.entity) {
      const payout = payload.payout.entity;
      
      // Find and update booking status to failed
      const booking = confirmedBookings.find(b => 
        b.transactionId === payout.reference_id || 
        b.amount === (payout.amount / 100)
      );
      
      if (booking) {
        booking.status = 'FAILED';
        booking.payoutId = payout.id;
        booking.updatedAt = new Date();
        booking.failureReason = payout.failure_reason || 'Payout rejected';
        console.log(`❌ Booking failed: ${booking.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling payout.rejected:', error);
  }
}

// Helper function to generate PNR
function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default router; 