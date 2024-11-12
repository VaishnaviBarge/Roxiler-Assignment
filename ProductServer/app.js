const express = require('express');
const cors = require('cors'); // Import cors
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());

// Enable CORS for all requests
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: 'GET,POST',
  credentials: true
}));

// Define routes
app.use('/api/products', productRoutes);

module.exports = app;
