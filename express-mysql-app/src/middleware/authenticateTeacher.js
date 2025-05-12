// middleware/authenticateTeacher.js
import jwt from 'jsonwebtoken';

const authenticateTeacher = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied: Teacher role required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default authenticateTeacher;