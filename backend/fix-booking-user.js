import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Fixing latest booking user assignment...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const latestBooking = await Booking.findOne({}).sort({createdAt: -1});
    if (latestBooking) {
      console.log('📋 Latest booking PNR:', latestBooking.pnrNumber);
      console.log('🔄 Current user ID:', latestBooking.userId);
      
      // Assign to okok@gmail.com user (ID: 6836dc84b2c375cbe8699458)
      latestBooking.userId = new mongoose.Types.ObjectId('6836dc84b2c375cbe8699458');
      await latestBooking.save();
      
      console.log('✅ Updated booking to belong to okok@gmail.com user');
      console.log('🎯 New user ID:', latestBooking.userId);
    } else {
      console.log('❌ No bookings found');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 