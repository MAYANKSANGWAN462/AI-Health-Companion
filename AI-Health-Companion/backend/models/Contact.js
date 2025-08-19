const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'support', 'feedback', 'partnership', 'other'],
    default: 'general'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    source: {
      type: String,
      enum: ['contact_form', 'email', 'phone', 'social_media'],
      default: 'contact_form'
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ priority: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ category: 1, createdAt: -1 });

// Virtual for calculating response time
contactSchema.virtual('responseTime').get(function() {
  if (this.response && this.response.respondedAt) {
    return this.response.respondedAt - this.createdAt;
  }
  return null;
});

// Method to mark as read
contactSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Method to reply to message
contactSchema.methods.reply = function(message, userId) {
  this.status = 'replied';
  this.response = {
    message,
    respondedBy: userId,
    respondedAt: new Date()
  };
  return this.save();
};

// Method to get priority color (for UI)
contactSchema.methods.getPriorityColor = function() {
  const colors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  };
  return colors[this.priority] || 'text-gray-600';
};

// Method to get status badge (for UI)
contactSchema.methods.getStatusBadge = function() {
  const badges = {
    unread: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-600'
  };
  return badges[this.status] || 'bg-gray-100 text-gray-800';
};

module.exports = mongoose.model('Contact', contactSchema);
