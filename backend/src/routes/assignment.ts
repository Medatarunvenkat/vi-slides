import express from 'express';
import {
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
} from '../controllers/assignmentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/assignments
// @desc    Create a new assignment
router.post('/', createAssignment);

// @route   GET /api/assignments
// @desc    Get all assignments (filtered by role)
router.get('/', getAllAssignments);

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
router.get('/:id', getAssignmentById);

// @route   PATCH /api/assignments/:id
// @desc    Update assignment
router.patch('/:id', updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
router.delete('/:id', deleteAssignment);

export default router;
