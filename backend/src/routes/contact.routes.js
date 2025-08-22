// backend/src/routes/contact.routes.js

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// POST /api/contact/send
// This endpoint is for sending contact form messages.
router.post('/send', contactController.sendContactMessage);

module.exports = router;
