import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { 
  Heart, 
  Brain, 
  History, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { getQuizHistory, quizHistory, loading } = useQuiz();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageConfidence: 0,
    mostCommonSymptom: null
  });

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        await getQuizHistory();
      } catch (error) {
        console.error('Failed to fetch quiz history:', error);
      }
    };

    fetchQuizHistory();
  }, [getQuizHistory]);

  useEffect(() => {
    if (quizHistory?.quizzes) {
      const quizzes = quizHistory.quizzes;
      const completed = quizzes.filter(q => q.status === 'completed');
      
      const totalConfidence = completed.reduce((sum, q) => sum + (q.aiAnalysis?.confidence || 0), 0);
      const avgConfidence = completed.length > 0 ? Math.round(totalConfidence / completed.length) : 0;
      
      // Find most common symptom
      const symptomCounts = {};
      completed.forEach(q => {
        const symptom = q.symptoms?.primary;
        if (symptom) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
      
      const mostCommon = Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)[0];

      setStats({
        totalQuizzes: quizzes.length,
        completedQuizzes: completed.length,
        averageConfidence: avgConfidence,
        mostCommonSymptom: mostCommon ? mostCommon[0].replace('_', ' ') : null
      });
    }
  }, [quizHistory]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
        <div className="container-max px-4 py-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 pt-20">
      <div className="container-max px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="text-gradient">{user?.name}</span>! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Here's your personalized health dashboard with insights and recommendations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            to="/quiz"
            className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-health-500 to-primary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Take New Quiz
                </h3>
                <p className="text-gray-600">
                  Start a new symptom assessment to get health insights
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/quiz-history"
            className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-health-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <History className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  View History
                </h3>
                <p className="text-gray-600">
                  Check your previous health assessments and results
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-health-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-health-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageConfidence}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Common Symptom</p>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {stats.mostCommonSymptom || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Health Assessments</h2>
            <Link
              to="/quiz-history"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>

          {quizHistory?.quizzes && quizHistory.quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizHistory.quizzes.slice(0, 5).map((quiz) => (
                <div
                  key={quiz._id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {getSymptomIcon(quiz.symptoms?.primary)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {quiz.symptoms?.primary?.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(quiz.createdAt)} • {quiz.symptoms?.severity} severity
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getRiskLevelColor(quiz.aiAnalysis?.riskLevel || 'low')
                      }`}>
                        {quiz.aiAnalysis?.riskLevel || 'low'} risk
                      </span>
                      
                      {quiz.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No health assessments yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your first symptom quiz to get personalized health insights
              </p>
              <Link to="/quiz" className="btn-primary">
                Take Your First Quiz
              </Link>
            </div>
          )}
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-r from-primary-500 to-health-500 rounded-2xl p-8 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Daily Health Tip
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Regular health assessments help you stay aware of your well-being and catch potential issues early. 
              Remember, prevention is always better than cure!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm opacity-90">
              <AlertTriangle className="w-4 h-4" />
              <span>This is for informational purposes only. Always consult healthcare professionals for medical advice.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
