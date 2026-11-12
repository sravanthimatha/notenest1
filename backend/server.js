require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`NoteNest server running on http://localhost:${PORT}`));
});
