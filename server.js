// server.js
import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import statsRoutes from './routes/stats.js';
import coursesRoutes from './routes/courses.js'; // <- add courses routes

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- Middleware ---------- */
// Parse JSON/form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, images, client JS) from /public
// Example: <link rel="stylesheet" href="/public/css/stats.css">
app.use('/public', express.static(path.join(__dirname, 'public')));

/* ---------- Handlebars view engine ---------- */
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main', // views/layouts/main.handlebars
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
      eq: (a, b) => a === b,
      fmt: (n) => (typeof n === 'number' ? n.toFixed(1) : n),
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

/* ---------- Routes ---------- */
app.use('/stats', statsRoutes);      // /stats, /stats/page, etc.
app.use('/courses', coursesRoutes);  // /courses, /courses/search, etc.

// Redirect the site root to the stats page
app.get('/', (_req, res) => res.redirect('/stats/page'));

/* ---------- Optional 404 + error fallback ---------- */
app.use((req, res) => {
  res.status(404).send('Not Found');
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
