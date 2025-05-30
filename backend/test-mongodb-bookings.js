import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Bookings...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://krishanttanti:8y30NQRQVNCYayGS@cluster0.mlp9lvu.mongodb.net/')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const bookings = await Booking.find({}).limit(10);
    console.log(`📋 Found ${bookings.length} bookings in database:`);
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. PNR: ${booking.pnrNumber} | Train: ${booking.trainDetails.name} | Amount: ₹${booking.totalFare} | Status: ${booking.status}`);
    });
    
    if (bookings.length === 0) {
      console.log('ℹ️  No bookings found in database');
    }
    
    await mongoose.connection.close();
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 