const Material = require('../models/Material');
const Rating = require('../models/Rating');
const User = require('../models/User');
exports.getLeaderboard = async (req, res, next) => {
  try {
    const uploadAgg = await Material.aggregate([{ $group: { _id: '$uploader', uploads: { $sum: 1 }, downloadsEarned: { $sum: '$downloads' } } }]);
    const mats = await Material.find({}, '_id uploader');
    const ownerOf = {}; mats.forEach(m => { ownerOf[String(m._id)] = String(m.uploader); });
    const ratingAgg = await Rating.aggregate([{ $group: { _id: '$material', count: { $sum: 1 }, avg: { $avg: '$rating' } } }]);
    const ratingByUser = {};
    ratingAgg.forEach(r => { const owner = ownerOf[String(r._id)]; if (!owner) return; if (!ratingByUser[owner]) ratingByUser[owner] = { count: 0, sum: 0 }; ratingByUser[owner].count += r.count; ratingByUser[owner].sum += r.avg * r.count; });
    const ids = uploadAgg.map(a => a._id);
    const users = await User.find({ _id: { $in: ids } }, 'name branch semester');
    const nameOf = {}; users.forEach(u => { nameOf[String(u._id)] = u; });
    const leaders = uploadAgg.map(a => {
      const u = nameOf[String(a._id)] || {};
      const rb = ratingByUser[String(a._id)] || { count: 0, sum: 0 };
      const points = a.uploads * 10 + a.downloadsEarned * 2 + rb.count * 3;
      return { userId: a._id, name: u.name || 'Student', branch: u.branch || '', semester: u.semester || '', uploads: a.uploads, downloadsEarned: a.downloadsEarned, ratingsReceived: rb.count, averageRating: rb.count ? Math.round((rb.sum / rb.count) * 10) / 10 : 0, points };
    }).sort((x, y) => y.points - x.points).slice(0, 20).map((l, i) => ({ rank: i + 1, ...l }));
    res.json({ success: true, leaders, formula: 'Points = uploads×10 + downloads earned×2 + ratings received×3' });
  } catch (err) { next(err); }
};
