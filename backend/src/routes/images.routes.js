// backend/src/routes/images.routes.js

const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/images.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// POST /api/images/upload
// This route is protected by the requireAuth middleware.
router.post('/upload', requireAuth, imagesController.uploadImage);

module.exports = router;
