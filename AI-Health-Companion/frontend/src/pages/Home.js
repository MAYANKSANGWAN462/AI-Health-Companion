import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Brain, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Send
} from 'lucide-react';
import ContactForm from '../components/forms/ContactForm';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary-600" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your symptoms and provide personalized health insights.'
    },
    {
      icon: <Shield className="w-8 h-8 text-health-600" />,
      title: 'Medical Expertise',
      description: 'Developed in collaboration with practicing MBBS doctors for accurate and reliable assessments.'
    },
    {
      icon: <Users className="w-8 h-8 text-warning-600" />,
      title: '24/7 Support',
      description: 'Get health guidance anytime, anywhere with our round-the-clock AI health companion.'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Start Symptom Quiz',
      description: 'Begin by selecting your primary symptom and answering a few simple questions.',
      icon: <Heart className="w-6 h-6 text-primary-600" />
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our AI system processes your responses using medical knowledge and algorithms.',
      icon: <Brain className="w-6 h-6 text-health-600" />
    },
    {
      step: '03',
      title: 'Get Insights',
      description: 'Receive personalized health insights and recommendations based on your symptoms.',
      icon: <Shield className="w-6 h-6 text-warning-600" />
    },
    {
      step: '04',
      title: 'Professional Care',
      description: 'Connect with real doctors when needed for professional medical advice.',
      icon: <Users className="w-6 h-6 text-danger-600" />
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="relative container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Your AI-Powered
                  <span className="block text-gradient">Health Companion</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Get instant health insights, symptom analysis, and personalized recommendations 
                  powered by advanced AI and medical expertise.
                </p>
              </div>

              {isAuthenticated ? (
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    Welcome back, <span className="font-semibold text-primary-600">{user?.name}</span>! 
                    Ready to check your health?
                  </p>
                  <Link to="/quiz" className="btn-primary inline-flex items-center space-x-2">
                    <span>Take Symptom Quiz</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link to="/quiz" className="btn-primary inline-flex items-center space-x-2">
                    <span>Take Symptom Quiz</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-sm text-gray-500 max-w-md">
                    This quiz is generated in collaboration with practicing MBBS doctors. 
                    It is not a replacement for professional medical advice.
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-large border border-white/20">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-health-500 to-primary-500 rounded-2xl mx-auto flex items-center justify-center">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Health Assessment</h3>
                    <p className="text-gray-600">
                      Get personalized health insights in minutes
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-10 -right-10 w-16 h-16 bg-health-100 rounded-2xl animate-float"></div>
              <div className="absolute bottom-10 -left-10 w-12 h-12 bg-primary-100 rounded-2xl animate-float-delayed"></div>
              <div className="absolute top-1/2 -right-5 w-8 h-8 bg-warning-100 rounded-xl animate-float-more-delayed"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose AI Health Companion?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge AI technology with medical expertise to provide you with 
              reliable health insights and guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="section-padding gradient-bg">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                About AI Health Companion
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are dedicated to making healthcare more accessible and understandable for everyone. 
                Our AI-driven platform helps users understand their symptoms, get health awareness, 
                and make informed decisions about their well-being.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                While we provide valuable health insights, we always emphasize that our tool is 
                designed to complement, not replace, professional medical advice. Our goal is to 
                empower you with knowledge and guide you toward appropriate healthcare decisions.
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-health-600" />
                  <span className="text-sm text-gray-600">MBBS Doctor Collaboration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-health-600" />
                  <span className="text-sm text-gray-600">AI-Powered Analysis</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-large">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">AI Technology</h4>
                      <p className="text-sm text-gray-600">Advanced machine learning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-health-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-health-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Medical Expertise</h4>
                      <p className="text-sm text-gray-600">Doctor-verified insights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-warning-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">User-Centric</h4>
                      <p className="text-sm text-gray-600">Personalized experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section id="how-we-work" className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get health insights in just a few simple steps with our AI-powered symptom analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-health-500 rounded-2xl flex items-center justify-center mx-auto text-white font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-medium">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/quiz" className="btn-primary inline-flex items-center space-x-2">
              <span>Start Your Health Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="section-padding gradient-bg">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600">
                Have questions about our AI Health Companion? Want to learn more about our services? 
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">support@aihealthcompanion.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-health-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-health-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">123 Health Street, Medical City, MC 12345</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-large">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
