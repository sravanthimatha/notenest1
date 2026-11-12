const Bookmark = require('../models/Bookmark');
const Material = require('../models/Material');
const notify = require('../utils/notify');

exports.toggleBookmark = async (req, res, next) => {
  try {
    const materialId = req.params.materialId;
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    const existing = await Bookmark.findOne({ user: req.user._id, material: materialId });
    if (existing) { await existing.deleteOne(); return res.json({ success: true, bookmarked: false, message: 'Bookmark removed' }); }
    await Bookmark.create({ user: req.user._id, material: materialId });
    await notify(material.uploader, req.user, 'bookmark', `${req.user.name} bookmarked your material "${material.title}"`);
    res.status(201).json({ success: true, bookmarked: true, message: 'Bookmarked successfully' });
  } catch (err) { next(err); }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate('material').sort({ createdAt: -1 });
    res.json({ success: true, bookmarks: bookmarks.filter(b => b.material) });
  } catch (err) { next(err); }
};

exports.removeBookmark = async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({ user: req.user._id, material: req.params.materialId });
    res.json({ success: true, message: 'Bookmark removed' });
  } catch (err) { next(err); }
};
