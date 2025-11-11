// fego-coop-backend/routes/user-auth.routes.js

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // correct path to your model file
const auth = require('../middleware/auth.middleware');
const Notification = require('../models/notification.model');
const Contribution = require('../models/contribution.model'); // <-- Import Contribution Model
const Loan = require('../models/loans.model'); // <-- Import Loan Model (use correct filename)

// Load JWT Secret from .env file (we need to add this to .env later!)
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('Warning: JWT_SECRET not set in .env. Set JWT_SECRET for production.');
}

// @route   POST /api/users/register
// @desc    Register a new member (Self-Registration)
// @access  Public
router.route('/register').post(async (req, res) => {
  try {
    let { username, email, password, fullName, membershipId } = req.body;
    if (!username || !email || !password || !fullName || !membershipId) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    email = email.toLowerCase().trim(); // normalize
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { membershipId }] });
    if (existingUser) return res.status(409).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      membershipId,
    });

    await newUser.save();
    return res.status(201).json({ msg: 'User registered successfully', id: newUser._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during registration');
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token (Login existing member)
// @access  Public
router.route('/login').post(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordProvided: !!password }); // remove in prod
    if (!email || !password) return res.status(400).json({ msg: 'Missing email or password' });

    const emailNormalized = email.toLowerCase().trim();
    console.log('Normalized email:', emailNormalized);

    const user = await User.findOne({ email: emailNormalized });
    console.log('Found user:', user ? { id: user._id, email: user.email, passwordHashLength: user.password && user.password.length } : null);

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during login');
  }
});

// Protected example
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile and financial data (SECURE ROUTE)
// @access  Private (Requires a valid token)
router.route('/profile').get(auth, async (req, res) => {
    try {
        // req.user.id comes from the auth middleware where we decoded the token
        const user = await User.findById(req.user.id).select('-password'); // Find user by ID, exclude password hash
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        res.json(user); // Return the user object with financial data fields

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching profile data');
    }
});

// @route   POST /api/users/sync-data
// @desc    Admin endpoint to sync Excel data with a new user account
// @access  Private (Admin only)
router.route('/sync-data').post(auth, async (req, res) => {
  try {
    // Ensure the requester is an admin (req.user has only id from JWT; fetch from DB)
    const requester = await User.findById(req.user.id).select('isAdmin');
    if (!requester || !requester.isAdmin) {
      return res.status(403).json({ msg: 'Authorization denied. Admins only.' });
    }

    const { newUserId, membershipId } = req.body || {};
    if (!newUserId) {
      return res.status(400).json({ msg: 'newUserId is required' });
    }

    // Find the newly registered user (with hashed password)
    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return res.status(404).json({ msg: 'New user account not found.' });
    }

    // Mark as synced; financial fields assumed already present on the document
    newUser.isSynced = true;
    await newUser.save();

    return res.json({
      msg: `User ${newUser.membershipId || membershipId || newUserId} successfully synced and verified.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error during data syncing.');
  }
});

// @route   PUT /api/users/profile/update
// @desc    Update user profile details
// @access  Private
router.route('/profile/update').put(auth, async (req, res) => {
    const userId = req.user.id;
    // Define allowed fields they can update. We exclude sensitive fields like password, isAdmin, financials.
    const { fullName, email } = req.body; 

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Update the fields if they are provided in the request body
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;

        await user.save();
        
        // Return the updated user object (excluding password)
        res.json({ 
            msg: 'Profile updated successfully', 
            user: user.toObject({ 
                transform: (doc, ret) => { 
                    delete ret.password; 
                    return ret; 
                } 
            }) 
        });

    } catch (err) {
        console.error(err.message);
        // Handle potential duplicate email error from Mongoose/Mongo
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'That email address is already in use.' });
        }
        res.status(500).send('Server Error updating profile.');
    }
});

// @route   GET /api/users/notifications
// @desc    Get current user's notifications
// @access  Private
router.route('/notifications').get(auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching notifications.');
    }
});

// @route   POST /api/users/notifications/read/:id
// @desc    Mark a notification as read
// @access  Private
router.route('/notifications/read/:id').post(auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ msg: 'Notification not found or access denied.' });
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error marking notification as read.');
    }
});

// @route   GET /api/users/financial-history
// @desc    Get current user's detailed financial transaction history
// @access  Private
router.route('/financial-history').get(auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all contributions made by the user
        const contributions = await Contribution.find({ userId: userId, status: 'success' })
            .sort({ createdAt: -1 })
            .select('amount createdAt transactionRef');

        // Fetch all loans the user has applied for (regardless of status)
        const loans = await Loan.find({ userId: userId })
            .sort({ createdAt: -1 })
            .select('amountRequested status createdAt purpose');
        
        // You could also fetch investments here if needed

        res.json({
            contributions,
            loans
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching financial history.');
    }
});

module.exports = router;
