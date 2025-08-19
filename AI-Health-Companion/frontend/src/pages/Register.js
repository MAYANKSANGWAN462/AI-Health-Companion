import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  User,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [registrationData, setRegistrationData] = useState(null);
  
  const { register: registerUser, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm();

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const handleRegistration = async (data) => {
    try {
      const result = await registerUser(data);
      setRegistrationData(result);
      setIsOtpMode(true);
      toast.success('Registration successful! Please verify your phone number.');
    } catch (error) {
      // Error already handled in auth context
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await verifyOTP(registrationData.phone, otp);
      toast.success('Phone number verified successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      // Error already handled in auth context
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      await resendOTP(registrationData.phone);
      setOtpCountdown(60);
      const interval = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // Error already handled in auth context
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleBackToRegistration = () => {
    setIsOtpMode(false);
    setOtp('');
    setOtpCountdown(0);
    setRegistrationData(null);
  };

  if (isOtpMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-health-500 to-primary-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                AI Health Companion
              </span>
            </Link>
          </div>

          {/* OTP Verification Card */}
          <div className="bg-white rounded-3xl shadow-large p-8">
            <div className="text-center mb-6">
              <button
                onClick={handleBackToRegistration}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Registration</span>
              </button>
              
              <div className="w-16 h-16 bg-health-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-health-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Phone Number
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit OTP to <span className="font-semibold">{registrationData?.phone}</span>
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleOtpVerification(); }} className="space-y-6">
              <div>
                <label htmlFor="otp" className="form-label">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={!otp || otp.length !== 6}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify OTP
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the OTP?
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpCountdown > 0 || isResendingOtp}
                  className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingOtp ? (
                    'Sending...'
                  ) : otpCountdown > 0 ? (
                    `Resend in ${otpCountdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-health-500 to-primary-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">
              AI Health Companion
            </span>
          </Link>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl shadow-large p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join us and start your health journey today
            </p>
          </div>

          <form onSubmit={handleSubmit(handleRegistration)} className="space-y-6">
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Name cannot exceed 50 characters'
                    }
                  })}
                  className={`input-field pl-10 ${errors.name ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[\d\s-()]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className={`input-field pl-10 ${errors.phone ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className={`input-field pl-10 ${errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
