import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes, { auth } from './routes/auth.routes.js';
import trainStatusRoute from './routes/trainStatus.js';
import bookingsRoute from './routes/bookings.js';
import trainsRoute from './routes/trains.js';
import ticketRoutes from './routes/ticket.js';
import pnrStatusRoute from './routes/pnrStatus.js';
import recentSearchesRoute from './routes/recentSearches.js';
import travelersRoute from './routes/travelers.js';
import paymentRoutes from './routes/payment.js';
import trainsBetweenStationsRoute from './routes/trainsBetweenStations.js';
import stationsRoute from './routes/stations.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('PNR_API_KEY exists:', !!process.env.PNR_API_KEY);
console.log('PNR_API_KEY length:', process.env.PNR_API_KEY?.length);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

const app = express();

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve static files from the 'uploads' directory
// Make sure the 'uploads' directory exists
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainsRoute);
app.use('/api/train-status', trainStatusRoute);
app.use('/api/pnr-status', pnrStatusRoute);
app.use('/api/recent-searches', recentSearchesRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/tickets', ticketRoutes);
app.use('/api/travelers', travelersRoute);
app.use('/api/payment', paymentRoutes);
app.use('/api/trains-between-stations', trainsBetweenStationsRoute);
app.use('/api/stations', stationsRoute);

// Protected routes (authentication required)
app.use('/api/tickets', auth, ticketRoutes);
app.use('/api/recent-searches', auth, recentSearchesRoute);

// Add a test route to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://krishanttanti:8y30NQRQVNCYayGS@cluster0.mlp9lvu.mongodb.net/';

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