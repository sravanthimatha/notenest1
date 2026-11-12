// NoteNest FULL seeder - loads the complete demo showcase (26 materials, forum, planner) into MONGO_URI from .env (local MongoDB works).
// NoteNest FULL seeder - loads the complete demo showcase (26 materials, forum, planner) into MONGO_URI from .env (local MongoDB works).
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const User = require('./models/User');
const Material = require('./models/Material');
const Bookmark = require('./models/Bookmark');
const Rating = require('./models/Rating');
const Download = require('./models/Download');
const Discussion = require('./models/Discussion');
const PlannerTask = require('./models/PlannerTask');
const Notification = require('./models/Notification');

const ITEMS = [
 ["Engineering Mathematics-I Important Notes","Mathematics",1,"Notes","All branches","demo"],
 ["Engineering Physics Complete Notes","Physics",1,"Notes","All branches","demo"],
 ["Programming in C Lab Programs","Computer Science",1,"Lab Record","CSE / IT","demo"],
 ["Engineering Mathematics-II Formula Book","Mathematics",2,"Reference Material","All branches","demo"],
 ["Basic Electrical and Electronics Notes","Electrical Engineering",2,"Notes","EEE / ECE","demo"],
 ["Python Programming Complete Notes","Computer Science",2,"Notes","CSE / IT","priya"],
 ["Discrete Mathematics Notes","Mathematics",3,"Notes","CSE","demo"],
 ["Thermodynamics Basics Notes","Mechanical Engineering",3,"Notes","MECH","demo"],
 ["Electronic Devices and Circuits Notes","Electronics",3,"Notes","ECE","demo"],
 ["Computer Organization Notes","Computer Science",4,"Notes","CSE","demo"],
 ["Signals and Systems Notes","Electronics",4,"Notes","ECE","demo"],
 ["Java Programming OOP Lab Manual","Computer Science",4,"Lab Record","CSE / IT","demo"],
 ["Computer Networks Complete Notes","Computer Science",5,"Notes","CSE","demo"],
 ["Structural Analysis Notes","Civil Engineering",5,"Notes","CIVIL","demo"],
 ["Machine Learning Unit-Wise Notes","Computer Science",6,"Notes","CSE / AIML","priya"],
 ["Microprocessors and Microcontrollers Notes","Electronics",6,"Notes","ECE","demo"],
 ["Power Systems-II Notes","Electrical Engineering",6,"Notes","EEE","demo"],
 ["Cloud Computing Notes","Computer Science",7,"Notes","CSE","priya"],
 ["Cyber Security Question Bank","Computer Science",7,"Question Paper","CSE","demo"],
 ["Artificial Intelligence Notes","Computer Science",7,"Notes","CSE / AIML","demo"],
 ["Big Data Analytics Notes","Computer Science",8,"Notes","CSE","demo"],
 ["Blockchain Technology Notes","Computer Science",8,"Notes","CSE","demo"],
 ["Final Year Project Viva Questions","General",8,"Question Paper","All branches","demo"],
 ["Data Structures - Unit 1 Notes","Data Structures",3,"Notes","CSE","demo"],
 ["DBMS Previous Year Question Paper 2024","DBMS",5,"Question Paper","CSE","demo"],
 ["Operating Systems Complete Notes","Operating Systems",5,"Notes","CSE","demo"]
];

(async () => {
  if (!process.env.MONGO_URI) { console.error('MONGO_URI missing'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected:', mongoose.connection.host, '/', mongoose.connection.name);

  let demo = await User.findOne({ email: 'demo@notenest.edu' });
  if (!demo) demo = await User.create({ name: 'Demo Student', email: 'demo@notenest.edu', password: 'demo123', college: 'Demo College', branch: 'CSE', semester: 5 });
  let priya = await User.findOne({ email: 'priya@notenest.edu' });
  if (!priya) priya = await User.create({ name: 'Priya Sharma', email: 'priya@notenest.edu', password: 'priya123', college: 'Demo College', branch: 'CSE', semester: 5 });
  const users = { demo, priya };

  await Promise.all([Material.deleteMany({}), Bookmark.deleteMany({}), Rating.deleteMany({}), Download.deleteMany({}), Discussion.deleteMany({}), PlannerTask.deleteMany({}), Notification.deleteMany({})]);

  const created = [];
  for (let i = 0; i < ITEMS.length; i++) {
    const [title, subject, sem, type, branch, up] = ITEMS[i];
    const fname = `seed${String(i + 1).padStart(2, '0')}.pdf`;
    const fpath = path.join(__dirname, 'uploads', fname);
    const size = fs.existsSync(fpath) ? fs.statSync(fpath).size : 0;
    const u = users[up];
    const m = await Material.create({
      title, subject, semester: sem, type,
      description: `${title} for Semester ${sem} students (${branch}). Covers all units with exam-focused points. Shared on NoteNest.`,
      fileName: fname, originalName: fname, filePath: `/uploads/${fname}`, fileSize: size,
      uploader: u._id, uploaderName: u.name, downloads: 0, averageRating: 0, ratingsCount: 0
    });
    created.push(m);
  }
  const byTitle = t => created.find(m => m.title === t);
  const ds = byTitle('Data Structures - Unit 1 Notes');
  const os = byTitle('Operating Systems Complete Notes');

  await Rating.create({ user: priya._id, material: ds._id, rating: 5, review: 'Very clear notes' });
  await Rating.create({ user: priya._id, material: os._id, rating: 4, review: 'Good coverage' });
  await Material.findByIdAndUpdate(ds._id, { averageRating: 5, ratingsCount: 1, downloads: 1 });
  await Material.findByIdAndUpdate(os._id, { averageRating: 4, ratingsCount: 1 });
  await Bookmark.create({ user: priya._id, material: ds._id });
  await Download.create({ user: priya._id, material: ds._id });

  const post = await Discussion.create({ title: 'Best resources for DSA?', body: 'Semester exams are coming. Which notes and books are best for Data Structures unit 1 and 2?', tag: 'Resources', author: demo._id, authorName: demo.name, replies: [{ user: priya._id, userName: priya.name, text: 'The Data Structures Unit 1 notes on NoteNest are very clear. Also practice previous year papers.' }] });
  await Discussion.create({ title: 'Doubt: difference between process and thread?', body: 'Can someone explain process vs thread with a simple example for OS viva?', tag: 'Doubt', author: priya._id, authorName: priya.name, replies: [] });

  await PlannerTask.create({ user: demo._id, title: 'Revise Data Structures unit 1', subject: 'Data Structures', date: '2026-11-13', time: '18:00', done: false });
  await PlannerTask.create({ user: demo._id, title: 'Solve DBMS previous year paper', subject: 'DBMS', date: '2026-11-14', time: '09:00', done: false });

  await Notification.create({ user: demo._id, actorName: priya.name, type: 'rating', message: `Priya Sharma rated your material "${ds.title}" 5 stars` });
  await Notification.create({ user: demo._id, actorName: priya.name, type: 'download', message: `Priya Sharma downloaded your material "${ds.title}"` });
  await Notification.create({ user: demo._id, actorName: priya.name, type: 'bookmark', message: `Priya Sharma bookmarked your material "${ds.title}"` });
  await Notification.create({ user: demo._id, actorName: priya.name, type: 'reply', message: `Priya Sharma replied to your discussion "Best resources for DSA?"` });

  console.log(`Seeded: ${created.length} materials, forum 2 posts, planner 2 tasks, users demo+priya`);
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
