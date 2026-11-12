const mongoose = require('mongoose');
const downloadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true }
}, { timestamps: true });
module.exports = mongoose.model('Download', downloadSchema);
