// backend/src/controllers/contact.controller.js

const nodemailer = require('nodemailer');
const validator = require('validator');

// Create a transporter object using a free service like Gmail
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        // IMPORTANT: Use an App Password for security, not your regular password.
        // You can generate this in your Google account settings.
        user: process.env.EMAIL_USER, // Your Gmail address from .env
        pass: process.env.EMAIL_PASS  // Your generated App Password from .env
    }
});

exports.sendContactMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Simple validation to ensure all fields are present
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        // Use a library to validate the email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        // Email content for the broker
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.BROKER_EMAIL, // The broker's email address
            subject: `New Inquiry from Brokerage Website: ${name}`,
            text: `
                You have a new message from your website's contact form.

                Name: ${name}
                Email: ${email}
                Phone: ${phone || 'Not provided'}
                Message:
                ${message}
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log('Contact message sent successfully.');
        res.status(200).json({ message: 'Your message has been sent successfully.' });
    } catch (err) {
        console.error('Nodemailer error:', err);
        res.status(500).json({ error: 'An unexpected server error occurred while sending the message.' });
    }
};
