const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Download = require('../models/Download');
const notify = require('../utils/notify');
const Bookmark = require('../models/Bookmark');
const Rating = require('../models/Rating');

exports.getMaterials = async (req, res, next) => {
  try {
    const { search = '', subject = '', semester = '', type = '', sort = 'newest', page = 1, limit = 50 } = req.query;
    const query = {};
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }];
    if (subject) query.subject = { $regex: `^${subject}$`, $options: 'i' };
    if (semester) query.semester = Number(semester);
    if (type) query.type = type;
    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { downloads: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    const materials = await Material.find(query).sort(sortObj).skip((page - 1) * limit).limit(Number(limit)).populate('uploader', 'name email');
    const total = await Material.countDocuments(query);
    let bookmarkedIds = [];
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken'); const User = require('../models/User');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notenest_dev_secret');
        const bms = await Bookmark.find({ user: decoded.id }).select('material');
        bookmarkedIds = bms.map(b => String(b.material));
      } catch (e) {}
    }
    res.json({ success: true, total, materials: materials.map(m => ({ ...m.toObject(), isBookmarked: bookmarkedIds.includes(String(m._id)) })) });
  } catch (err) { next(err); }
};

exports.getMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id).populate('uploader', 'name email');
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    const ratings = await Rating.find({ material: material._id }).populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, material, ratings });
  } catch (err) { next(err); }
};

exports.createMaterial = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    const { title, description, subject, semester, type } = req.body;
    if (!title || !description || !subject || !semester || !type) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'Title, description, subject, semester and type are required' });
    }
    const material = await Material.create({
      title, description, subject, semester: Number(semester), type,
      fileName: req.file.filename, originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`, fileSize: req.file.size,
      uploader: req.user._id, uploaderName: req.user.name
    });
    res.status(201).json({ success: true, material });
  } catch (err) { next(err); }
};

exports.downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    const filePath = path.join(__dirname, '..', 'uploads', material.fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });
    material.downloads += 1; await material.save();
    if (req.user) {
      await Download.create({ user: req.user._id, material: material._id });
      await notify(material.uploader, req.user, 'download', `${req.user.name} downloaded your material "${material.title}"`);
    }
    res.download(filePath, material.originalName);
  } catch (err) { next(err); }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    if (String(material.uploader) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized to delete this material' });
    const filePath = path.join(__dirname, '..', 'uploads', material.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Bookmark.deleteMany({ material: material._id });
    await Rating.deleteMany({ material: material._id });
    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted' });
  } catch (err) { next(err); }
};

exports.getMyMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find({ uploader: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) { next(err); }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Material.distinct('subject');
    res.json({ success: true, subjects: subjects.sort() });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const myMaterials = await Material.find({ uploader: req.user._id });
    const totalUploaded = myMaterials.length;
    const totalDownloads = myMaterials.reduce((sum, m) => sum + m.downloads, 0);
    const available = await Material.countDocuments();
    const bookmarked = await Bookmark.countDocuments({ user: req.user._id });
    const recent = await Material.find().sort({ createdAt: -1 }).limit(6);
    res.json({ success: true, stats: { totalUploaded, totalDownloads, available, bookmarked }, recent });
  } catch (err) { next(err); }
};
