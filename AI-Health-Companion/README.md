# AI Health Companion 🏥

A comprehensive AI-powered health support application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that helps users understand symptoms and get health insights through intelligent quizzes.

## ✨ Features

### 🔐 Authentication System
- **Phone + OTP Verification**: Secure phone number verification with SMS OTP
- **Google OAuth**: Alternative authentication method (configurable)
- **JWT Tokens**: Secure session management
- **User Profiles**: Comprehensive user management

### 🧠 AI-Powered Symptom Quiz
- **Intelligent Questions**: Dynamic question flow based on symptoms
- **AI Analysis**: Rule-based symptom analysis with medical insights
- **Risk Assessment**: Automated risk level evaluation
- **Personalized Recommendations**: Tailored health advice

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on all devices
- **TailwindCSS + Bootstrap**: Beautiful, modern interface
- **Smooth Animations**: Engaging user experience
- **Dark/Light Mode**: Theme customization (future feature)

### 📊 Health Dashboard
- **Quiz History**: Track all your health assessments
- **Health Insights**: AI-generated health patterns
- **Progress Tracking**: Monitor your health journey
- **Personalized Stats**: Individual health analytics

### 📞 Contact System
- **Contact Forms**: Easy communication with support team
- **Message Management**: Admin panel for message handling
- **Priority System**: Intelligent message prioritization

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Twilio** - SMS OTP (configurable)

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Bootstrap** - Component library
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-health-companion
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai-health-companion

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Twilio Configuration (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Client URL
CLIENT_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=your-session-secret-key
```

### 4. Database Setup
Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if not running as a service)
mongod

# Or if using MongoDB Atlas, update MONGODB_URI in .env
```

### 5. Run the Application

#### Development Mode (Both Backend & Frontend)
```bash
npm run dev
```

#### Individual Services
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

#### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/logout` - User logout

### Quiz Management
- `POST /api/quiz/start` - Start new quiz
- `POST /api/quiz/answer` - Submit quiz answer
- `GET /api/quiz/:id` - Get quiz details
- `GET /api/quiz/history` - Get quiz history
- `DELETE /api/quiz/:id` - Delete quiz

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/health-profile` - Update health profile
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/dashboard` - Get dashboard data

### Contact System
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/messages` - Get messages (admin)
- `PUT /api/contact/messages/:id/status` - Update message status
- `PUT /api/contact/messages/:id/reply` - Reply to message

## 🔧 Configuration

### MongoDB Connection
Update the `MONGODB_URI` in your `.env` file to point to your MongoDB instance.

### SMS OTP (Twilio)
To enable SMS OTP functionality:
1. Sign up for a Twilio account
2. Get your Account SID and Auth Token
3. Update the Twilio configuration in `.env`
4. The system will automatically send OTPs via SMS

### Google OAuth
To enable Google authentication:
1. Create a Google Cloud project
2. Configure OAuth 2.0 credentials
3. Update the Google configuration in `.env`

## 🎯 Usage

### 1. User Registration
- Users can register with phone number, email, and password
- Phone verification is required via OTP
- Account is activated after successful verification

### 2. Symptom Quiz
- Users select their primary symptom
- Answer follow-up questions based on symptoms
- AI analyzes responses and provides insights
- Get personalized health recommendations

### 3. Health Dashboard
- View quiz history and results
- Track health patterns over time
- Access AI-generated health insights
- Manage personal health profile

### 4. Contact Support
- Submit inquiries through contact forms
- Get priority-based response handling
- Admin panel for message management

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Update `MONGODB_URI` to production database
3. Configure production JWT secrets
4. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Run `npm run build` to create production build
2. Deploy the `build` folder to your hosting service
3. Update API endpoints to point to production backend

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request handling
- **Helmet Security**: Security headers middleware
- **Rate Limiting**: API request throttling (configurable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🔮 Future Enhancements

- **Dark/Light Mode Toggle**
- **Advanced AI Integration** (OpenAI, GPT models)
- **Doctor Connect Feature**
- **Health Tips Section**
- **Chatbot Integration**
- **Mobile App Development**
- **Multi-language Support**
- **Advanced Analytics Dashboard**

## 📊 Project Structure

```
ai-health-companion/
├── backend/                 # Backend server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── package.json            # Root package.json
└── README.md              # This file
```

---

**Built with ❤️ for better healthcare accessibility**

*This application is for informational purposes only and should not replace professional medical advice.*
