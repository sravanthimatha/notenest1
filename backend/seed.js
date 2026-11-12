require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Material = require('./models/Material');
const fs = require('fs');
const path = require('path');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notenest');
  await Material.deleteMany({}); 
  let demo = await User.findOne({ email: 'demo@notenest.edu' });
  if (!demo) demo = await User.create({ name: 'Demo Student', email: 'demo@notenest.edu', password: 'demo123', college: 'Demo College', branch: 'CSE', semester: 5 });
  // Create a real sample PDF so View/Download works after seeding
  const pdfText = 'Sample NoteNest PDF - Create your own notes and upload them from the Upload page.';
  // Minimal valid PDF
  const content = `BT /F1 16 Tf 50 750 Td (NoteNest Sample Notes) Tj ET BT /F1 11 Tf 50 720 Td (${pdfText}) Tj ET`;
  const pdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF`;
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
  const fname = 'sample-notenest.pdf';
  fs.writeFileSync(path.join(__dirname, 'uploads', fname), pdf);
  const samples = [
    { title: 'Data Structures - Unit 1 Notes', description: 'Arrays, linked lists, stacks and queues explained with examples and diagrams.', subject: 'Data Structures', semester: 3, type: 'Notes' },
    { title: 'DBMS Previous Year Question Paper 2024', description: 'Previous year DBMS question paper with important topics marked.', subject: 'DBMS', semester: 5, type: 'Question Paper' },
    { title: 'Operating Systems Complete Notes', description: 'Process, threads, scheduling, memory management - full syllabus notes.', subject: 'Operating Systems', semester: 5, type: 'Notes' }
  ];
  for (const s of samples) await Material.create({ ...s, fileName: fname, originalName: fname, filePath: `/uploads/${fname}`, fileSize: Buffer.byteLength(pdf), uploader: demo._id, uploaderName: demo.name });
  console.log('Seed complete. Login: demo@notenest.edu / demo123');
  await mongoose.disconnect();
})();
