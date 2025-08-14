import express from 'express';
import statsRoutes from './routes/stats.js';

const app = express();
app.use(express.json());

app.use('/stats', statsRoutes); // <- mount here

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
