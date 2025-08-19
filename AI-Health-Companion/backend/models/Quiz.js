const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  symptoms: {
    primary: {
      type: String,
      required: true,
      enum: [
        'fever', 'cough', 'headache', 'fatigue', 'nausea', 'dizziness',
        'chest_pain', 'abdominal_pain', 'joint_pain', 'skin_rash',
        'shortness_of_breath', 'loss_of_appetite', 'insomnia', 'anxiety'
      ]
    },
    severity: {
      type: String,
      required: true,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: {
      type: String,
      required: true,
      enum: ['less_than_24h', '1_3_days', '3_7_days', 'more_than_week']
    }
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    category: {
      type: String,
      enum: ['general', 'respiratory', 'cardiovascular', 'gastrointestinal', 'neurological', 'dermatological']
    }
  }],
  riskFactors: [{
    factor: String,
    present: Boolean,
    details: String
  }],
  aiAnalysis: {
    possibleConditions: [{
      condition: String,
      probability: Number,
      description: String,
      severity: String
    }],
    recommendations: [{
      type: {
        type: String,
        enum: ['immediate', 'urgent', 'routine', 'preventive']
      },
      action: String,
      description: String,
      priority: Number
    }],
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    disclaimer: {
      type: String,
      default: 'This analysis is for informational purposes only and should not replace professional medical advice.'
    }
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'reviewed_by_doctor'],
    default: 'in_progress'
  },
  metadata: {
    deviceInfo: String,
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ user: 1, createdAt: -1 });
quizSchema.index({ sessionId: 1 });
quizSchema.index({ 'symptoms.primary': 1, 'symptoms.severity': 1 });
quizSchema.index({ status: 1, createdAt: -1 });

// Virtual for calculating quiz duration
quizSchema.virtual('duration').get(function() {
  if (this.createdAt && this.updatedAt) {
    return this.updatedAt - this.createdAt;
  }
  return null;
});

// Method to get risk level
quizSchema.methods.getRiskLevel = function() {
  const highRiskSymptoms = ['chest_pain', 'shortness_of_breath', 'severe_headache'];
  const moderateRiskSymptoms = ['fever', 'abdominal_pain', 'dizziness'];
  
  if (highRiskSymptoms.includes(this.symptoms.primary) && this.symptoms.severity === 'severe') {
    return 'high';
  } else if (moderateRiskSymptoms.includes(this.symptoms.primary) || this.symptoms.severity === 'moderate') {
    return 'moderate';
  }
  return 'low';
};

// Method to get summary
quizSchema.methods.getSummary = function() {
  return {
    primarySymptom: this.symptoms.primary,
    severity: this.symptoms.severity,
    duration: this.symptoms.duration,
    riskLevel: this.getRiskLevel(),
    possibleConditions: this.aiAnalysis.possibleConditions.slice(0, 3),
    topRecommendation: this.aiAnalysis.recommendations[0] || null
  };
};

// Pre-save middleware to generate session ID if not present
quizSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
