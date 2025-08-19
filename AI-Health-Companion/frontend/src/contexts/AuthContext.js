import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: state.token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/register', userData);
      toast.success('Registration successful! Please verify your phone number.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (phone, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { phone, otp });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      toast.success('Phone number verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'OTP verification failed';
      toast.error(message);
      throw error;
    }
  };

  // Login user
  const login = async (identifier, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/login', { identifier, password });
      
      if (response.data.requiresVerification) {
        toast.error('Please verify your phone number first');
        return { requiresVerification: true, userId: response.data.userId };
      }

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Resend OTP
  const resendOTP = async (phone) => {
    try {
      const response = await axios.post('/api/auth/resend-otp', { phone });
      toast.success('New OTP sent successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to resend OTP';
      toast.error(message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/user/profile', profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user
      });
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  };

  // Update health profile
  const updateHealthProfile = async (healthData) => {
    try {
      const response = await axios.put('/api/user/health-profile', healthData);
      dispatch({
        type: 'UPDATE_USER',
        payload: { healthProfile: response.data.healthProfile }
      });
      toast.success('Health profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update health profile';
      toast.error(message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/user/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to change password';
      toast.error(message);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async (password) => {
    try {
      await axios.delete('/api/user/account', { data: { password } });
      dispatch({ type: 'LOGOUT' });
      toast.success('Account deleted successfully');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete account';
      toast.error(message);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    register,
    verifyOTP,
    login,
    resendOTP,
    logout,
    updateProfile,
    updateHealthProfile,
    changePassword,
    deleteAccount,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
