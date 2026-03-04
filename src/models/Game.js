const mongoose = require('mongoose');

const playerRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['Citizen', 'Spy'],
  },
  assignedWord: {
    type: String,
  },
  isAlive: {
    type: Boolean,
    default: true,
  },
  points: {
    type: Number,
    default: 350,
  }
});

const gameSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Lobby', 'InProgress', 'Finished'],
    default: 'Lobby',
  },
  players: [playerRecordSchema],
  word1: {
    type: String,
  }, // Citizens' word
  word2: {
    type: String,
  }, // Spies' word
  currentRound: {
    type: Number,
    default: 1,
  },
  history: [{
    round: Number,
    eliminatedPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    eliminatedRole: String // Role revealed to all
  }],
  winner: {
    type: String,
    enum: ['Citizens', 'Spies', null],
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
