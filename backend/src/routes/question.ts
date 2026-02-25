import express from 'express';
import { body } from 'express-validator';
import {
    createQuestion,
    getSessionQuestions,
    updateQuestion,
    deleteQuestion,
    togglePin,
    respondToQuestion,
    toggleUpvote,
    requestAIAnalysis
} from '../controllers/questionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All question routes require authentication
router.use(protect);

// @route   POST /api/questions
// @desc    Create a new question
router.post(
    '/',
    [
        body('content').trim().notEmpty().withMessage('Question content cannot be empty'),
        body('sessionId').notEmpty().withMessage('Session ID is required'),
    ],
    createQuestion
);

// @route   GET /api/questions/session/:sessionId
// @desc    Get all questions for a session
router.get('/session/:sessionId', getSessionQuestions);

// @route   PATCH /api/questions/:id/pin
// @desc    Toggle pin status of a question
router.patch('/:id/pin', togglePin);

// @route   PATCH /api/questions/:id/respond
// @desc    Respond to a question
router.patch('/:id/respond', respondToQuestion);

// @route   PATCH /api/questions/:id/upvote
// @desc    Toggle upvote on a question
router.patch('/:id/upvote', toggleUpvote);

// @route   PATCH /api/questions/:id/analyze
// @desc    Request AI analysis for a question (Teacher only)
router.patch('/:id/analyze', requestAIAnalysis);

// @route   PUT /api/questions/:id
// @desc    Update a question
router.put(
    '/:id',
    [
        body('content').trim().notEmpty().withMessage('Question content cannot be empty'),
    ],
    updateQuestion
);

// @route   DELETE /api/questions/:id
// @desc    Delete a question
router.delete('/:id', deleteQuestion);

export default router;
