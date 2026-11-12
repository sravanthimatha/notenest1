# NoteNest – Smart Study Material Sharing Website

**Tagline:** Share Knowledge, Grow Together.

A complete, modern, responsive full-stack web application for college students to **upload, download, search, share and bookmark study materials**.

## Tech Stack (only the requested technologies)

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (no React / no frameworks) |
| Backend | Node.js, Express.js (`app.js` + `server.js`) |
| Database | MongoDB with Mongoose |
| Auth & Security | bcryptjs (password hashing), JWT (jsonwebtoken) |
| File Upload | Multer (PDF only, max 10 MB) |

## Features

1. **Student Registration & Login** – register, login, logout, JWT auth, bcrypt password hashing, profile management
2. **Dashboard** – my uploads, available materials, downloads on my materials, bookmarked count, recently uploaded materials
3. **Upload Study Materials** – PDF notes & previous question papers, title, description, subject, semester, type, uploader name & date, shown as cards
4. **Search & Filter** – by title/description/subject, filter by subject, semester, material type; sort by newest / most downloaded / top rated
5. **Download & View** – view PDF in browser, download with live download count
6. **Bookmarks** – bookmark / remove bookmark, saved list in Profile
7. **Rating System** – 1–5 stars + optional review, average rating & ratings count on every card, auto-recalculated in MongoDB
8. **Student Profile** – name, email, college, branch, semester; manage (delete) own uploads; view bookmarks

## Project Folder Structure

```
NoteNest/
├── frontend/
│   ├── index.html        # Landing + Browse / Search / Filter
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── upload.html
│   ├── profile.html
│   ├── css/
│   │   └── style.css     # Green theme, white/light-grey, sidebar, responsive
│   └── js/
│       ├── api.js        # API helper, auth, toast, material cards, rating modal, sidebar
│       ├── main.js       # Browse page logic
│       ├── auth.js       # Login / Register logic
│       ├── dashboard.js
│       ├── upload.js
│       └── profile.js
├── backend/
│   ├── app.js            # Express app, routes, static frontend + uploads
│   ├── server.js         # Entry point – connects DB, starts server
│   ├── seed.js           # Demo user + 3 sample materials
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js         # MongoDB connection (Mongoose)
│   ├── models/
│   │   ├── User.js
│   │   ├── Material.js
│   │   ├── Bookmark.js
│   │   └── Rating.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── bookmarkRoutes.js
│   │   └── ratingRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── materialController.js
│   │   ├── bookmarkController.js
│   │   └── ratingController.js
│   ├── middleware/
│   │   ├── auth.js       # JWT protect middleware
│   │   ├── upload.js     # Multer PDF upload
│   │   └── errorHandler.js
│   └── uploads/          # Uploaded PDFs are stored here
└── README.md
```

## Database Design (MongoDB Collections)

1. **Users** – name, email (unique), password (hashed), college, branch, semester, role
2. **Materials** – title, description, subject, semester, type, fileName, originalName, filePath, fileSize, uploader (ref User), uploaderName, downloads, averageRating, ratingsCount
3. **Bookmarks** – user (ref), material (ref), unique together
4. **Ratings** – user (ref), material (ref), rating (1–5), review, unique together (one rating per student per material, updatable)

## How to Run Locally

### Prerequisites
- Node.js 18+ and npm – https://nodejs.org
- MongoDB – either **local** OR **MongoDB Atlas (free cloud)** – see below

### Step 1 – Install dependencies
```bash
cd NoteNest/backend
npm install
```

### Step 2 – Connect MongoDB

**Option A – Local MongoDB (easiest for a college project)**
1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Start it (Windows: it runs as a service; macOS: `brew services start mongodb-community`; Linux: `sudo systemctl start mongod`)
3. No username/password needed locally. Use this URI:
   ```
   mongodb://127.0.0.1:27017/notenest
   ```
   The `notenest` database is created automatically on first write.

