import mongoose from 'mongoose';

const travelerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  idProofType: {
    type: String,
    trim: true
  },
  idNumber: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  seatPreference: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true,
    default: 'Indian'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can't have duplicate traveler names
travelerSchema.index({ userId: 1, name: 1 }, { unique: true });

const Traveler = mongoose.model('Traveler', travelerSchema);

export default Traveler; 