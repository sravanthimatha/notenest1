const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String, default: 'Someone' },
  type: { type: String, enum: ['download', 'rating', 'bookmark', 'reply', 'system'], default: 'system' },
  message: { type: String, required: true, maxlength: 300 },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
