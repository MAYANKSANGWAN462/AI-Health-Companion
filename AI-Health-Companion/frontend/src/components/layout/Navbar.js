import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Dashboard,
  History,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', href: '#home', action: () => scrollToSection('home') },
    { name: 'About Us', href: '#about', action: () => scrollToSection('about') },
    { name: 'How We Work', href: '#how-we-work', action: () => scrollToSection('how-we-work') },
    { name: 'Contact Us', href: '#contact', action: () => scrollToSection('contact') }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-medium border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="container-max">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-health-500 to-primary-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">
              AI Health Companion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={item.action}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <div className="flex items-center space-x-3">
                  {/* Welcome Message */}
                  <span className="hidden sm:block text-sm text-gray-700">
                    Welcome, <span className="font-semibold text-primary-600">{user?.name}</span>
                  </span>
                  
                  {/* User Avatar */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 transition-all duration-200"
                  >
                    <img
                      src={user?.avatar || 'https://via.placeholder.com/32/4F46E5/FFFFFF?text=U'}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Dashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/quiz-history"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <History className="w-4 h-4" />
                      <span>Quiz History</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/quiz-history"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    Quiz History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
