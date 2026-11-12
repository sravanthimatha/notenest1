const Notification = require('../models/Notification');
async function notify(userId, actor, type, message) {
  try {
    if (!userId || !actor) return;
    if (String(userId) === String(actor._id)) return; // never notify about your own action
    await Notification.create({ user: userId, actorName: actor.name || 'Someone', type, message });
  } catch (e) { /* notifications must never break the main action */ }
}
module.exports = notify;
