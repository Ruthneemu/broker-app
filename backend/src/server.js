// backend/src/server.js

// Import required libraries
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Import all of our routers
const listingsRouter = require('./routes/listings.routes');
const authRouter = require('./routes/auth.routes');
const imagesRouter = require('./routes/images.routes');
// Import the new contact form router
const contactRouter = require('./routes/contact.routes');

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Supabase Client Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key not found. Please check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
app.use((req, res, next) => {
    req.supabase = supabase;
    next();
});

// =================================================================
// API ROUTES
// =================================================================

app.get('/', (req, res) => {
  res.send('Welcome to the Brokerage Website Backend!');
});

app.use('/api/listings', listingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/images', imagesRouter);

// Use the contact router for all requests starting with '/api/contact'
app.use('/api/contact', contactRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('Backend is ready!');
});
