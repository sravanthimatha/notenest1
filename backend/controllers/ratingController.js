const Rating = require('../models/Rating');
const Material = require('../models/Material');
const notify = require('../utils/notify');

async function recalc(materialId) {
  const ratings = await Rating.find({ material: materialId });
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
  await Material.findByIdAndUpdate(materialId, { averageRating: Math.round(avg * 10) / 10, ratingsCount: ratings.length });
  return { averageRating: Math.round(avg * 10) / 10, ratingsCount: ratings.length };
}

exports.rateMaterial = async (req, res, next) => {
  try {
    const { rating, review = '' } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    let existing = await Rating.findOne({ user: req.user._id, material: req.params.materialId });
    if (existing) { existing.rating = Number(rating); existing.review = review; await existing.save(); }
    else existing = await Rating.create({ user: req.user._id, material: req.params.materialId, rating: Number(rating), review });
    await notify(material.uploader, req.user, 'rating', `${req.user.name} rated your material "${material.title}" ${Number(rating)} stars`);
    const stats = await recalc(req.params.materialId);
    res.json({ success: true, rating: existing, ...stats });
  } catch (err) { next(err); }
};

exports.getRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ material: req.params.materialId }).populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, ratings });
  } catch (err) { next(err); }
};
