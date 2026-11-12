const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
  description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
  subject: { type: String, required: [true, 'Subject is required'], trim: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  type: { type: String, required: true, enum: ['Notes', 'Question Paper', 'Assignment', 'Lab Record', 'Reference Material'], default: 'Notes' },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 }
}, { timestamps: true });

materialSchema.index({ title: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('Material', materialSchema);
