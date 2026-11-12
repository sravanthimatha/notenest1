const Discussion = require('../models/Discussion');
const notify = require('../utils/notify');
const shape = (d) => ({ _id: d._id, title: d.title, body: d.body, tag: d.tag, author: d.author, authorName: d.authorName, repliesCount: d.replies.length, replies: d.replies, createdAt: d.createdAt, updatedAt: d.updatedAt });
exports.listPosts = async (req, res, next) => {
  try {
    const { tag, search } = req.query; const q = {};
    if (tag) q.tag = tag;
    if (search) q.$or = [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }];
    const posts = await Discussion.find(q).sort({ updatedAt: -1 }).limit(100);
    res.json({ success: true, total: posts.length, posts: posts.map(shape) });
  } catch (err) { next(err); }
};
exports.createPost = async (req, res, next) => {
  try {
    const { title, body, tag } = req.body;
    if (!title || !title.trim() || !body || !body.trim()) return res.status(400).json({ success: false, message: 'Title and details are required' });
    const post = await Discussion.create({ author: req.user._id, authorName: req.user.name, title: title.trim(), body: body.trim(), tag: tag || 'General' });
    res.status(201).json({ success: true, post: shape(post) });
  } catch (err) { next(err); }
};
exports.getPost = async (req, res, next) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion not found' });
    res.json({ success: true, post: shape(post) });
  } catch (err) { next(err); }
};
exports.addReply = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Reply text is required' });
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion not found' });
    post.replies.push({ user: req.user._id, userName: req.user.name, text: text.trim() });
    await post.save();
    await notify(post.author, req.user, 'reply', `${req.user.name} replied to your discussion "${post.title}"`);
    res.status(201).json({ success: true, post: shape(post) });
  } catch (err) { next(err); }
};
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion not found' });
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'You can only delete your own post' });
    await post.deleteOne();
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (err) { next(err); }
};
exports.deleteReply = async (req, res, next) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Discussion not found' });
    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });
    if (String(reply.user) !== String(req.user._id) && String(post.author) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    reply.deleteOne(); await post.save();
    res.json({ success: true, post: shape(post) });
  } catch (err) { next(err); }
};
