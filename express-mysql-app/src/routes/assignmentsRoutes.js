import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all assignments
router.get('/assignments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assignments');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching assignments:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new assignment (teacher only)
router.post('/assignments', async (req, res) => {
  const { title, description, due_date, course } = req.body;
  if (!title || !description || !due_date || !course) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO assignments (title, description, due_date, course) VALUES (?, ?, ?, ?)',
      [title, description, due_date, course]
    );
    res.status(201).json({ id: result.insertId, title, description, due_date, course, status: 'pending' });
  } catch (error) {
    console.error('Error adding assignment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an assignment (teacher only)
router.put('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, course, status, grade, submitted_at } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE assignments SET title = ?, description = ?, due_date = ?, course = ?, status = ?, grade = ?, submitted_at = ? WHERE id = ?',
      [title, description, due_date, course, status, grade || null, submitted_at || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ id, title, description, due_date, course, status, grade, submitted_at });
  } catch (error) {
    console.error('Error updating assignment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an assignment (teacher only)
router.delete('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM assignments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;