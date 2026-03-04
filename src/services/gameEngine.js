const Game = require('../models/Game');
const Vote = require('../models/Vote');
const { calculateRoundPoints, applyEndGameBonus } = require('./scoreService');

// Helper to randomly shuffle and select elements
const getRandomElements = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

// Check win/end condition
const checkEndCondition = (game) => {
  const alivePlayers = game.players.filter(p => p.isAlive);
  const spyCount = alivePlayers.filter(p => p.role === 'Spy').length;
  const citizenCount = alivePlayers.length - spyCount;

  if (spyCount >= citizenCount) {
    return 'Spies';
  }
  
  if (spyCount === 0) {
    return 'Citizens';
  }

  return null; 
};

// Start the game by assigning roles and words
const startGame = async (gameId, adminId, playerIds, w1, w2, spyCount) => {
  const game = await Game.findById(gameId);
  
  if (!game) throw new Error('Game not found');
  if (game.admin.toString() !== adminId) throw new Error('Only the admin can start the game');
  if (game.status !== 'Lobby') throw new Error('Game is already started or finished');
  
  if (playerIds.length < 3) throw new Error('Need at least 3 players');
  if (spyCount >= playerIds.length) throw new Error('Too many spies');
  
  const spies = getRandomElements(playerIds, spyCount);
  
  const players = playerIds.map(id => {
    const isSpy = spies.includes(id);
    return {
      user: id,
      role: isSpy ? 'Spy' : 'Citizen',
      assignedWord: isSpy ? w2 : w1,
      isAlive: true,
      points: 350
    };
  });
  
  game.status = 'InProgress';
  game.players = players;
  game.word1 = w1;
  game.word2 = w2;
  game.currentRound = 1;

  await game.save();
  return game;
};

// Tally votes for a single round
const tallyVotes = async (gameId, round) => {
  const game = await Game.findById(gameId);
  if (!game || game.status !== 'InProgress') throw new Error('Game is not in progress');
  
  const votes = await Vote.find({ game: gameId, round });
  
  const voteCounts = {};
  votes.forEach(vote => {
    const targetStr = vote.target.toString();
    voteCounts[targetStr] = (voteCounts[targetStr] || 0) + 1;
  });

  let maxVotes = 0;
  let eliminatedCandidates = [];

  for (const [target, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedCandidates = [target];
    } else if (count === maxVotes) {
      eliminatedCandidates.push(target);
    }
  }

  // If a single winner of the vote, eliminate them
  if (eliminatedCandidates.length === 1) {
    const eliminatedPlayerId = eliminatedCandidates[0];
    const player = game.players.find(p => p.user.toString() === eliminatedPlayerId);
    
    if (player && player.isAlive) {
      player.isAlive = false;
      
      // Reveal the role
      game.history.push({
        round: round,
        eliminatedPlayer: eliminatedPlayerId,
        eliminatedRole: player.role
      });
      
      const winner = checkEndCondition(game);
      if (winner) {
        game.status = 'Finished';
        game.winner = winner;
      } else {
        game.currentRound += 1;
      }
    }
  } else {
    // Tie -> No one is eliminated
    game.currentRound += 1;
  }

  calculateRoundPoints(game, votes);
  if (game.status === 'Finished') {
    applyEndGameBonus(game);
  }

  await game.save();
  return game;
};

module.exports = {
  startGame,
  tallyVotes,
  checkEndCondition
};
