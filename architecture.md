# Spy Game Backend Architecture

## 1. Clean Folder Structure
```text
spy-game-backend/
├── src/
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Game.js          # Game schema (including embedded PlayerRecord)
│   │   └── Vote.js          # Vote schema
│   ├── controllers/
│   │   ├── authController.js# Registration & Login
│   │   ├── gameController.js# Creating, joining, and managing games
│   │   └── voteController.js# Submitting and tallying votes
│   ├── routes/
│   │   ├── authRoutes.js    
│   │   ├── gameRoutes.js    
│   │   └── voteRoutes.js    
│   ├── middlewares/
│   │   └── auth.js          # JWT authentication middleware
│   ├── services/
│   │   └── gameEngine.js    # Core game logic, vote tallying, end conditions
│   ├── app.js               # Express application setup
│   └── server.js            # Application entry point
├── package.json
└── .env
```

## 2. MongoDB Schemas

### User Schema
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Player'], default: 'Player' }
}, { timestamps: true });
```

### Game Schema
```javascript
const playerRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['Citizen', 'Spy'] },
  assignedWord: { type: String },
  isAlive: { type: Boolean, default: true }
});

const gameSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Lobby', 'InProgress', 'Finished'], default: 'Lobby' },
  players: [playerRecordSchema],
  word1: { type: String }, // Citizens' word
  word2: { type: String }, // Spies' word
  currentRound: { type: Number, default: 1 },
  history: [{
    round: Number,
    eliminatedPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eliminatedRole: String // Role is revealed here after elimination
  }],
  winner: { type: String, enum: ['Citizens', 'Spies', null], default: null }
}, { timestamps: true });
```

### Vote Schema
```javascript
const voteSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  round: { type: Number, required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
// Compound index to ensure 1 vote per player per round
voteSchema.index({ game: 1, round: 1, voter: 1 }, { unique: true });
```

## 3. REST API Endpoints

### Auth
- `POST /api/auth/register` (Registers an Admin or Player)
- `POST /api/auth/login` (Returns JWT)

### Game & Admin Actions
- `POST /api/games` (Admin creates a new Game session)
- `POST /api/games/:gameId/players` (Admin adds players to the game before it starts)
- `PUT /api/games/:gameId/start` (Admin sets `w1` & `w2`, assigns roles, and changes status to `InProgress`)

### Player Actions
- `GET /api/games/:gameId/word` (Player retrieves their assigned word securely)
- `POST /api/games/:gameId/vote` (Player votes for a target)

### Global Actions
- `POST /api/games/:gameId/tally` (Admin or system tallies votes for the round, eliminates highest voted player)
- `GET /api/games/:gameId/status` (Get public game state including history of eliminations)

## 4. Core Game Engine Pseudocode

```javascript
// Located in src/services/gameEngine.js
function startGame(gameId, adminId, playerIds, w1, w2, spyCount) {
  // 1. Validate game is in 'Lobby' and active admin is calling
  // 2. Randomly select 'spyCount' number of spies from playerIds
  const spies = randomlySelect(playerIds, spyCount);
  
  // 3. Construct PlayerRecords
  const players = playerIds.map(id => {
    const isSpy = spies.includes(id);
    return {
      user: id,
      role: isSpy ? 'Spy' : 'Citizen',
      assignedWord: isSpy ? w2 : w1,
      isAlive: true
    };
  });
  
  // 4. Update Game to InProgress
  updateGameDb(gameId, { 
    status: 'InProgress', 
    players, 
    word1: w1, 
    word2: w2 
  });
}
```

## 5. Vote Counting Algorithm

```javascript
// Located in src/services/gameEngine.js
async function tallyVotes(gameId, round) {
  const votes = await getVotesForRound(gameId, round);
  const voteCounts = {}; // { targetPlayerId: count }

  // Count votes
  votes.forEach(vote => {
    voteCounts[vote.target] = (voteCounts[vote.target] || 0) + 1;
  });

  // Determine player(s) with maximum votes
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

  // Handle elimination logic
  if (eliminatedCandidates.length === 1) {
    const eliminatedPlayerId = eliminatedCandidates[0];
    await eliminatePlayer(gameId, eliminatedPlayerId, round);
  } else {
    // It's a tie, no one is eliminated this round
    await recordTie(gameId, round);
  }
}

async function eliminatePlayer(gameId, targetId, round) {
  const game = await Game.findById(gameId);
  const player = game.players.find(p => p.user.toString() === targetId);
  
  player.isAlive = false;
  
  // Reveal role in history
  game.history.push({
    round: round,
    eliminatedPlayer: targetId,
    eliminatedRole: player.role
  });
  
  // Check win condition
  const winner = checkEndCondition(game);
  if (winner) {
    game.status = 'Finished';
    game.winner = winner;
  } else {
    game.currentRound += 1; // Proceed to next round
  }
  
  await game.save();
}
```

## 6. Game End Condition Logic

```javascript
// Located in src/services/gameEngine.js
function checkEndCondition(game) {
  const alivePlayers = game.players.filter(p => p.isAlive);
  const spyCount = alivePlayers.filter(p => p.role === 'Spy').length;
  const citizenCount = alivePlayers.length - spyCount;

  // Spies win if they equal or outnumber Citizens
  if (spyCount >= citizenCount) {
    return 'Spies';
  }
  
  // Citizens win if no Spies remain
  if (spyCount === 0) {
    return 'Citizens';
  }

  // Game continues
  return null; 
}
```

## 7. Secure Logic for Assigned Word Access

```javascript
// Located in src/controllers/gameController.js
// Route: GET /api/games/:gameId/word (Protected by JWT Auth Middleware)

async function getAssignedWord(req, res) {
  try {
    const game = await Game.findById(req.params.gameId);
    
    if (!game || game.status !== 'InProgress') {
      return res.status(400).json({ error: "Game is not active." });
    }

    // `req.user.id` is populated by JWT middleware
    const playerRecord = game.players.find(p => p.user.toString() === req.user.id);
    
    if (!playerRecord) {
      return res.status(403).json({ error: "You are not in this game." });
    }
    
    // Alive players can see their word, dead players might still see it or be blocked.
    // We let them see it if they're alive, otherwise they can still refer to it.
    
    // SECURE RETURN: Explicitly return ONLY the word.
    // Role (Spy/Citizen) is NEVER included in this payload.
    return res.json({ 
      word: playerRecord.assignedWord,
      isAlive: playerRecord.isAlive 
    });

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
```
