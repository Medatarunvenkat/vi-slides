import express from 'express';
import {
    createPoll,
    votePoll,
    closePoll,
    getActivePoll,
    declarePollWinner
} from '../controllers/pollController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createPoll);
router.get('/session/:sessionId', getActivePoll);
router.patch('/:id/vote', votePoll);
router.patch('/:id/close', closePoll);
router.patch('/:id/declare-winner', declarePollWinner);

export default router;
