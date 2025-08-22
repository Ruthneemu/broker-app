// backend/src/controllers/auth.controller.js

// Function to handle new user registration (broker sign-up)
exports.signUp = async (req, res) => {
    try {
        const { email, password } = req.body; // Get email and password from the request body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Use the Supabase client to sign up a new user
        const { data, error } = await req.supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            // Handle specific Supabase errors, such as a user already existing
            console.error('Supabase sign-up error:', error.message);
            return res.status(400).json({ error: error.message });
        }

        // If successful, data.user will contain the new user's information
        res.status(201).json({ message: 'User registered successfully. Please check your email for a confirmation link.', user: data.user });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
};

// Function to handle user login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Get email and password from the request body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Use the Supabase client to sign in a user
        const { data, error } = await req.supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // Handle authentication errors (e.g., invalid credentials)
            console.error('Supabase sign-in error:', error.message);
            return res.status(401).json({ error: 'Invalid login credentials.' });
        }

        // If successful, data.session will contain the user's session token
        res.status(200).json({ message: 'Login successful.', session: data.session });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
};
