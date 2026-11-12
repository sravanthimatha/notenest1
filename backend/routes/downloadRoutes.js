const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/downloadController');
const { protect } = require('../middleware/auth');
router.get('/my', protect, ctrl.getMyDownloads);
module.exports = router;
