import express from 'express';
import { body } from 'express-validator';
import { guestJoinSession, getPublicSessionInfo } from '../controllers/guestController';

const router = express.Router();

// @route   GET /api/guest/session/:code
// @desc    Get public session info
// @access  Public
router.get('/session/:code', getPublicSessionInfo);

// @route   POST /api/guest/join
// @desc    Guest join session with form submission
// @access  Public (no authentication)
router.post(
    '/join',
    [
        body('code').trim().notEmpty().withMessage('Session code is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Valid email is required'),
        body('question').optional().trim()
    ],
    guestJoinSession
);

export default router;
