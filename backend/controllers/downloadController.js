const Download = require('../models/Download');
exports.getMyDownloads = async (req, res, next) => {
  try {
    const rows = await Download.find({ user: req.user._id }).populate('material').sort({ createdAt: -1 });
    const downloads = rows.filter(r => r.material).map(r => ({
      _id: r._id, downloadedAt: r.createdAt,
      material: { _id: r.material._id, title: r.material.title, subject: r.material.subject, semester: r.material.semester, type: r.material.type, fileName: r.material.fileName, uploaderName: r.material.uploaderName, downloads: r.material.downloads, averageRating: r.material.averageRating, ratingsCount: r.material.ratingsCount, description: r.material.description, createdAt: r.material.createdAt }
    }));
    res.json({ success: true, total: downloads.length, downloads });
  } catch (err) { next(err); }
};
