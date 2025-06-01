# HectoClash - MERN Stack + Angular Deployment Guide

## Overview
This guide explains how to extend the HectoClash application to use the full MERN stack with Angular for production deployment.

## Architecture Transition

### Current Implementation (Client-Side Only)
- Single HTML page with embedded JavaScript
- Local storage for data persistence
- Simulated real-time features

### Target MERN + Angular Architecture
```
Frontend (Angular) → Backend (Node.js + Express) → Database (MongoDB)
                           ↓
                    WebSocket (Socket.io)
```

## Backend Setup (Node.js + Express + Socket.io)

### 1. Project Structure
```
hectoclash-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gameController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Game.js
│   │   └── GameSession.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── games.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── services/
│   │   ├── gameService.js
│   │   ├── matchmakingService.js
│   │   └── expressionValidator.js
│   ├── socket/
│   │   └── gameSocket.js
│   └── app.js
├── package.json
└── server.js
```

### 2. Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^6.10.0",
    "joi": "^17.9.2",
    "math-expression-evaluator": "^1.4.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
```

### 3. Express Server Setup
```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/games', require('./src/routes/games'));

// Socket.io setup
require('./src/socket/gameSocket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. MongoDB Models
```javascript
// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  passwordHash: String,
  rating: {
    type: Number,
    default: 1200
  },
  statistics: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalSolveTime: { type: Number, default: 0 },
    fastestSolve: Number,
    averageSolveTime: Number
  },
  achievements: [String],
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

```javascript
// src/models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    rating: Number,
    solution: String,
    solveTime: Number,
    status: {
      type: String,
      enum: ['waiting', 'playing', 'solved', 'timeout'],
      default: 'waiting'
    }
  }],
  puzzle: {
    sequence: {
      type: String,
      required: true
    },
    solutions: [String]
  },
  gameType: {
    type: String,
    enum: ['duel', 'practice', 'tournament'],
    default: 'duel'
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  spectators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  timeLimit: {
    type: Number,
    default: 180 // 3 minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);
```

### 5. Socket.io Game Events
```javascript
// src/socket/gameSocket.js
const GameService = require('../services/gameService');
const MatchmakingService = require('../services/matchmakingService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join matchmaking queue
    socket.on('join-queue', async (data) => {
      try {
        const { userId, rating } = data;
        await MatchmakingService.addToQueue(userId, rating, socket);
        
        // Try to find a match
        const match = await MatchmakingService.findMatch(userId);
        if (match) {
          const game = await GameService.createGame(match.players);
          
          // Notify both players
          match.players.forEach(player => {
            io.to(player.socketId).emit('game-found', {
              gameId: game.gameId,
              opponent: match.players.find(p => p.userId !== player.userId)
            });
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Submit solution
    socket.on('submit-solution', async (data) => {
      try {
        const { gameId, solution, solveTime } = data;
        const result = await GameService.submitSolution(gameId, socket.userId, solution, solveTime);
        
        // Broadcast to all players in the game
        io.to(gameId).emit('solution-submitted', result);
        
        // Check if game is complete
        if (result.gameComplete) {
          io.to(gameId).emit('game-complete', result.gameResult);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Join game as spectator
    socket.on('spectate-game', async (gameId) => {
      try {
        socket.join(gameId);
        const gameState = await GameService.getGameState(gameId);
        socket.emit('game-state', gameState);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      MatchmakingService.removeFromQueue(socket.userId);
    });
  });
};
```

## Frontend Setup (Angular)

### 1. Angular Project Structure
```
hectoclash-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── lobby/
│   │   │   ├── game/
│   │   │   ├── leaderboard/
│   │   │   └── profile/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── game.service.ts
│   │   │   ├── socket.service.ts
│   │   │   └── user.service.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── game.model.ts
│   │   │   └── game-state.model.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts
│   ├── environments/
│   └── assets/
├── angular.json
└── package.json
```

### 2. Angular Dependencies
```json
{
  "dependencies": {
    "@angular/core": "^16.2.0",
    "@angular/common": "^16.2.0",
    "@angular/router": "^16.2.0",
    "@angular/forms": "^16.2.0",
    "@angular/http": "^16.2.0",
    "@angular/animations": "^16.2.0",
    "ngx-socket-io": "^4.3.4",
    "rxjs": "^7.8.1",
    "bootstrap": "^5.3.0",
    "@ng-bootstrap/ng-bootstrap": "^15.0.0"
  }
}
```

### 3. Socket Service Setup
```typescript
// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(private socket: Socket) {}

  // Emit events
  joinQueue(userData: any) {
    this.socket.emit('join-queue', userData);
  }

  submitSolution(gameData: any) {
    this.socket.emit('submit-solution', gameData);
  }

  spectateGame(gameId: string) {
    this.socket.emit('spectate-game', gameId);
  }

  // Listen to events
  onGameFound(): Observable<any> {
    return this.socket.fromEvent('game-found');
  }

  onSolutionSubmitted(): Observable<any> {
    return this.socket.fromEvent('solution-submitted');
  }

  onGameComplete(): Observable<any> {
    return this.socket.fromEvent('game-complete');
  }

  onGameState(): Observable<any> {
    return this.socket.fromEvent('game-state');
  }

  onError(): Observable<any> {
    return this.socket.fromEvent('error');
  }
}
```

### 4. Game Component
```typescript
// src/app/components/game/game.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { GameService } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  gameState: any;
  currentExpression: string = '';
  timeRemaining: number = 180;
  gameTimer: any;
  subscriptions: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private gameService: GameService
  ) {}

  ngOnInit() {
    this.setupSocketListeners();
    this.startGameTimer();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  setupSocketListeners() {
    const solutionSub = this.socketService.onSolutionSubmitted()
      .subscribe(data => {
        this.updateGameState(data);
      });

    const gameCompleteSub = this.socketService.onGameComplete()
      .subscribe(result => {
        this.handleGameComplete(result);
      });

    this.subscriptions.push(solutionSub, gameCompleteSub);
  }

  submitSolution() {
    if (this.validateExpression(this.currentExpression)) {
      const solveTime = 180 - this.timeRemaining;
      this.socketService.submitSolution({
        gameId: this.gameState.gameId,
        solution: this.currentExpression,
        solveTime: solveTime
      });
    }
  }

  validateExpression(expression: string): boolean {
    return this.gameService.validateHectocExpression(
      expression, 
      this.gameState.puzzle.sequence
    );
  }

  startGameTimer() {
    this.gameTimer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitSolution(); // Auto-submit on timeout
      }
    }, 1000);
  }

  private updateGameState(data: any) {
    this.gameState = { ...this.gameState, ...data };
  }

  private handleGameComplete(result: any) {
    clearInterval(this.gameTimer);
    // Navigate to results screen
  }
}
```

## Database Configuration

### MongoDB Connection
```javascript
// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Environment Variables
```env
# .env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hectoclash
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:4200
```

## Deployment

### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/hectoclash /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./hectoclash-backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/hectoclash
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./hectoclash-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## Production Considerations

### Scaling
- **Load Balancing**: Use nginx or cloud load balancers
- **Horizontal Scaling**: Multiple backend instances with Redis for Socket.io clustering
- **Database Scaling**: MongoDB replica sets and sharding

### Monitoring
- **Application Monitoring**: Use tools like New Relic or DataDog
- **Error Tracking**: Implement Sentry for error monitoring
- **Performance Metrics**: Track WebSocket connection counts, game completion rates

### Security
- **Authentication**: JWT tokens with refresh mechanism
- **Rate Limiting**: Prevent abuse of API endpoints
- **Input Validation**: Sanitize all mathematical expressions
- **CORS Configuration**: Proper cross-origin resource sharing setup

This guide provides the foundation for transforming the client-side HectoClash application into a full-featured MERN stack application with Angular frontend, enabling true real-time multiplayer functionality and scalable deployment.