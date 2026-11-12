const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');
router.get('/', protect, ctrl.getLeaderboard);
module.exports = router;
