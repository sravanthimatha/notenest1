const mongoose = require('mongoose');
const plannerTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 160 },
  subject: { type: String, trim: true, default: '', maxlength: 80 },
  date: { type: String, required: [true, 'Date is required'], match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'] },
  time: { type: String, trim: true, default: '' },
  done: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('PlannerTask', plannerTaskSchema);
