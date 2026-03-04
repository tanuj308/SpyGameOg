const express = require('express');
const { createGame, addPlayers, startGameSession, getAssignedWord, getGameStatus, getAdminGameStatus } = require('../controllers/gameController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Admin Routes
router.post('/', authMiddleware, adminMiddleware, createGame);
router.post('/:gameId/players', authMiddleware, adminMiddleware, addPlayers);
router.put('/:gameId/start', authMiddleware, adminMiddleware, startGameSession);
router.get('/:gameId/admin/status', authMiddleware, adminMiddleware, getAdminGameStatus);

// Player Routes
router.get('/:gameId/word', authMiddleware, getAssignedWord);

// Public / Global
router.get('/:gameId/status', getGameStatus);

module.exports = router;
