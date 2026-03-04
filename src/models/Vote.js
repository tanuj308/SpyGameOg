const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

// Prevent multiple votes in the same round by the same user for a specific game
voteSchema.index({ game: 1, round: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
