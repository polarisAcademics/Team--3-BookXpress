import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePicture: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local',
  },
  providerId: String,
  recentSearches: [
    {
      from: String,
      to: String,
      date: String,
      searchedAt: { type: Date, default: Date.now }
    }
  ],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  console.log('User model pre-save hook triggered.');
  console.log('Is password modified?', this.isModified('password'));

  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully in pre-save hook.');
    next();
  } catch (error) {
    console.error('Error hashing password in pre-save hook:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 