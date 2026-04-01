import express from 'express';
import cors from 'cors';
import skillsRouter from './routes/skills';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/skills', skillsRouter);

app.listen(PORT, () => {
  console.log(`Skill Market Backend running on http://localhost:${PORT}`);
});
