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

// Authentic Razorpay Webhook endpoint - handles standard payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('🔔 Razorpay Webhook received');
    
    // Parse the webhook payload
    const webhookBody = req.body.toString();
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    console.log('📄 Webhook signature:', webhookSignature);
    console.log('📄 Webhook body:', webhookBody);
    
    // Verify webhook signature (optional but recommended)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && webhookSignature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');
      
      if (expectedSignature !== webhookSignature) {
        console.log('❌ Webhook signature verification failed');
        return res.status(400).json({ error: 'Invalid signature' });
      }
      console.log('✅ Webhook signature verified');
    }
    
    // Parse the JSON payload
    const payload = JSON.parse(webhookBody);
    const { event, payload: eventPayload } = payload;
    
    console.log(`📥 Webhook Event: ${event}`);
    console.log('📄 Event payload:', JSON.stringify(eventPayload, null, 2));
    
    // Handle different Razorpay webhook events
    switch (event) {
      case 'payment.captured':
        console.log('💰 Payment captured - processing...');
        await handlePaymentCaptured(eventPayload.payment.entity);
        break;
        
      case 'payment.failed':
        console.log('❌ Payment failed - processing...');
        await handlePaymentFailed(eventPayload.payment.entity);
        break;
        
      case 'payment.authorized':
        console.log('🔐 Payment authorized - processing...');
        await handlePaymentAuthorized(eventPayload.payment.entity);
        break;
        
      case 'order.paid':
        console.log('📋 Order paid - processing...');
        await handleOrderPaid(eventPayload.order.entity);
        break;
        
      case 'refund.created':
        console.log('💸 Refund created - processing...');
        await handleRefundCreated(eventPayload.refund.entity);
        break;
        
      case 'refund.processed':
        console.log('✅ Refund processed - processing...');
        await handleRefundProcessed(eventPayload.refund.entity);
        break;
        
      default:
        console.log(`ℹ️ Unhandled webhook event: ${event}`);
    }
    
    // Always respond with success to acknowledge receipt
    res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully',
      event: event
    });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Handle payment.captured event
async function handlePaymentCaptured(payment) {
  try {
    console.log(`💰 Processing payment.captured: ${payment.id}`);
    
    // Find booking by order_id and update status
    const booking = confirmedBookings.find(b => 
      b.orderId === payment.order_id || 
      b.paymentId === payment.id
    );
    
    if (booking) {
      booking.status = 'CONFIRMED';
      booking.paymentStatus = 'COMPLETED';
      booking.paymentId = payment.id;
      booking.capturedAt = new Date();
      booking.amount = payment.amount / 100; // Convert from paisa to rupees
      
      console.log(`✅ Booking confirmed via webhook: ${booking.id}`);
    } else {
      // Create new booking from payment data if not found
      const newBooking = {
        id: generatePNR(),
        orderId: payment.order_id,
        paymentId: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        method: payment.method,
        capturedAt: new Date(),
        createdAt: new Date(),
        source: 'webhook_payment_captured'
      };
      
      confirmedBookings.push(newBooking);
      console.log(`✅ New booking created from webhook: ${newBooking.id}`);
    }

  } catch (error) {
    console.error('❌ Error handling payment.captured:', error);
    throw error;
  }
}

// Handle payment.failed event
async function handlePaymentFailed(payment) {
  try {
    console.log(`❌ Processing payment.failed: ${payment.id}`);
    
    // Find booking by order_id and update status
    const booking = confirmedBookings.find(b => 
      b.orderId === payment.order_id || 
      b.paymentId === payment.id
    );
    
    if (booking) {
      booking.status = 'FAILED';
      booking.paymentStatus = 'FAILED';
      booking.paymentId = payment.id;
      booking.failedAt = new Date();
      booking.errorCode = payment.error_code;
      booking.errorDescription = payment.error_description;
      
      console.log(`❌ Booking failed via webhook: ${booking.id}`);
    }

  } catch (error) {
    console.error('❌ Error handling payment.failed:', error);
    throw error;
  }
}

// Handle payment.authorized event
async function handlePaymentAuthorized(payment) {
  try {
    console.log(`🔐 Processing payment.authorized: ${payment.id}`);
    
    // Find booking by order_id and update status
    const booking = confirmedBookings.find(b => 
      b.orderId === payment.order_id
    );
    
    if (booking) {
      booking.status = 'AUTHORIZED';
      booking.paymentStatus = 'AUTHORIZED';
      booking.paymentId = payment.id;
      booking.authorizedAt = new Date();
      
      console.log(`🔐 Booking authorized via webhook: ${booking.id}`);
    }

  } catch (error) {
    console.error('❌ Error handling payment.authorized:', error);
    throw error;
  }
}

// Handle order.paid event
async function handleOrderPaid(order) {
  try {
    console.log(`📋 Processing order.paid: ${order.id}`);
    
    // Find booking by order_id and update status
    const booking = confirmedBookings.find(b => b.orderId === order.id);
    
    if (booking) {
      booking.status = 'PAID';
      booking.paymentStatus = 'COMPLETED';
      booking.paidAt = new Date();
      booking.amountPaid = order.amount_paid / 100;
      
      console.log(`📋 Order marked as paid via webhook: ${booking.id}`);
    }

  } catch (error) {
    console.error('❌ Error handling order.paid:', error);
    throw error;
  }
}

// Handle refund.created event
async function handleRefundCreated(refund) {
  try {
    console.log(`💸 Processing refund.created: ${refund.id}`);
    
    // Find booking by payment_id and update status
    const booking = confirmedBookings.find(b => b.paymentId === refund.payment_id);
    
    if (booking) {
      booking.refundStatus = 'INITIATED';
      booking.refundId = refund.id;
      booking.refundAmount = refund.amount / 100;
      booking.refundInitiatedAt = new Date();
      
      console.log(`💸 Refund initiated for booking: ${booking.id}`);
    }

  } catch (error) {
    console.error('❌ Error handling refund.created:', error);
    throw error;
  }
}

// Handle refund.processed event
async function handleRefundProcessed(refund) {
  try {
    console.log(`✅ Processing refund.processed: ${refund.id}`);
    
    // Find booking by refund_id and update status
    const booking = confirmedBookings.find(b => b.refundId === refund.id);
    
    if (booking) {
      booking.refundStatus = 'COMPLETED';
      booking.refundProcessedAt = new Date();
      booking.status = 'REFUNDED';
      
      console.log(`✅ Refund completed for booking: ${booking.id}`);
    }

  } catch (error) {
    console.error('❌ Error handling refund.processed:', error);
    throw error;
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