const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
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
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('avatar').optional().isURL().withMessage('Invalid avatar URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, avatar } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// @route   PUT /api/user/health-profile
// @desc    Update user health profile
// @access  Private
router.put('/health-profile', auth, [
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
  body('weight').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  body('height').optional().isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100 and 250 cm'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
  body('currentMedications').optional().isArray().withMessage('Current medications must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      age, gender, weight, height, bloodGroup,
      allergies, medicalHistory, currentMedications
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update health profile
    if (age !== undefined) user.healthProfile.age = age;
    if (gender !== undefined) user.healthProfile.gender = gender;
    if (weight !== undefined) user.healthProfile.weight = weight;
    if (height !== undefined) user.healthProfile.height = height;
    if (bloodGroup !== undefined) user.healthProfile.bloodGroup = bloodGroup;
    if (allergies !== undefined) user.healthProfile.allergies = allergies;
    if (medicalHistory !== undefined) user.healthProfile.medicalHistory = medicalHistory;
    if (currentMedications !== undefined) user.healthProfile.currentMedications = currentMedications;

    await user.save();

    res.json({
      message: 'Health profile updated successfully',
      healthProfile: user.healthProfile
    });

  } catch (error) {
    console.error('Update health profile error:', error);
    res.status(500).json({ error: 'Server error while updating health profile' });
  }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('notifications.email').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('notifications.sms').optional().isBoolean().withMessage('SMS notifications must be boolean'),
  body('notifications.push').optional().isBoolean().withMessage('Push notifications must be boolean'),
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notifications, theme } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update preferences
    if (notifications) {
      if (notifications.email !== undefined) user.preferences.notifications.email = notifications.email;
      if (notifications.sms !== undefined) user.preferences.notifications.sms = notifications.sms;
      if (notifications.push !== undefined) user.preferences.notifications.push = notifications.push;
    }
    if (theme !== undefined) user.preferences.theme = theme;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error while updating preferences' });
  }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error while changing password' });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, [
  body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error while deleting account' });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent quiz history (last 5)
    const Quiz = require('../models/Quiz');
    const recentQuizzes = await Quiz.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('symptoms status aiAnalysis createdAt');

    // Get quiz statistics
    const quizStats = await Quiz.aggregate([
      { $match: { user: user._id } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } }
      }}
    ]);

    // Get health insights based on recent quizzes
    const healthInsights = [];
    if (recentQuizzes.length > 0) {
      const completedQuizzes = recentQuizzes.filter(q => q.status === 'completed');
      if (completedQuizzes.length > 0) {
        // Generate insights based on quiz data
        const commonSymptoms = completedQuizzes.reduce((acc, quiz) => {
          const symptom = quiz.symptoms.primary;
          acc[symptom] = (acc[symptom] || 0) + 1;
          return acc;
        }, {});

        const mostCommonSymptom = Object.entries(commonSymptoms)
          .sort(([,a], [,b]) => b - a)[0];

        if (mostCommonSymptom) {
          healthInsights.push({
            type: 'symptom_pattern',
            title: 'Most Common Symptom',
            description: `You've reported ${mostCommonSymptom[0].replace('_', ' ')} most frequently`,
            severity: 'info'
          });
        }
      }
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar
      },
      dashboard: {
        recentQuizzes,
        quizStats: quizStats[0] || { total: 0, completed: 0, inProgress: 0 },
        healthInsights,
        lastActivity: recentQuizzes[0]?.createdAt || user.createdAt
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard' });
  }
});

module.exports = router;
