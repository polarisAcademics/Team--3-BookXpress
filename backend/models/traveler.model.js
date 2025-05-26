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
    enum: ['male', 'female', 'other'],
    required: true
  },
  berthPreference: {
    type: String,
    enum: ['lower', 'middle', 'upper', 'side-lower', 'side-upper'],
    default: 'lower'
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