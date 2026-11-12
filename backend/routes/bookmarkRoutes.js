const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');
router.get('/', protect, ctrl.getBookmarks);
router.post('/:materialId', protect, ctrl.toggleBookmark);
router.delete('/:materialId', protect, ctrl.removeBookmark);
module.exports = router;
