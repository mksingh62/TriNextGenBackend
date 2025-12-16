require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    // process.env.FRONTEND_URL || 'http://localhost:5173', 
    // 'http://localhost:8000', 
    // 'http://localhost:8001', 
    'https://tri-next-gen.vercel.app'
  ],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Database Connection (removed deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/careers', require('./routes/career'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle production build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
