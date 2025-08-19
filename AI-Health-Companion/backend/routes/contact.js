const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { optionalAuth, adminAuth } = require('../middleware/auth');

// @route   POST /api/contact/submit
// @desc    Submit a new contact message
// @access  Public
router.post('/submit', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message, category = 'general' } = req.body;

    // Determine priority based on category and content
    let priority = 'medium';
    if (category === 'urgent' || subject.toLowerCase().includes('urgent') || subject.toLowerCase().includes('emergency')) {
      priority = 'urgent';
    } else if (category === 'support' || subject.toLowerCase().includes('help')) {
      priority = 'high';
    }

    // Create new contact message
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      category,
      priority,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        referrer: req.headers.referer || 'Direct',
        source: 'contact_form'
      }
    });

    await contact.save();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      message: 'Message submitted successfully. We will get back to you soon.',
      contactId: contact._id,
      priority: contact.priority
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error while submitting message' });
  }
});

// @route   GET /api/contact/messages
// @desc    Get all contact messages (admin only)
// @access  Private (Admin)
router.get('/messages', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, category } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email');

    const total = await Contact.countDocuments(query);

    // Get statistics
    const stats = await Contact.aggregate([
      { $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
      }}
    ]);

    res.json({
      contacts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      statistics: stats[0] || { total: 0, unread: 0, urgent: 0, high: 0 }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
});

// @route   GET /api/contact/messages/:id
// @desc    Get specific contact message (admin only)
// @access  Private (Admin)
router.get('/messages/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('response.respondedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ contact });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Server error while fetching message' });
  }
});

// @route   PUT /api/contact/messages/:id/status
// @desc    Update message status (admin only)
// @access  Private (Admin)
router.put('/messages/:id/status', adminAuth, [
  body('status').isIn(['unread', 'read', 'replied', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    contact.status = status;
    await contact.save();

    res.json({
      message: 'Status updated successfully',
      contact
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error while updating status' });
  }
});

// @route   PUT /api/contact/messages/:id/priority
// @desc    Update message priority (admin only)
// @access  Private (Admin)
router.put('/messages/:id/priority', adminAuth, [
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { priority } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    contact.priority = priority;
    await contact.save();

    res.json({
      message: 'Priority updated successfully',
      contact
    });

  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({ error: 'Server error while updating priority' });
  }
});

// @route   PUT /api/contact/messages/:id/assign
// @desc    Assign message to admin user (admin only)
// @access  Private (Admin)
router.put('/messages/:id/assign', adminAuth, [
  body('assignedTo').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignedTo } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    contact.assignedTo = assignedTo;
    await contact.save();

    res.json({
      message: 'Message assigned successfully',
      contact
    });

  } catch (error) {
    console.error('Assign message error:', error);
    res.status(500).json({ error: 'Server error while assigning message' });
  }
});

// @route   PUT /api/contact/messages/:id/reply
// @desc    Reply to contact message (admin only)
// @access  Private (Admin)
router.put('/messages/:id/reply', adminAuth, [
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Reply must be 10-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Reply to the message
    await contact.reply(message, req.user.userId);

    // TODO: Send reply email to user

    res.json({
      message: 'Reply sent successfully',
      contact
    });

  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Server error while sending reply' });
  }
});

// @route   DELETE /api/contact/messages/:id
// @desc    Delete contact message (admin only)
// @access  Private (Admin)
router.delete('/messages/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error while deleting message' });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact form statistics (admin only)
// @access  Private (Admin)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const stats = await Contact.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    const categoryStats = await Contact.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Contact.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      period,
      dailyStats: stats,
      categoryStats,
      priorityStats,
      total: stats.reduce((sum, day) => sum + day.count, 0)
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error while fetching statistics' });
  }
});

module.exports = router;
