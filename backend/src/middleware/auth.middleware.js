// backend/src/middleware/auth.middleware.js

// This middleware function checks for a valid session token
exports.requireAuth = async (req, res, next) => {
    // Supabase client is attached to the request object in server.js
    const supabase = req.supabase;

    // The client sends the token in the 'Authorization' header
    // in the format: 'Bearer [token]'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If the header is missing or doesn't have the correct format,
        // we immediately send a 401 Unauthorized error.
        return res.status(401).json({ error: 'Authorization header is required.' });
    }

    // Extract the token by removing the 'Bearer ' prefix
    const token = authHeader.split(' ')[1];

    try {
        // Supabase provides a method to verify a JWT token from an existing session
        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
            // If the token is invalid or expired, Supabase will return an error
            console.error('Supabase auth error:', error.message);
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        // If the token is valid, we can attach the user data to the request object.
        // This is useful for later checks (e.g., is this user an admin?).
        req.user = data.user;

        // Call next() to pass the request to the next handler function (the controller)
        next();
    } catch (err) {
        // Catches any unexpected errors during the process
        console.error('Server error during token verification:', err);
        return res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
};