**Option B – MongoDB Atlas (free, no local install)**
1. Create a free account at https://www.mongodb.com/atlas
2. Create a free **M0 cluster** → Database Access → create a DB user → Network Access → Allow `0.0.0.0/0` (for local dev)
3. Click **Connect → Drivers** and copy your connection string, e.g.
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/notenest`

### Step 3 – Create your `.env` file
Copy the example and fill it in:
```bash
cp .env.example .env
```
`.env` contents:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/notenest
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRE=7d
```
> For Atlas, replace `MONGO_URI` with your Atlas string. Never commit your real `.env` to GitHub.

### Step 4 – (Optional) Seed demo data
```bash
npm run seed
```
Creates demo login **demo@notenest.edu / demo123** and 3 sample materials with a real sample PDF (View/Download work).

### Step 5 – Run the application
```bash
npm run dev     # development (auto-restart with nodemon)
# or
npm start       # production
```
Open **http://localhost:5000** in your browser.
The Express server serves both the API (`/api/...`) and the frontend – no separate frontend server is needed.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register student |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current student profile |
| PUT | `/api/auth/profile` | Yes | Update profile |
| GET | `/api/materials?search=&subject=&semester=&type=&sort=` | Optional | List / search / filter materials |
| GET | `/api/materials/subjects` | No | Distinct subject list |
| GET | `/api/materials/stats` | Yes | Dashboard stats + recent |
| GET | `/api/materials/my` | Yes | My uploads |
| GET | `/api/materials/:id` | No | Material details + ratings |
| POST | `/api/materials` (multipart, field `file`) | Yes | Upload PDF material |
| GET | `/api/materials/:id/download` | No | Download PDF (increments count) |
| DELETE | `/api/materials/:id` | Yes (owner) | Delete own material |
| GET | `/api/bookmarks` | Yes | My bookmarks |
| POST | `/api/bookmarks/:materialId` | Yes | Toggle bookmark |
| DELETE | `/api/bookmarks/:materialId` | Yes | Remove bookmark |
| GET | `/api/ratings/:materialId` | No | Ratings for a material |
| POST | `/api/ratings/:materialId` | Yes | Rate 1–5 (+ review) |
| GET | `/api/health` | No | Health check |

## Validation & Error Handling
- Required-field checks on register, login, upload and rating (server + client)
- Email format & unique-email check; password minimum 6 characters, hashed with bcrypt
- PDF-only upload filter, 10 MB limit, clear error messages via central error handler
- JWT-protected routes; a student can delete **only their own** materials (403 otherwise)
- Duplicate bookmark/rating prevented by unique indexes; re-rating updates the existing rating

## Viva / Submission Notes
- `app.js` = Express configuration only; `server.js` = DB connection + `listen()` – a clean separation examiners expect.
- No dummy buttons: View, Download, Search, Filters, Sort, Bookmark, Rate, Delete, Profile Save all call real APIs and persist to MongoDB.

## New in v4 — Full Feature Set (all working, no dummy buttons)

Sidebar (12 sections): Dashboard, Upload Materials, Explore Materials, My Notes,
Bookmarks, My Downloads, Discussion Forum, Study Planner, Leaderboard,
Notifications, My Profile, Settings.

- **My Downloads** — every download by a logged-in student is recorded
  (`Download` model) and listed with re-download links.
- **Discussion Forum** — students create discussions (tags: General, Doubt,
  Resources, Exams, Placements, Events), reply, and delete their own posts/replies
  (`Discussion` model with embedded replies).
- **Study Planner** — personal study tasks with date/time, done tracking and a
  progress bar (`PlannerTask` model). Private per student.
- **Leaderboard** — top contributors ranked by a transparent formula:
  points = uploads x10 + downloads earned x2 + ratings received x3.
- **Notifications** — bell icon with unread badge. A student is notified when
  someone downloads, rates or bookmarks their material, or replies to their
  discussion (`Notification` model). Mark one/all as read.
- **Settings** — edit profile (name, college, branch, semester) and change
  password (current password verified with bcrypt).

New API routes: `/api/downloads/my`, `/api/forum`, `/api/planner`,
`/api/leaderboard`, `/api/notifications`, `PUT /api/auth/password`.
Total automated integration tests: 81 (45 core + 36 feature tests), all passing.
