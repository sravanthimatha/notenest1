const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

ratingSchema.index({ user: 1, material: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
