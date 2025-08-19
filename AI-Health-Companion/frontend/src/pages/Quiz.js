import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Brain,
  Shield,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    startQuiz, 
    submitAnswer, 
    currentQuestion, 
    quizProgress, 
    isQuizInProgress, 
    isQuizCompleted,
    getQuizAnalysis,
    getQuizSummary,
    resetQuiz
  } = useQuiz();

  const [quizData, setQuizData] = useState({
    primarySymptom: '',
    severity: '',
    duration: ''
  });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const symptoms = [
    { value: 'fever', label: 'Fever', icon: '🌡️' },
    { value: 'cough', label: 'Cough', icon: '🤧' },
    { value: 'headache', label: 'Headache', icon: '🤕' },
    { value: 'fatigue', label: 'Fatigue', icon: '😴' },
    { value: 'nausea', label: 'Nausea', icon: '🤢' },
    { value: 'dizziness', label: 'Dizziness', icon: '💫' },
    { value: 'chest_pain', label: 'Chest Pain', icon: '💔' },
    { value: 'abdominal_pain', label: 'Abdominal Pain', icon: '🤰' },
    { value: 'joint_pain', label: 'Joint Pain', icon: '🦴' },
    { value: 'skin_rash', label: 'Skin Rash', icon: '🔴' },
    { value: 'shortness_of_breath', label: 'Shortness of Breath', icon: '😮‍💨' },
    { value: 'loss_of_appetite', label: 'Loss of Appetite', icon: '🍽️' },
    { value: 'insomnia', label: 'Insomnia', icon: '😵' },
    { value: 'anxiety', label: 'Anxiety', icon: '😰' }
  ];

  const severityLevels = [
    { value: 'mild', label: 'Mild', description: 'Noticeable but not interfering with daily activities' },
    { value: 'moderate', label: 'Moderate', description: 'Somewhat interfering with daily activities' },
    { value: 'severe', label: 'Severe', description: 'Significantly interfering with daily activities' }
  ];

  const durationOptions = [
    { value: 'less_than_24h', label: 'Less than 24 hours' },
    { value: '1_3_days', label: '1-3 days' },
    { value: '3_7_days', label: '3-7 days' },
    { value: 'more_than_week', label: 'More than a week' }
  ];

  const handleStartQuiz = async () => {
    if (!quizData.primarySymptom || !quizData.severity || !quizData.duration) {
      toast.error('Please select all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await startQuiz(quizData);
      toast.success('Quiz started! Let\'s begin with the first question.');
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer) {
      toast.error('Please provide an answer');
      return;
    }

    setIsSubmitting(true);
    try {
      const answerData = {
        quizId: currentQuestion?.quizId,
        questionId: currentQuestion?.id,
        answer: currentAnswer,
        question: currentQuestion?.question,
        category: currentQuestion?.category
      };

      await submitAnswer(answerData);
      setCurrentAnswer('');
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    resetQuiz();
    setQuizData({
      primarySymptom: '',
      severity: '',
      duration: ''
    });
    setCurrentAnswer('');
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { question, type, options } = currentQuestion;

    switch (type) {
      case 'select':
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              {question}
            </label>
            <select
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="input-field text-lg"
            >
              <option value="">Select an option</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              {question}
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              {question}
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCurrentAnswer(prev => 
                          Array.isArray(prev) ? [...prev, option] : [option]
                        );
                      } else {
                        setCurrentAnswer(prev => 
                          Array.isArray(prev) ? prev.filter(item => item !== option) : []
                        );
                      }
                    }}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              {question}
            </label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Please describe your answer..."
            />
          </div>
        );
    }
  };

  const renderQuizResults = () => {
    const analysis = getQuizAnalysis();
    const summary = getQuizSummary();

    if (!analysis) return null;

    return (
      <div className="space-y-8">
        {/* Quiz Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Summary</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Primary Symptom</p>
              <p className="font-medium text-gray-900 capitalize">
                {summary?.primarySymptom?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Severity</p>
              <p className="font-medium text-gray-900 capitalize">{summary?.severity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium text-gray-900 capitalize">
                {summary?.duration?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Risk Level</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                summary?.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                summary?.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {summary?.riskLevel?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Confidence Level</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysis.confidence}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{analysis.confidence}% confident</p>
            </div>

            {analysis.possibleConditions?.map((condition, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{condition.condition}</h4>
                  <span className="text-sm text-gray-600">{condition.probability}% probability</span>
                </div>
                <p className="text-gray-600 text-sm">{condition.description}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                  condition.severity === 'high' ? 'bg-red-100 text-red-800' :
                  condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {condition.severity} severity
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-health-600" />
            <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {analysis.recommendations?.map((rec, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    rec.type === 'immediate' ? 'bg-red-100 text-red-800' :
                    rec.type === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    rec.type === 'routine' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">Priority {rec.priority}</span>
                </div>
                <h4 className="font-medium text-gray-900">{rec.action}</h4>
                <p className="text-gray-600 text-sm">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Important Disclaimer</h4>
              <p className="text-yellow-700 text-sm mt-1">
                {analysis.disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRestartQuiz}
            className="btn-secondary flex-1"
          >
            Take Another Quiz
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary flex-1"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  };

  if (isQuizCompleted()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
        <div className="container-max px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-health-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-health-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Completed!
              </h1>
              <p className="text-gray-600">
                Here's your personalized health analysis and recommendations
              </p>
            </div>
            {renderQuizResults()}
          </div>
        </div>
      </div>
    );
  }

  if (isQuizInProgress()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
        <div className="container-max px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Question {quizProgress.current + 1} of {quizProgress.total}</p>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${quizProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-large p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Health Assessment
                </h2>
                <p className="text-gray-600">
                  Please answer the following question to help us understand your symptoms better
                </p>
              </div>

              {renderQuestion()}

              <div className="mt-8">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer || isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Setup Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
      <div className="container-max px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-health-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Symptom Assessment Quiz
            </h1>
            <p className="text-gray-600">
              Let's understand your symptoms better. This quiz is designed in collaboration with practicing MBBS doctors.
            </p>
          </div>

          {/* Quiz Setup Form */}
          <div className="bg-white rounded-2xl shadow-large p-8">
            <div className="space-y-6">
              {/* Primary Symptom */}
              <div>
                <label className="form-label text-lg">
                  What is your primary symptom? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {symptoms.map((symptom) => (
                    <button
                      key={symptom.value}
                      type="button"
                      onClick={() => setQuizData(prev => ({ ...prev, primarySymptom: symptom.value }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        quizData.primarySymptom === symptom.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{symptom.icon}</div>
                      <div className="text-sm font-medium">{symptom.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="form-label text-lg">
                  How severe is your symptom? *
                </label>
                <div className="space-y-3 mt-3">
                  {severityLevels.map((level) => (
                    <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value={level.value}
                        checked={quizData.severity === level.value}
                        onChange={(e) => setQuizData(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                      />
                      <div>
                        <span className="font-medium text-gray-900">{level.label}</span>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="form-label text-lg">
                  How long have you been experiencing this symptom? *
                </label>
                <div className="space-y-3 mt-3">
                  {durationOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="duration"
                        value={option.value}
                        checked={quizData.duration === option.value}
                        onChange={(e) => setQuizData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Important Note</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      This quiz is for informational purposes only and should not replace professional medical advice. 
                      If you're experiencing severe symptoms, please consult a healthcare professional immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                disabled={!quizData.primarySymptom || !quizData.severity || !quizData.duration || isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Starting Quiz...</span>
                  </>
                ) : (
                  'Start Symptom Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
