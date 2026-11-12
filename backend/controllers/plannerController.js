const PlannerTask = require('../models/PlannerTask');
exports.listTasks = async (req, res, next) => {
  try {
    const tasks = await PlannerTask.find({ user: req.user._id }).sort({ date: 1, createdAt: 1 });
    const done = tasks.filter(t => t.done).length;
    res.json({ success: true, total: tasks.length, done, tasks });
  } catch (err) { next(err); }
};
exports.createTask = async (req, res, next) => {
  try {
    const { title, subject = '', date, time = '' } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Task title is required' });
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });
    const task = await PlannerTask.create({ user: req.user._id, title: title.trim(), subject: String(subject).trim(), date, time: String(time).trim() });
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};
exports.updateTask = async (req, res, next) => {
  try {
    const task = await PlannerTask.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const { title, subject, date, time, done } = req.body;
    if (title !== undefined) task.title = String(title).trim();
    if (subject !== undefined) task.subject = String(subject).trim();
    if (date !== undefined) task.date = date;
    if (time !== undefined) task.time = String(time).trim();
    if (done !== undefined) task.done = !!done;
    await task.save();
    res.json({ success: true, task });
  } catch (err) { next(err); }
};
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await PlannerTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};
