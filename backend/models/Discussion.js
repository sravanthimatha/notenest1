const mongoose = require('mongoose');
const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 }
}, { timestamps: true });
const discussionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 140 },
  body: { type: String, required: [true, 'Details are required'], trim: true, maxlength: 3000 },
  tag: { type: String, enum: ['General', 'Doubt', 'Resources', 'Exams', 'Placements', 'Events'], default: 'General' },
  replies: [replySchema]
}, { timestamps: true });
module.exports = mongoose.model('Discussion', discussionSchema);
