import express from 'express';
import {
    submitAssignment,
    getSubmissionsByAssignment,
    getMySubmissions,
    gradeSubmission
} from '../controllers/submissionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/submissions
// @desc    Submit assignment
router.post('/', submitAssignment);

// @route   GET /api/submissions/my-submissions
// @desc    Get student's own submissions
router.get('/my-submissions', getMySubmissions);

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment (Teacher only)
router.get('/assignment/:assignmentId', getSubmissionsByAssignment);

// @route   PATCH /api/submissions/:id/grade
// @desc    Grade submission and send email
router.patch('/:id/grade', gradeSubmission);

export default router;
