import pool from '../config/database.js';

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

export const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log('Received contact form data:', { name, email, subject, message });

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    console.log('Insert result:', result);

    res.status(201).json({ message: 'Contact message submitted successfully', messageId: result.insertId });
  } catch (error) {
    console.error('Error submitting contact form:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};