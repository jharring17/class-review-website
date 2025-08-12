import express from 'express';
import { dbConnection } from './config/mongoConnections.js';
import statsRoutes from './routes/stats.js';
import coursesRoutes from './routes/courses.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/stats', statsRoutes);
app.use('/courses', coursesRoutes);

// Home route
app.get('/', (_req, res) => {
  res.send('Class Review API running');
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await dbConnection();
  console.log(`Server running at http://localhost:${port}`);
});


