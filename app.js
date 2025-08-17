// app.js
import express from 'express';
import session from 'express-session';
import { dbConnection } from './config/mongoConnections.js';
import statsRoutes from './routes/stats.js';
import coursesRoutes from './routes/courses.js';
import usersRoutes from './routes/users.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'AuthCookie',
    secret: 'replace-with-a-strong-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use('/stats', statsRoutes);
app.use('/courses', coursesRoutes);
app.use('/users', usersRoutes);

app.get('/', (_req, res) => res.send('Class Review API running'));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await dbConnection();
  console.log(`Server running at http://localhost:${port}`);
});
