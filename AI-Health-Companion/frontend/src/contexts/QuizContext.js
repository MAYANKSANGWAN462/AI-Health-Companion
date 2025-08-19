import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const QuizContext = createContext();

const initialState = {
  currentQuiz: null,
  quizHistory: [],
  loading: false,
  error: null,
  currentQuestion: null,
  quizProgress: {
    current: 0,
    total: 0,
    percentage: 0
  }
};

const quizReducer = (state, action) => {
  switch (action.type) {
    case 'QUIZ_START':
      return {
        ...state,
        currentQuiz: action.payload,
        currentQuestion: action.payload.nextQuestion,
        quizProgress: {
          current: 0,
          total: 5,
          percentage: 0
        },
        loading: false,
        error: null
      };
    case 'QUIZ_QUESTION_ANSWERED':
      return {
        ...state,
        currentQuiz: action.payload.quiz,
        currentQuestion: action.payload.nextQuestion,
        quizProgress: action.payload.progress,
        loading: false
      };
    case 'QUIZ_COMPLETED':
      return {
        ...state,
        currentQuiz: action.payload.quiz,
        currentQuestion: null,
        quizProgress: {
          current: 5,
          total: 5,
          percentage: 100
        },
        loading: false
      };
    case 'QUIZ_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'QUIZ_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'QUIZ_HISTORY_LOADED':
      return {
        ...state,
        quizHistory: action.payload,
        loading: false
      };
    case 'QUIZ_RESET':
      return {
        ...state,
        currentQuiz: null,
        currentQuestion: null,
        quizProgress: {
          current: 0,
          total: 0,
          percentage: 0
        }
      };
    default:
      return state;
  }
};

export const QuizProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Start a new quiz
  const startQuiz = async (quizData) => {
    dispatch({ type: 'QUIZ_LOADING' });
    try {
      const response = await axios.post('/api/quiz/start', quizData);
      dispatch({
        type: 'QUIZ_START',
        payload: response.data
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to start quiz';
      dispatch({ type: 'QUIZ_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Submit answer to current question
  const submitAnswer = async (answerData) => {
    dispatch({ type: 'QUIZ_LOADING' });
    try {
      const response = await axios.post('/api/quiz/answer', answerData);
      
      if (response.data.analysis) {
        // Quiz completed
        dispatch({
          type: 'QUIZ_COMPLETED',
          payload: { quiz: response.data.quiz }
        });
        toast.success('Quiz completed! Check your results below.');
      } else {
        // More questions to answer
        dispatch({
          type: 'QUIZ_QUESTION_ANSWERED',
          payload: {
            quiz: response.data.quiz,
            nextQuestion: response.data.nextQuestion,
            progress: response.data.progress
          }
        });
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to submit answer';
      dispatch({ type: 'QUIZ_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Get quiz history
  const getQuizHistory = async (page = 1, limit = 10) => {
    dispatch({ type: 'QUIZ_LOADING' });
    try {
      const response = await axios.get(`/api/quiz/history?page=${page}&limit=${limit}`);
      dispatch({
        type: 'QUIZ_HISTORY_LOADED',
        payload: response.data
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load quiz history';
      dispatch({ type: 'QUIZ_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Get specific quiz details
  const getQuizDetails = async (quizId) => {
    try {
      const response = await axios.get(`/api/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load quiz details';
      toast.error(message);
      throw error;
    }
  };

  // Delete quiz
  const deleteQuiz = async (quizId) => {
    try {
      await axios.delete(`/api/quiz/${quizId}`);
      toast.success('Quiz deleted successfully');
      // Refresh quiz history
      getQuizHistory();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete quiz';
      toast.error(message);
      throw error;
    }
  };

  // Reset current quiz
  const resetQuiz = () => {
    dispatch({ type: 'QUIZ_RESET' });
  };

  // Get current question
  const getCurrentQuestion = () => {
    return state.currentQuestion;
  };

  // Get quiz progress
  const getQuizProgress = () => {
    return state.quizProgress;
  };

  // Check if quiz is in progress
  const isQuizInProgress = () => {
    return state.currentQuiz && state.currentQuiz.status === 'in_progress';
  };

  // Check if quiz is completed
  const isQuizCompleted = () => {
    return state.currentQuiz && state.currentQuiz.status === 'completed';
  };

  // Get quiz analysis
  const getQuizAnalysis = () => {
    return state.currentQuiz?.aiAnalysis || null;
  };

  // Get quiz summary
  const getQuizSummary = () => {
    return state.currentQuiz?.getSummary ? state.currentQuiz.getSummary() : null;
  };

  const value = {
    ...state,
    startQuiz,
    submitAnswer,
    getQuizHistory,
    getQuizDetails,
    deleteQuiz,
    resetQuiz,
    getCurrentQuestion,
    getQuizProgress,
    isQuizInProgress,
    isQuizCompleted,
    getQuizAnalysis,
    getQuizSummary
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
