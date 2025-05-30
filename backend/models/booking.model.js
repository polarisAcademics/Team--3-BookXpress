import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String },
  seatNumber: { type: String }, // Optional, can be assigned later or if pre-assigned
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  paymentGateway: { type: String, default: 'Unknown' }, // e.g., 'Stripe', 'Razorpay'
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, required: true, enum: ['SUCCESSFUL', 'PENDING', 'FAILED'], default: 'PENDING' },
  paymentDate: { type: Date, default: Date.now },
}, { _id: false });

const trainDetailsSchema = new mongoose.Schema({
  trainId: { type: String, required: true }, // From your trains data
  name: { type: String, required: true },
  number: { type: String, required: true },
  fromStation: { type: String, required: true },
  toStation: { type: String, required: true },
  journeyDate: { type: Date, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  selectedClass: { type: String, required: true }, // e.g., 'Sleeper', 'AC Tier 3'
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trainDetails: { type: trainDetailsSchema, required: true },
  passengers: [passengerSchema],
  totalFare: {
    type: Number,
    required: true,
  },
  paymentDetails: { type: paymentDetailsSchema, required: true },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: { // Overall booking status, could be different from payment status
    type: String,
    enum: ['CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING_PAYMENT',
  },
  pnrNumber: { // Could be a unique booking reference if not using actual PNRs
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls if not set, but unique if set
  },
  ticketPDFUrl: { // For later use when ticket generation is implemented
    type: String,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Pre-save hook to generate a simple PNR/Booking ID if not provided
bookingSchema.pre('save', function(next) {
  if (!this.pnrNumber && this.status === 'CONFIRMED') { // Generate PNR only if confirmed and not set
    // Simple PNR example: BKX + timestamp fragment + random chars
    this.pnrNumber = `BKX${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;