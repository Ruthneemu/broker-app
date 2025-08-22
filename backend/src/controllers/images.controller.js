// backend/src/controllers/images.controller.js

// We'll use this library to generate a unique ID for each file
const { v4: uuidv4 } = require('uuid');
// This is a placeholder for a file upload library.
// In a real project, you would use 'multer' or similar.
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

exports.uploadImage = async (req, res) => {
  // We'll use a single-file upload for this example
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    try {
      const supabase = req.supabase;
      const file = req.file;

      // Generate a unique file name to avoid collisions
      const fileName = `${uuidv4()}-${file.originalname}`;

      // Upload the file to the 'listings-images' bucket in Supabase Storage
      const { data, error } = await supabase.storage
        .from('listings-images') // Make sure this bucket exists in your Supabase project
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600', // Cache for 1 hour
        });

      if (error) {
        console.error('Supabase Storage error:', error.message);
        return res.status(500).json({ error: 'Failed to upload image.' });
      }

      // Get the public URL of the uploaded image
      const publicURL = `${supabase.storage.from('listings-images').getPublicUrl(fileName).data.publicUrl}`;

      // Return the public URL to the client
      res.status(200).json({ publicURL: publicURL });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
  });
};
