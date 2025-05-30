import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/booking.model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Temporary storage for bookings (in a real app, use a database)
let confirmedBookings = [];

const router = express.Router();

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      console.log('✅ Authenticated user:', req.userId);
    } else {
      req.userId = null;
      console.log('⚠️ No authentication token provided');
    }
    next();
  } catch (err) {
    req.userId = null;
    console.log('❌ Authentication failed:', err.message);
    next();
  }
};

// Initialize Razorpay instance
console.log('🔑 Initializing Razorpay with:');
console.log('KEY_ID:', process.env.RAZORPAY_KEY_ID || 'rzp_test_QJeBfRrPaUZCpx');
console.log('KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_QJeBfRrPaUZCpx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'yKFiRVMjAX6VnKbhfXVlA3vW',
});

// Function to generate PDF ticket and save it
const generateTicketPDF = async (booking, mongoBooking) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'tickets');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate filename
      const filename = `BookXpress_Ticket_${booking.pnr}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add BookXpress header
      doc.fontSize(24)
         .fillColor('#3b63f7')
         .text('BookXpress', 50, 50);
      
      doc.fontSize(20)
         .fillColor('#000000')
         .text('Train Ticket', 50, 80);
      
      // Add a line separator
      doc.moveTo(50, 110)
         .lineTo(550, 110)
         .stroke();
      
      // Booking Information
      doc.fontSize(16)
         .fillColor('#333333')
         .text('Booking Information', 50, 130);
      
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`PNR Number: ${booking.pnr}`, 50, 155)
         .text(`Booking ID: ${mongoBooking._id}`, 50, 175)
         .text(`Status: ${mongoBooking.status}`, 50, 195)
         .text(`Booking Date: ${new Date().toLocaleDateString()}`, 50, 215);
      
      // Train Details
      doc.fontSize(16)
         .fillColor('#333333')
         .text('Train Details', 50, 250);
      
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`Train Name: ${mongoBooking.trainDetails.name}`, 50, 275)
         .text(`Train Number: ${mongoBooking.trainDetails.trainId}`, 50, 295)
         .text(`From: ${mongoBooking.trainDetails.fromStation}`, 50, 315)
         .text(`To: ${mongoBooking.trainDetails.toStation}`, 50, 335)
         .text(`Journey Date: ${new Date(mongoBooking.trainDetails.journeyDate).toLocaleDateString()}`, 50, 355)
         .text(`Class: ${mongoBooking.trainDetails.selectedClass}`, 50, 375)
         .text(`Departure: ${mongoBooking.trainDetails.departureTime}`, 50, 395)
         .text(`Arrival: ${mongoBooking.trainDetails.arrivalTime}`, 50, 415);
      
      // Passenger Details
      doc.fontSize(16)
         .fillColor('#333333')
         .text('Passenger Details', 50, 450);
      
      let yPosition = 475;
      mongoBooking.passengers.forEach((passenger, index) => {
        doc.fontSize(12)
           .fillColor('#000000')
           .text(`${index + 1}. ${passenger.name} (Age: ${passenger.age}, Gender: ${passenger.gender})`, 50, yPosition);
        yPosition += 20;
      });
      
      // Payment Information
      yPosition += 20;
      doc.fontSize(16)
         .fillColor('#333333')
         .text('Payment Information', 50, yPosition);
      
      yPosition += 25;
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`Total Amount: ₹${mongoBooking.totalFare}`, 50, yPosition)
         .text(`Payment ID: ${mongoBooking.paymentDetails.transactionId}`, 50, yPosition + 20)
         .text(`Payment Status: ${mongoBooking.paymentDetails.status}`, 50, yPosition + 40)
         .text(`Payment Date: ${new Date(mongoBooking.paymentDetails.paymentDate).toLocaleDateString()}`, 50, yPosition + 60);
      
      // Add footer
      yPosition += 120;
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Thank you for choosing BookXpress!', 50, yPosition)
         .text('For support, contact us at support@bookxpress.com', 50, yPosition + 15)
         .text('This is a computer-generated ticket. Please carry this along with a valid ID proof.', 50, yPosition + 30);
      
      // Add QR code placeholder
      doc.rect(450, 130, 100, 100)
         .stroke();
      doc.fontSize(10)
         .text('QR Code', 485, 175);
      
      // Finalize the PDF
      doc.end();

      // Wait for the stream to finish
      stream.on('finish', () => {
        resolve(`/uploads/tickets/${filename}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

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
router.post('/verify-payment', authenticate, async (req, res) => {
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

    // Store the booking in our temporary array (for backward compatibility)
    confirmedBookings.push(booking);
    
    // Also save to MongoDB database for My Bookings functionality
    try {
      const mongoBooking = new Booking({
        userId: req.userId ? new mongoose.Types.ObjectId(req.userId) : new mongoose.Types.ObjectId(), // Use authenticated user ID
        trainDetails: {
          trainId: bookingData.train.id || bookingData.train.trainNumber || '12951',
          name: bookingData.train.name || 'Train Booking',
          number: bookingData.train.trainNumber || bookingData.train.id || '12951',
          fromStation: bookingData.train.from || 'Unknown',
          toStation: bookingData.train.to || 'Unknown',
          journeyDate: new Date(bookingData.travelDate || '2025-05-30'),
          departureTime: bookingData.train.departure || '16:55',
          arrivalTime: bookingData.train.arrival || '08:35',
          selectedClass: bookingData.selectedClass || '3A'
        },
        passengers: bookingData.passengers.map(p => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seatNumber: null
        })),
        totalFare: bookingData.totalAmount,
        paymentDetails: {
          transactionId: razorpay_payment_id,
          paymentGateway: 'Razorpay',
          amount: bookingData.totalAmount,
          currency: 'INR',
          status: 'SUCCESSFUL',
          paymentDate: new Date()
        },
        status: 'CONFIRMED',
        pnrNumber: booking.pnr
      });

      await mongoBooking.save();
      console.log('✅ Booking saved to MongoDB for user:', req.userId, 'Booking ID:', mongoBooking._id);
      
      // Add MongoDB ID to response
      booking.mongoId = mongoBooking._id;
      
      // Generate and save PDF ticket
      try {
        const ticketPDFUrl = await generateTicketPDF(booking, mongoBooking);
        
        // Update the booking with the PDF URL
        mongoBooking.ticketPDFUrl = ticketPDFUrl;
        await mongoBooking.save();
        
        booking.ticketPDF = ticketPDFUrl;
        console.log('✅ PDF ticket generated and saved:', ticketPDFUrl);
        
      } catch (pdfError) {
        console.error('❌ Error generating PDF ticket:', pdfError);
        // Don't fail the booking if PDF generation fails
      }
      
    } catch (mongoError) {
      console.error('❌ Error saving to MongoDB:', mongoError);
      // Don't fail the entire request if MongoDB save fails
    }
    
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
    
    // Parse the webhook payload - handle both string and buffer
    let webhookBody;
    if (Buffer.isBuffer(req.body)) {
      webhookBody = req.body.toString('utf8');
    } else if (typeof req.body === 'string') {
      webhookBody = req.body;
    } else {
      webhookBody = JSON.stringify(req.body);
    }
    
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    console.log('📄 Webhook signature:', webhookSignature);
    console.log('📄 Webhook body:', webhookBody);
    
    // Verify webhook signature (optional but recommended)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '12345678';
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
    let payload;
    try {
      payload = JSON.parse(webhookBody);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError.message);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    
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
      
      // Also save to MongoDB for My Bookings functionality
      try {
        const mongoBooking = new Booking({
          userId: new mongoose.Types.ObjectId(), // Create a placeholder ObjectId for webhook bookings
          trainDetails: {
            trainId: payment.notes?.trainNumber || payment.order_id,
            name: payment.notes?.trainName || 'Train Booking via Webhook',
            number: payment.notes?.trainNumber || '12951',
            fromStation: payment.notes?.from || 'NEW DELHI',
            toStation: payment.notes?.to || 'CHHATRAPATI SHIVAJI TERMINUS',
            journeyDate: new Date(payment.notes?.journeyDate || '2025-05-30'),
            departureTime: payment.notes?.departureTime || '16:55',
            arrivalTime: payment.notes?.arrivalTime || '08:35',
            selectedClass: payment.notes?.class || '3A'
          },
          passengers: [
            {
              name: payment.notes?.passengerName || 'Webhook Passenger',
              age: parseInt(payment.notes?.passengerAge) || 25,
              gender: payment.notes?.passengerGender || 'Male',
              seatNumber: null
            }
          ],
          totalFare: payment.amount / 100,
          paymentDetails: {
            transactionId: payment.id,
            paymentGateway: 'Razorpay',
            amount: payment.amount / 100,
            currency: payment.currency,
            status: 'SUCCESSFUL',
            paymentDate: new Date(payment.created_at * 1000)
          },
          status: 'CONFIRMED',
          pnrNumber: newBooking.id
        });

        await mongoBooking.save();
        console.log('✅ Webhook booking saved to MongoDB:', mongoBooking._id);
        
      } catch (mongoError) {
        console.error('❌ Error saving webhook booking to MongoDB:', mongoError);
      }
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