import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { createUser, getUserByEmail } from '../models/userModel.js';

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

const isValidPassword = (password) => {
  return password.length >= 8 && /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password);
};

const isValidRole = (role) => {
  return ['student', 'teacher'].includes(role);
};

export const registerUser = async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, role, acceptTerms } = req.body;

  console.log('Received registration data:', { fullName, email, phone, password, confirmPassword, role, acceptTerms });

  if (!fullName || !email || !phone || !password || !confirmPassword || !role || !acceptTerms) {
    return res.status(400).json({ error: 'All fields are required, including accepting terms' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long and include numbers and symbols' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (!isValidRole(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "student" or "teacher"' });
  }

  if (!acceptTerms) {
    return res.status(400).json({ error: 'You must accept the terms and conditions' });
  }

  try {
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Existing users check:', existingUsers);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = await createUser(fullName, email, phone, password, role);
    console.log('User created with ID:', userId);

    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId,
      role,
      email,
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      email: user.email,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};