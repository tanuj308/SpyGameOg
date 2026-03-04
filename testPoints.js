const { calculateRoundPoints, applyEndGameBonus } = require('./src/services/scoreService');

const mockGame = {
  status: 'InProgress',
  currentRound: 2,
  players: [
    { user: 'u1', role: 'Citizen', isAlive: true, points: 350 },
    { user: 'u2', role: 'Citizen', isAlive: true, points: 350 },
    { user: 'u3', role: 'Spy', isAlive: true, points: 350 },
    { user: 'u4', role: 'Spy', isAlive: false, points: 350 },
  ]
};

const mockVotes = [
  { voter: 'u1', target: 'u3' }, // +50 for u1
  { voter: 'u2', target: 'u1' }, 
  { voter: 'u3', target: 'u2' }, 
];

calculateRoundPoints(mockGame, mockVotes);
console.log(mockGame.players.map(p => `${p.role} pts:${p.points}`));

mockGame.status = 'Finished';
mockGame.currentRound = 3;
applyEndGameBonus(mockGame);
console.log(mockGame.players.map(p => `${p.role} pts:${p.points}`));
