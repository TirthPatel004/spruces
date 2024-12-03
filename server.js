const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const profileRoutes = require('./routes/profiles');
const connectDB = require('./db'); // Import the connectDB function
const documentRoutes = require('./routes/documentRoutes');
const scheduleRoutes = require('./routes/ScheduleRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON data
app.use(cookieParser()); // To parse cookies

app.get('/', (req, res) => {
  res.send('Welcome to Spruces Application!');
});

// Connect to MongoDB
connectDB(); // Call the connectDB function to establish the connection

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', jobRoutes);
app.use('/api/profile', documentRoutes);
app.use('/api/profiles', profileRoutes);
app.use(scheduleRoutes); // Register the routes
app.use(messageRoutes);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal Server Error' });
});

// Export the app for Vercel
module.exports = app;
