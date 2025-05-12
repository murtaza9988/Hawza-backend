import express from 'express';
import cors from 'cors';
import multer from 'multer';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import assignmentsRoutes from './routes/assignmentsRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api', userRoutes);
app.use('/api', contactRoutes);
app.use('/api', lessonRoutes);
app.use('/api', assignmentsRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    console.error('General error:', err.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});