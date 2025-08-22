// backend/src/controllers/listings.controller.js

// Function to fetch all listings
exports.getListings = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch listings.' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
};

// Function to fetch a single listing by its ID
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Listing not found.' });
        }
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch listing.' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
};

// Function to create a new listing (POST)
exports.createListing = async (req, res) => {
  try {
    // The new listing data is sent in the request body
    const listingData = req.body;

    // We use the .insert() method to add a new row to the 'listings' table.
    // The .select() method tells Supabase to return the newly created row.
    const { data, error } = await req.supabase
      .from('listings')
      .insert([listingData])
      .select();

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to create listing.' });
    }

    // Send a 201 Created status and the new listing data back to the client
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
};

// Function to update an existing listing (PUT)
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL
    const updatedData = req.body; // Get the updated data from the request body

    // We use .update() with the new data, and .eq() to specify which row to update by ID.
    // .select() returns the updated row.
    const { data, error } = await req.supabase
      .from('listings')
      .update(updatedData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to update listing.' });
    }

    // Check if the listing was actually found and updated
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
};

// Function to delete a listing (DELETE)
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL

    // We use .delete() with .eq() to specify the row to delete by its ID.
    const { error } = await req.supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to delete listing.' });
    }

    // We can't confirm a delete by checking the returned data, so we'll just send a success message.
    res.status(200).json({ message: 'Listing successfully deleted.' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
};
