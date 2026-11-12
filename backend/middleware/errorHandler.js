const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large. Max 10 MB allowed.' });
  if (err.message && err.message.includes('Only PDF')) return res.status(400).json({ success: false, message: err.message });
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
};
module.exports = errorHandler;
