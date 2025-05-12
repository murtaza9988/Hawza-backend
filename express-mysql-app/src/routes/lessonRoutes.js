import express from 'express';
import pool from '../config/database.js';
import authenticateTeacher from '../middleware/authenticateTeacher.js';

const router = express.Router();

// Get all lessons
router.get('/lessons', async (req, res) => {
  try {
    const [lessons] = await pool.query('SELECT * FROM lessons');
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new lesson (teacher only)
router.post('/lessons', authenticateTeacher, async (req, res) => {
  const { title, description, duration, category } = req.body;

  // Validate input
  if (!title || !description || !duration || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate duration format (e.g., "2 hours")
  if (!/^\d+(\.\d+)?\s*(hours?|hrs?)$/i.test(duration)) {
    return res.status(400).json({ error: 'Duration must be in the format "number hours" (e.g., 2 hours)' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO lessons (title, description, duration, category) VALUES (?, ?, ?, ?)',
      [title, description, duration, category]
    );
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      duration,
      category,
      status: 'Not Started',
      progress: 0,
    });
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/lessons/:id', authenticateTeacher, async (req, res) => {
  const { id } = req.params;
  const { title, description, duration, category } = req.body;

  // Validate input
  if (!title || !description || !duration || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate duration format
  if (!/^\d+(\.\d+)?\s*(hours?|hrs?)$/i.test(duration)) {
    return res.status(400).json({ error: 'Duration must be in the format "number hours" (e.g., 2 hours)' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE lessons SET title = ?, description = ?, duration = ?, category = ? WHERE id = ?',
      [title, description, duration, category, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const [updatedLesson] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    res.json(updatedLesson[0]);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;