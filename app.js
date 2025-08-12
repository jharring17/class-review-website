import express from 'express';
import { dbConnection } from './config/mongoConnections.js';
import statsRoutes from './routes/stats.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/stats', statsRoutes);

app.get('/', (_req, res) => {
  res.send('Class Review API running');
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await dbConnection();
  console.log(`Server running at http://localhost:${port}`);
});

