# HectoClash - Real-Time Competitive Mathematical Puzzle Game

HectoClash is a modern web application built with the MERN stack that brings competitive mathematical gaming to the web. Players compete in real-time duels to solve Hectoc puzzles - creating mathematical expressions from six given digits that equal 100.

## 🎮 Features

### Core Gameplay
- **Real-Time Duels**: Compete against other players in live mathematical battles
- **Hectoc Puzzles**: Use six digits (1-9) with mathematical operations (+, -, ×, ÷, ^, parentheses) to equal 100
- **Smart Matchmaking**: ELO-based rating system ensures balanced competition
- **Practice Mode**: Hone your skills with unlimited puzzles and hints

### Social & Competitive
- **Global Leaderboards**: Track your progress against players worldwide
- **Rating System**: Dynamic ELO-based ratings that reflect your skill level
- **Spectator Mode**: Watch live games and learn from other players
- **Detailed Statistics**: Comprehensive performance analytics and progress tracking

### Modern Features
- **Real-Time Communication**: Socket.io powered live updates and notifications
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Guest Mode**: Play without registration or create an account for full features
- **Achievement System**: Unlock badges and track milestones

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Socket.io** - Real-time bidirectional communication
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing and security

### Frontend
- **React** - Modern JavaScript UI library
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Elegant notification system
- **CSS3** - Modern styling with custom properties and responsive design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hectoclash.git
cd hectoclash
```

### 2. Backend Setup
```bash
# Navigate to backend directory
mkdir hectoclash-backend
cd hectoclash-backend

# Copy backend files (server.js, models/, routes/, socket/)
# Copy package.json content to backend-package.json

# Install dependencies
npm install express socket.io mongoose cors helmet jsonwebtoken bcryptjs express-rate-limit joi dotenv

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Set MONGODB_URI to your MongoDB connection string
# Set JWT_SECRET to a secure random string
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
mkdir hectoclash-frontend
cd hectoclash-frontend

# Initialize React app
npx create-react-app .

# Install additional dependencies
npm install react-router-dom socket.io-client axios react-hot-toast

# Copy frontend files (src/components/, src/contexts/, src/styles/)
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas and update MONGODB_URI in .env
```

### 5. Running the Application
```bash
# Terminal 1: Start backend server
cd hectoclash-backend
npm run dev

# Terminal 2: Start frontend development server
cd hectoclash-frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
hectoclash/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with authentication
│   │   └── Game.js          # Game model with puzzle logic
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── games.js         # Game management endpoints
│   │   └── users.js         # User management endpoints
│   ├── socket/
│   │   └── gameSocket.js    # Real-time game logic
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js     # Authentication component
│   │   │   ├── Lobby.js     # Main lobby interface
│   │   │   ├── Game.js      # Real-time game interface
│   │   │   ├── Practice.js  # Practice mode component
│   │   │   ├── Profile.js   # User profile and statistics
│   │   │   └── Leaderboard.js # Global rankings
│   │   ├── contexts/
│   │   │   ├── AuthContext.js   # Authentication state management
│   │   │   └── SocketContext.js # Socket.io connection management
│   │   ├── styles/
│   │   │   └── variables.css    # CSS custom properties
│   │   ├── App.js           # Main application component
│   │   └── App.css          # Global styles
│   └── package.json         # Frontend dependencies
└── README.md                # This file
```

## 🎯 Game Rules

### Hectoc Puzzle Format
1. **Objective**: Create a mathematical expression that equals 100
2. **Given**: Six digits (each between 1-9)
3. **Allowed Operations**: +, -, ×, ÷, ^ (exponentiation), parentheses
4. **Constraint**: Digits must be used in the given order (no rearrangement)

### Example
**Puzzle**: 1-2-3-4-5-6  
**Solution**: `1 × 2 × 3 + 4 × 5 × 6 - 2`  
**Calculation**: (1 × 2 × 3) + (4 × 5 × 6) - 2 = 6 + 120 - 2 = 124... 

Wait, let me recalculate: `(1 + 2 + 3 + 4) × (5 + 6) - 10 = 10 × 11 - 10 = 100` ✓

## 🏆 Rating System

HectoClash uses an ELO-based rating system:
- **Starting Rating**: 1200
- **Rating Changes**: Based on opponent strength and game outcome
- **Matchmaking**: Players matched within ±200 rating points when possible
- **Leaderboards**: Global rankings updated in real-time

## 🌐 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Environment Variables**:
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. **Build Command**: `npm install`
3. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build Command**: `npm run build`
2. **Output Directory**: `build`
3. **Environment Variables**:
   ```bash
   REACT_APP_SERVER_URL=https://your-backend-domain.com
   ```

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Add your IP address to the whitelist
3. Create a database user
4. Get the connection string and add to `MONGODB_URI`

## 🔧 Development

### Adding New Features

1. **Backend API**: Add new routes in `routes/` directory
2. **Database Models**: Extend existing models or create new ones in `models/`
3. **Socket Events**: Add real-time features in `socket/gameSocket.js`
4. **Frontend Components**: Create new React components in `src/components/`
5. **Styling**: Add CSS in component-specific files or update global styles

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

### Games
- `GET /api/games/active` - List active games
- `GET /api/games/:gameId` - Get game details
- `GET /api/games/leaderboard` - Global leaderboard
- `GET /api/games/practice/puzzle` - Generate practice puzzle
- `POST /api/games/practice/validate` - Validate solution

### Users
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats/:userId` - User statistics
- `GET /api/users/search` - Search users
- `GET /api/users/online` - Online users

## 🎨 Customization

### Themes
The application supports light/dark theme switching through CSS custom properties. Modify `src/styles/variables.css` to customize colors and styling.

### Game Rules
Puzzle generation and validation logic can be customized in `models/Game.js`:
- Modify `generatePuzzle()` for different puzzle types
- Update `validateExpression()` for custom validation rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yusnier Viera** - Creator of the original Hectoc game concept
- **MongoDB** - For excellent database documentation
- **Socket.io** - For seamless real-time communication
- **React Team** - For the amazing frontend framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/hectoclash/issues) page
2. Create a new issue with detailed description
3. Include screenshots and error messages when possible

---

**Happy Gaming! 🎮✨**
