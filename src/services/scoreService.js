// src/services/scoreService.js

const calculateRoundPoints = (game, votes) => {
  // Correct vote bonus
  votes.forEach((vote) => {
    // Find the target player to see if they are a Spy
    const targetIdStr = vote.target.toString();
    const targetPlayer = game.players.find((p) => p.user.toString() === targetIdStr);
    
    if (targetPlayer && targetPlayer.role === 'Spy') {
      // Find the voter and give +50
      const voterIdStr = vote.voter.toString();
      const voter = game.players.find((p) => p.user.toString() === voterIdStr);
      if (voter) {
        voter.points = (voter.points || 0) + 50;
      }
    }
  });

  // Spy survival bonus
  game.players.forEach((player) => {
    if (player.role === 'Spy' && player.isAlive) {
      player.points = (player.points || 0) + 100;
    }
  });

  // Ensure points don't drop below 0 (for safety)
  game.players.forEach((player) => {
    if (player.points < 0) {
      player.points = 0;
    }
  });
};

const applyEndGameBonus = (game) => {
  const totalRounds = game.currentRound;
  // Calculate bonus: (4 - totalRounds) * 50
  let bonus = (4 - totalRounds) * 50;
  if (bonus < 0) {
    bonus = 0;
  }

  game.players.forEach((player) => {
    if (player.role === 'Citizen') {
      player.points = (player.points || 0) + bonus;
    }
    
    // Safety check
    if (player.points < 0) {
      player.points = 0;
    }
  });
};

module.exports = {
  calculateRoundPoints,
  applyEndGameBonus
};
