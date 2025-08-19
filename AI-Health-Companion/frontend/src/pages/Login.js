import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  ArrowLeft,
  Lock,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  const { login, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm();

  const identifier = watch('identifier');

  const handleLogin = async (data) => {
    try {
      const result = await login(data.identifier, data.password);
      
      if (result.requiresVerification) {
        // Switch to OTP verification mode
        setPhone(data.identifier);
        setIsOtpMode(true);
        toast.error('Please verify your phone number first');
      } else {
        // Login successful, redirect
        navigate(from, { replace: true });
      }
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
      await verifyOTP(phone, otp);
      navigate(from, { replace: true });
    } catch (error) {
      // Error already handled in auth context
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      await resendOTP(phone);
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

  const handleBackToLogin = () => {
    setIsOtpMode(false);
    setOtp('');
    setPhone('');
    setOtpCountdown(0);
  };

  const isPhoneNumber = (value) => {
    return /^\+?[\d\s-()]+$/.test(value);
  };

  const isEmail = (value) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
  };

  const getInputType = () => {
    if (!identifier) return 'text';
    if (isPhoneNumber(identifier)) return 'tel';
    if (isEmail(identifier)) return 'email';
    return 'text';
  };

  const getInputIcon = () => {
    if (!identifier) return <User className="w-5 h-5 text-gray-400" />;
    if (isPhoneNumber(identifier)) return <Phone className="w-5 h-5 text-gray-400" />;
    if (isEmail(identifier)) return <Mail className="w-5 h-5 text-gray-400" />;
    return <User className="w-5 h-5 text-gray-400" />;
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
                onClick={handleBackToLogin}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Phone Number
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit OTP to <span className="font-semibold">{phone}</span>
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

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-large p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="form-label">
                Phone Number or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getInputIcon()}
                </div>
                <input
                  type={getInputType()}
                  id="identifier"
                  {...register('identifier', {
                    required: 'Phone number or email is required'
                  })}
                  className={`input-field pl-10 ${errors.identifier ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Enter phone number or email"
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Password is required'
                  })}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
