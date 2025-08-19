const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const { auth, optionalAuth } = require('../middleware/auth');

// AI Analysis helper function (placeholder - integrate with actual AI service)
const analyzeSymptoms = (responses, symptoms) => {
  // This is a simplified AI analysis - replace with actual AI service
  const analysis = {
    possibleConditions: [],
    recommendations: [],
    confidence: 0,
    disclaimer: 'This analysis is for informational purposes only and should not replace professional medical advice.'
  };

  // Simple rule-based analysis based on symptoms and responses
  if (symptoms.primary === 'fever' && symptoms.severity === 'severe') {
    analysis.possibleConditions.push({
      condition: 'High Fever',
      probability: 85,
      description: 'Severe fever requiring immediate attention',
      severity: 'high'
    });
    analysis.recommendations.push({
      type: 'immediate',
      action: 'Seek immediate medical attention',
      description: 'High fever can be dangerous and requires prompt medical evaluation',
      priority: 1
    });
    analysis.confidence = 80;
  } else if (symptoms.primary === 'cough' && symptoms.duration === 'more_than_week') {
    analysis.possibleConditions.push({
      condition: 'Persistent Cough',
      probability: 70,
      description: 'Cough lasting more than a week may indicate underlying condition',
      severity: 'moderate'
    });
    analysis.recommendations.push({
      type: 'urgent',
      action: 'Consult a doctor within 24-48 hours',
      description: 'Persistent cough should be evaluated by a healthcare professional',
      priority: 2
    });
    analysis.confidence = 75;
  } else if (symptoms.primary === 'headache' && symptoms.severity === 'mild') {
    analysis.possibleConditions.push({
      condition: 'Tension Headache',
      probability: 60,
      description: 'Common stress-related headache',
      severity: 'low'
    });
    analysis.recommendations.push({
      type: 'routine',
      action: 'Monitor symptoms and try stress reduction',
      description: 'Consider over-the-counter pain relief and stress management',
      priority: 3
    });
    analysis.confidence = 65;
  } else {
    analysis.possibleConditions.push({
      condition: 'General Symptoms',
      probability: 50,
      description: 'Symptoms require further evaluation',
      severity: 'moderate'
    });
    analysis.recommendations.push({
      type: 'routine',
      action: 'Monitor symptoms and consult doctor if they worsen',
      description: 'Keep track of symptoms and seek medical advice if needed',
      priority: 4
    });
    analysis.confidence = 50;
  }

  return analysis;
};

// @route   POST /api/quiz/start
// @desc    Start a new symptom quiz
// @access  Private
router.post('/start', auth, [
  body('primarySymptom').isIn([
    'fever', 'cough', 'headache', 'fatigue', 'nausea', 'dizziness',
    'chest_pain', 'abdominal_pain', 'joint_pain', 'skin_rash',
    'shortness_of_breath', 'loss_of_appetite', 'insomnia', 'anxiety'
  ]).withMessage('Invalid primary symptom'),
  body('severity').isIn(['mild', 'moderate', 'severe']).withMessage('Invalid severity level'),
  body('duration').isIn(['less_than_24h', '1_3_days', '3_7_days', 'more_than_week']).withMessage('Invalid duration')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { primarySymptom, severity, duration } = req.body;

    // Create new quiz
    const quiz = new Quiz({
      user: req.user.userId,
      symptoms: {
        primary: primarySymptom,
        severity,
        duration
      },
      metadata: {
        deviceInfo: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || req.connection.remoteAddress
      }
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz started successfully',
      quizId: quiz._id,
      sessionId: quiz.sessionId,
      nextQuestion: getNextQuestion(primarySymptom, 1)
    });

  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ error: 'Server error while starting quiz' });
  }
});

