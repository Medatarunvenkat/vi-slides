import express from 'express';
import { createSession, getSession, getActiveSessions, endSession } from '../controllers/sessionController';

const router = express.Router();

router.post('/', createSession);
router.get('/active', getActiveSessions);
router.get('/:code', getSession);
router.post('/:code/end', endSession);

export default router;
