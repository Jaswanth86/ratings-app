require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors
const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow only this origin
  credentials: true, // Allow cookies/credentials if using them
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/store', require('./routes/store'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));