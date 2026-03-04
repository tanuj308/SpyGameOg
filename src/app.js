const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const voteRoutes = require('./routes/voteRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/votes', voteRoutes); // Assuming this needs '/api/votes'

// Default route for root '/'
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Spy Game API. Server is running!');
});

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
