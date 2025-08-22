// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
// Import the controller that contains our authentication logic
const authController = require('../controllers/auth.controller');

// POST /api/auth/signup
// This route will call the signUp function from our controller.
router.post('/signup', authController.signUp);

// POST /api/auth/login
// This route will call the login function from our controller.
router.post('/login', authController.login);

module.exports = router;
