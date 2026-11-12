const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
// Basic security headers (no extra dependency)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/downloads', require('./routes/downloadRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Uploaded files + frontend (static)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'NoteNest API is running', time: new Date().toISOString() }));
app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

app.use(errorHandler);
module.exports = app;
