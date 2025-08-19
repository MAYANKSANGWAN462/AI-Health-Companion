const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Helper function to send OTP (placeholder - integrate with Twilio)
const sendOTP = async (phone, code) => {
  // TODO: Integrate with Twilio SMS service
  console.log(`📱 OTP ${code} sent to ${phone}`);
  return true;
};

// @route   POST /api/auth/register
// @desc    Register new user with phone number
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or phone number'
      });
    }

    // Create new user
    const user = new User({
      name,
      phone,
      email,
      password
    });

    // Generate and send OTP
    const otpCode = user.generateVerificationCode();
    await user.save();

    // Send OTP via SMS
    await sendOTP(phone, otpCode);

    res.status(201).json({
      message: 'User registered successfully. Please verify your phone number with OTP.',
      userId: user._id,
      phone: user.phone
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify phone number with OTP
// @access  Public
router.post('/verify-otp', [
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, otp } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    if (!user.isVerificationCodeValid(otp)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Phone number verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Server error during OTP verification' });
  }
});

// @route   POST /api/auth/login
// @desc    Login with phone/email and password
// @access  Public
router.post('/login', [
  body('identifier').notEmpty().withMessage('Phone or email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // Find user by phone or email
    const user = await User.findOne({
      $or: [
        { phone: identifier },
        { email: identifier }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        error: 'Please verify your phone number first',
        requiresVerification: true,
        userId: user._id
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user's phone
// @access  Public
router.post('/resend-otp', [
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new OTP
    const otpCode = user.generateVerificationCode();
    await user.save();

    // Send new OTP
    await sendOTP(phone, otpCode);

    res.json({
      message: 'New OTP sent successfully',
      phone: user.phone
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error while resending OTP' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        avatar: user.avatar,
        healthProfile: user.healthProfile,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  // JWT tokens are stateless, so logout is handled client-side
  // You could implement a blacklist here if needed
  res.json({ message: 'Logged out successfully' });
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = generateToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Server error while refreshing token' });
  }
});

module.exports = router;
