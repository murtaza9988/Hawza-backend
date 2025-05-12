import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

// Route for contact form submission
router.post('/contact', submitContactForm);

export default router;