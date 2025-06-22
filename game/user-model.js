
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    sparse: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isGuest;
    },
    minlength: 6
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 1200
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  totalSolveTime: {
    type: Number,
    default: 0
  },
  bestSolveTime: {
    type: Number,
    default: null
  },
  achievements: [{
    name: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  matchHistory: [{
    opponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    result: {
      type: String,
      enum: ['win', 'loss']
    },
    ratingChange: Number,
    playedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate win rate
userSchema.virtual('winRate').get(function() {
  if (this.gamesPlayed === 0) return 0;
  return Math.round((this.wins / this.gamesPlayed) * 100);
});

// Calculate average solve time
userSchema.virtual('avgSolveTime').get(function() {
  if (this.gamesPlayed === 0) return 0;
  return Math.round(this.totalSolveTime / this.gamesPlayed);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isGuest) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isGuest) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Update rating using ELO algorithm
userSchema.methods.updateRating = function(opponentRating, gameResult, kFactor = 32) {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - this.rating) / 400));
  const actualScore = gameResult === 'win' ? 1 : 0;
  const ratingChange = Math.round(kFactor * (actualScore - expectedScore));

  this.rating += ratingChange;
  this.rating = Math.max(100, this.rating); // Minimum rating of 100

  return ratingChange;
};

module.exports = mongoose.model('User', userSchema);