// @route   POST /api/quiz/answer
// @desc    Submit answer to quiz question
// @access  Private
router.post('/answer', auth, [
  body('quizId').isMongoId().withMessage('Invalid quiz ID'),
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quizId, questionId, answer, question, category } = req.body;

    // Find and update quiz
    const quiz = await Quiz.findOne({
      _id: quizId,
      user: req.user.userId,
      status: 'in_progress'
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or already completed' });
    }

    // Add response
    quiz.responses.push({
      questionId,
      question: question || `Question ${questionId}`,
      answer,
      category: category || 'general'
    });

    await quiz.save();

    // Check if quiz is complete (you can customize this logic)
    const isComplete = quiz.responses.length >= 5; // Example: 5 questions minimum

    if (isComplete) {
      // Complete the quiz and generate AI analysis
      quiz.status = 'completed';
      quiz.aiAnalysis = analyzeSymptoms(quiz.responses, quiz.symptoms);
      await quiz.save();

      res.json({
        message: 'Quiz completed successfully',
        quiz: quiz,
        analysis: quiz.aiAnalysis,
        summary: quiz.getSummary()
      });
    } else {
      // Get next question
      const nextQuestion = getNextQuestion(quiz.symptoms.primary, quiz.responses.length + 1);
      
      res.json({
        message: 'Answer recorded successfully',
        quiz: quiz,
        nextQuestion,
        progress: {
          current: quiz.responses.length,
          total: 5, // Total expected questions
          percentage: Math.round((quiz.responses.length / 5) * 100)
        }
      });
    }

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Server error while submitting answer' });
  }
});

// @route   GET /api/quiz/:id
// @desc    Get quiz details by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('user', 'name email');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      quiz,
      summary: quiz.getSummary()
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Server error while fetching quiz' });
  }
});

// @route   GET /api/quiz/history
// @desc    Get user's quiz history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user.userId };
    if (status) query.status = status;

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('symptoms status aiAnalysis createdAt');

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({ error: 'Server error while fetching quiz history' });
  }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });

  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Server error while deleting quiz' });
  }
});

// Helper function to get next question based on symptom and progress
function getNextQuestion(primarySymptom, questionNumber) {
  const questionSets = {
    fever: [
      {
        id: 'fever_temp',
        question: 'What is your body temperature?',
        type: 'select',
        options: ['Below 100°F (37.8°C)', '100-102°F (37.8-39°C)', 'Above 102°F (39°C)', 'Don\'t know'],
        category: 'general'
      },
      {
        id: 'fever_chills',
        question: 'Do you have chills or sweating?',
        type: 'radio',
        options: ['Yes', 'No'],
        category: 'general'
      }
    ],
    cough: [
      {
        id: 'cough_type',
        question: 'What type of cough do you have?',
        type: 'select',
        options: ['Dry cough', 'Wet/productive cough', 'Barking cough', 'Whooping cough'],
        category: 'respiratory'
      },
      {
        id: 'cough_triggers',
        question: 'What triggers your cough?',
        type: 'checkbox',
        options: ['Cold air', 'Exercise', 'Lying down', 'Eating', 'Nothing specific'],
        category: 'respiratory'
      }
    ],
    headache: [
      {
        id: 'headache_location',
        question: 'Where is your headache located?',
        type: 'select',
        options: ['Front of head', 'Back of head', 'One side', 'All over', 'Behind eyes'],
        category: 'neurological'
      },
      {
        id: 'headache_triggers',
        question: 'What triggers your headache?',
        type: 'checkbox',
        options: ['Stress', 'Lack of sleep', 'Bright lights', 'Loud noises', 'Certain foods'],
        category: 'neurological'
      }
    ]
  };

  const defaultQuestions = [
    {
      id: 'general_health',
      question: 'How would you rate your overall health?',
      type: 'select',
      options: ['Excellent', 'Good', 'Fair', 'Poor'],
      category: 'general'
    },
    {
      id: 'medications',
      question: 'Are you currently taking any medications?',
      type: 'radio',
      options: ['Yes', 'No'],
      category: 'general'
    }
  ];

  const symptomQuestions = questionSets[primarySymptom] || [];
  const allQuestions = [...symptomQuestions, ...defaultQuestions];
  
  return allQuestions[questionNumber - 1] || null;
}

module.exports = router;
