const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const invoiceRoutes = require('./routes/invoiceRoutes.js');

dotenv.config();

// Database Connection
connectDB();

const app = express();

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api', invoiceRoutes);
// Base Route
app.get('/', (req, res) => {
  res.send('Invoice Management System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});