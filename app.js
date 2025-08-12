import express from 'express';
import { dbConnection } from './config/mongoConnections.js';

import statsRoutes from './routes/stats.js';
import coursesRoutes from './routes/courses.js';
// (later) import usersRoutes from './routes/users.js';
// (later) import homeRoutes from './routes/home.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/stats', statsRoutes);
app.use('/courses', coursesRoutes);

app.get('/', (_req, res) => {
  res.send('Class Review API running');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await dbConnection(); 
  console.log(`Server running at http://localhost:${port}`);
});