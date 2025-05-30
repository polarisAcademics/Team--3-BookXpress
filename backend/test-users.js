import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking users in database...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const users = await mongoose.connection.db.collection('users').find({}).limit(10).toArray();
    console.log(`👥 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | ID: ${user._id} | Name: ${user.name || 'No name'}`);
    });
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 