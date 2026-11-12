const Notification = require('../models/Notification');
exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, unread, notifications });
  } catch (err) { next(err); }
};
exports.unreadCount = async (req, res, next) => {
  try {
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, unread });
  } catch (err) { next(err); }
};
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};
exports.markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};
