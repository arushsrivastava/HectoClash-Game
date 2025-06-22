
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: Number,
    score: {
      type: Number,
      default: 0
    }
  }],
  puzzle: {
    type: String,
    required: true
  },
  rounds: [{
    roundNumber: Number,
    puzzle: String,
    solutions: [{
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      expression: String,
      result: Number,
      isCorrect: Boolean,
      solveTime: Number,
      submittedAt: Date
    }],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: Date,
    endedAt: Date
  }],
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'abandoned'],
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
  ratingChanges: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    oldRating: Number,
    newRating: Number,
    change: Number
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  duration: Number // in seconds
}, {
  timestamps: true
});

// Calculate game duration when completed
gameSchema.pre('save', function(next) {
  if (this.isModified('endedAt') && this.endedAt && this.startedAt) {
    this.duration = Math.round((this.endedAt - this.startedAt) / 1000);
  }
  next();
});

module.exports = mongoose.model('Game', gameSchema);
