import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import trainStatusRoute from './routes/trainStatus.js';
import bookingsRoute from './routes/bookings.js';
import trainsRoute from './routes/trains.js';
import ticketRoutes from './routes/ticket.js';
import pnrStatusRoute from './routes/pnrStatus.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());

// JSON parsing with error handling
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ message: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', trainStatusRoute);
app.use('/api/tickets', ticketRoutes);
app.use('/api', pnrStatusRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/trains', trainsRoute);

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookxpress';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

// Error handling middleware - MUST be after all routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  
  // Handle specific types of errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with port handling
const startServer = async (retries = 5) => {
  const PORT = process.env.PORT || 3000;
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        resolve();
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
          server.close();
          app.listen(PORT + 1, () => {
            console.log(`Server is running on port ${PORT + 1}`);
            resolve();
          });
        } else {
          reject(err);
        }
      });
    });
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying server start... (${retries} attempts left)`);
      await startServer(retries - 1);
    } else {
      console.error('Failed to start server after multiple attempts');
      process.exit(1);
    }
  }
};

startServer(); 