const express = require('express');
const { submitVote, triggerTally } = require('../controllers/voteController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Player
router.post('/:gameId/vote', authMiddleware, submitVote);

// Admin triggering manual tally (can be fully automated in cron/trigger, but manual is secure for now)
router.post('/:gameId/tally', authMiddleware, adminMiddleware, triggerTally);

module.exports = router;
