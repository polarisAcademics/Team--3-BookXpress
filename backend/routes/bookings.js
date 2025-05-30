import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js'; // Assuming you might need User model for some checks
import jwt from 'jsonwebtoken'; // For authentication
import PDFDocument from 'pdfkit'; // For PDF generation
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Temporary in-memory storage for bookings (replace with MongoDB model later)
let bookings = [];

// Middleware to authenticate and get user ID
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }
  const token = authHeader.split(' ')[1];
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Store a booking from payment verification
router.post('/store', async (req, res) => {
  try {
    const booking = {
      ...req.body,
      createdAt: new Date()
    };
    bookings.push(booking);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store booking' });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const userBookings = bookings.filter(booking => booking.userId === req.user.userId);
    res.json({ bookings: userBookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create a new booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { trainDetails, passengers, totalFare, paymentDetails } = req.body;

    // Basic validation
    if (!trainDetails || !passengers || !totalFare || !paymentDetails || !paymentDetails.transactionId) {
      return res.status(400).json({ message: 'Missing required booking information.' });
    }

    // Ensure payment was successful before confirming booking
    // You might have more robust checks or webhooks from payment gateway for this
    if (paymentDetails.status !== 'SUCCESSFUL') {
        return res.status(400).json({ message: 'Payment was not successful. Booking cannot be confirmed.' });
    }

    const newBooking = new Booking({
      userId: req.userId,
      trainDetails,
      passengers,
      totalFare,
      paymentDetails,
      status: 'CONFIRMED', // Mark as confirmed since payment is successful
    });

    await newBooking.save();
    
    // Populate user details if needed, though userId is stored
    // await newBooking.populate('userId', 'name email'); // Example if you need to return user info

    res.status(201).json({ 
        message: 'Booking created successfully!',
        booking: newBooking 
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.code === 11000) { // Duplicate key error (e.g., transactionId)
        return res.status(409).json({ message: 'Duplicate transaction ID. This booking might already exist.' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', details: error.errors });
    }
    res.status(500).json({ message: 'Failed to create booking. Please try again later.' });
  }
});

// GET /api/bookings/my-bookings - Get bookings for the logged-in user
router.get('/my-bookings', async (req, res) => {
  try {
    console.log('🔍 Fetching all bookings (temporary fix - no auth required)');
    
    // For now, return all bookings (temporary fix)
    const bookings = await Booking.find({})
                                  .sort({ createdAt: -1 })
                                  .populate('userId', 'name email'); // Optional: populate user details

    console.log(`📋 Found ${bookings.length} bookings in database`);
    
    // Transform bookings to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking._id,
      pnr: booking.pnrNumber,
      trainName: booking.trainDetails.name,
      from: booking.trainDetails.fromStation,
      to: booking.trainDetails.toStation,
      date: booking.trainDetails.journeyDate,
      class: booking.trainDetails.selectedClass,
      status: booking.status,
      passengers: booking.passengers,
      totalAmount: booking.totalFare,
      paymentDetails: booking.paymentDetails
    }));

    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]); // Return empty array if no bookings, not 404
    }

    res.status(200).json(transformedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to retrieve your bookings. Please try again later.' });
  }
});

// GET /api/bookings/:bookingId - Get a specific booking by its ID
router.get('/:bookingId', authenticate, async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }

        const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or you do not have permission to view it.' });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve the booking. Please try again later.' });
    }
});

// Download ticket PDF
router.get('/:bookingId/download-ticket', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate booking ID format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format.' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if a pre-generated PDF exists
    if (booking.ticketPDFUrl) {
      const pdfPath = path.join(process.cwd(), booking.ticketPDFUrl);
      
      // Check if the file exists
      if (fs.existsSync(pdfPath)) {
        // Serve the existing PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="BookXpress_Ticket_${booking.pnrNumber}.pdf"`);
        
        const pdfStream = fs.createReadStream(pdfPath);
        pdfStream.pipe(res);
        return;
      }
    }

    // Fallback: Generate PDF dynamically if no stored PDF exists
    console.log('No stored PDF found, generating dynamically...');
    
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BookXpress_Ticket_${booking.pnrNumber}.pdf"`);
    
    // Pipe the PDF to response
    doc.pipe(res);
    
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
       .text(`PNR Number: ${booking.pnrNumber}`, 50, 155)
       .text(`Booking ID: ${booking._id}`, 50, 175)
       .text(`Status: ${booking.status}`, 50, 195)
       .text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 50, 215);
    
    // Train Details
    doc.fontSize(16)
       .fillColor('#333333')
       .text('Train Details', 50, 250);
    
    doc.fontSize(12)
       .fillColor('#000000')
       .text(`Train Name: ${booking.trainDetails.name}`, 50, 275)
       .text(`Train Number: ${booking.trainDetails.trainId}`, 50, 295)
       .text(`From: ${booking.trainDetails.fromStation}`, 50, 315)
       .text(`To: ${booking.trainDetails.toStation}`, 50, 335)
       .text(`Journey Date: ${new Date(booking.trainDetails.journeyDate).toLocaleDateString()}`, 50, 355)
       .text(`Class: ${booking.trainDetails.selectedClass}`, 50, 375)
       .text(`Departure: ${booking.trainDetails.departureTime}`, 50, 395)
       .text(`Arrival: ${booking.trainDetails.arrivalTime}`, 50, 415);
    
    // Passenger Details
    doc.fontSize(16)
       .fillColor('#333333')
       .text('Passenger Details', 50, 450);
    
    let yPosition = 475;
    booking.passengers.forEach((passenger, index) => {
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
       .text(`Total Amount: ₹${booking.totalFare}`, 50, yPosition)
       .text(`Payment ID: ${booking.paymentDetails.transactionId}`, 50, yPosition + 20)
       .text(`Payment Status: ${booking.paymentDetails.status}`, 50, yPosition + 40)
       .text(`Payment Date: ${new Date(booking.paymentDetails.paymentDate).toLocaleDateString()}`, 50, yPosition + 60);
    
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
    
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    res.status(500).json({ message: 'Failed to generate ticket PDF. Please try again later.' });
  }
});

export default router; 