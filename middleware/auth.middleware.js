// fego-coop-backend/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
// Get the secret key we stored in the .env file
const jwtSecret = process.env.JWT_SECRET; 

// Middleware function to protect routes
module.exports = function (req, res, next) {
    // Get token from header (the client sends the token in the 'x-auth-token' header)
    const token = req.header('x-auth-token');

    // Check if no token is present
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // Decode the token using our secret key
        const decoded = jwt.verify(token, jwtSecret);

        // Attach the user ID from the token payload to the request object
        req.user = decoded.user; 
        
        // Continue to the main route handler
        next(); 
        
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
