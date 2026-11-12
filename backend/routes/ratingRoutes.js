const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');
router.get('/:materialId', ctrl.getRatings);
router.post('/:materialId', protect, ctrl.rateMaterial);
module.exports = router;
