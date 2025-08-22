// backend/src/routes/listings.routes.js

const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public Routes (Anyone can access these)
// GET all listings
router.get('/', listingsController.getListings);
// GET a single listing by ID
router.get('/:id', listingsController.getListingById);

// Protected Routes (Only an authenticated user can access these)
// POST a new listing
// We apply the requireAuth middleware to this route
router.post('/', requireAuth, listingsController.createListing);
// PUT (update) an existing listing by ID
// We apply the requireAuth middleware to this route
router.put('/:id', requireAuth, listingsController.updateListing);
// DELETE a listing by ID
// We apply the requireAuth middleware to this route
router.delete('/:id', requireAuth, listingsController.deleteListing);

module.exports = router;
