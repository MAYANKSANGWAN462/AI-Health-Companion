import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizHistory = () => {
  const { getQuizHistory, deleteQuiz, quizHistory, loading } = useQuiz();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        await getQuizHistory(currentPage);
      } catch (error) {
        console.error('Failed to fetch quiz history:', error);
      }
    };

    fetchQuizHistory();
  }, [getQuizHistory, currentPage]);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteQuiz(quizId);
      } catch (error) {
        // Error already handled in context
      }
    }
  };

  const getSymptomIcon = (symptom) => {
    const icons = {
      fever: '🌡️',
      cough: '🤧',
      headache: '🤕',
      fatigue: '😴',
      nausea: '🤢',
      dizziness: '💫',
      chest_pain: '💔',
      abdominal_pain: '🤰',
      joint_pain: '🦴',
      skin_rash: '🔴',
      shortness_of_breath: '😮‍💨',
      loss_of_appetite: '🍽️',
      insomnia: '😵',
      anxiety: '😰'
    };
    return icons[symptom] || '🏥';
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQuizDetails = (quiz) => {
    if (!quiz) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Quiz Details</h3>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Primary Symptom</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {quiz.symptoms?.primary?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <p className="font-medium text-gray-900 capitalize">{quiz.symptoms?.severity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {quiz.symptoms?.duration?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    quiz.status === 'completed' ? 'bg-green-100 text-green-800' :
                    quiz.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quiz.status}
                  </span>
                </div>
              </div>

              {/* AI Analysis */}
              {quiz.aiAnalysis && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">AI Analysis</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Confidence Level</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${quiz.aiAnalysis.confidence}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{quiz.aiAnalysis.confidence}% confident</p>
                    </div>

                    {quiz.aiAnalysis.possibleConditions?.map((condition, index) => (
                      <div key={index} className="border-l-2 border-primary-500 pl-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">{condition.condition}</h5>
                          <span className="text-sm text-gray-600">{condition.probability}% probability</span>
                        </div>
                        <p className="text-sm text-gray-600">{condition.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {quiz.aiAnalysis?.recommendations && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {quiz.aiAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
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
                        <p className="font-medium text-gray-900">{rec.action}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Disclaimer</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      {quiz.aiAnalysis?.disclaimer || 'This analysis is for informational purposes only and should not replace professional medical advice.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
        <div className="container-max px-4 py-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your quiz history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
      <div className="container-max px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
            <p className="text-gray-600 mt-2">
              View all your health assessments and results
            </p>
          </div>
          <Link to="/quiz" className="btn-primary">
            Take New Quiz
          </Link>
        </div>

        {/* Quiz List */}
        {quizHistory?.quizzes && quizHistory.quizzes.length > 0 ? (
          <div className="space-y-4">
            {quizHistory.quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">
                        {getSymptomIcon(quiz.symptoms?.primary)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {quiz.symptoms?.primary?.replace('_', ' ')}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(quiz.createdAt)}</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">{quiz.symptoms?.severity} severity</span>
                        <span>•</span>
                        <span className="capitalize">{quiz.symptoms?.duration?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusIcon(quiz.status)}
                    
                    {quiz.aiAnalysis && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getRiskLevelColor(quiz.aiAnalysis.riskLevel || 'low')
                      }`}>
                        {quiz.aiAnalysis.riskLevel || 'low'} risk
                      </span>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedQuiz(quiz)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {quizHistory.pagination && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!quizHistory.pagination.hasPrev}
                  className="px-4 py-2 text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-600">
                  Page {quizHistory.pagination.current} of {quizHistory.pagination.total}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!quizHistory.pagination.hasNext}
                  className="px-4 py-2 text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No quiz history yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start taking health assessments to build your health history
            </p>
            <Link to="/quiz" className="btn-primary">
              Take Your First Quiz
            </Link>
          </div>
        )}
      </div>

      {/* Quiz Details Modal */}
      {selectedQuiz && renderQuizDetails(selectedQuiz)}
    </div>
  );
};

export default QuizHistory;
