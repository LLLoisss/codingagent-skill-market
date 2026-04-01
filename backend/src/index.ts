import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import skillsRouter from './routes/skills';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/skills', skillsRouter);

// Serve frontend static files in production
const frontendDist = path.join(__dirname, '..', 'public');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Skill Market running on http://0.0.0.0:${PORT}`);
});
