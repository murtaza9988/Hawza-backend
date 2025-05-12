import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { getUserById } from '../models/userModel.js';

const router = express.Router();

// Route for user registration (public)
router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;