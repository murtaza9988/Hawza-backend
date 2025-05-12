import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const createUser = async (fullName, email, phone, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [fullName, email, phone, hashedPassword, role]
  );
  return result.insertId;
};

export const getUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
};

export const getUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const getUserById = async (userId) => {
  const [rows] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [userId]);
  return rows[0];
};