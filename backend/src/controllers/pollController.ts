import { Request, Response } from 'express';
import Poll from '../models/Poll';
import Session from '../models/Session';
import { emitToSession } from '../config/socket';
import User from '../models/User';

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private (Teacher only)
export const createPoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const { question, type, options, sessionId } = req.body;

        if (!question || !sessionId || !options || options.length < 2) {
            res.status(400).json({ success: false, message: 'Invalid poll data' });
            return;
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Check if teacher
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Only teachers can create polls' });
            return;
        }

        // Deactivate previous active polls for this session
        await Poll.updateMany({ session: sessionId, isActive: true }, { isActive: false });

        const poll = await Poll.create({
            question,
            type,
            options: options.map((opt: string) => ({ text: opt, votes: 0 })),
            session: sessionId
        });

        emitToSession(session.code, 'new_poll', poll);

        res.status(201).json({
            success: true,
            data: poll
        });
    } catch (error) {
        console.error('Create poll error:', error);
        res.status(500).json({ success: false, message: 'Server error creating poll' });
    }
};

// @desc    Submit a vote for a poll
// @route   PATCH /api/polls/:id/vote
// @access  Private
export const votePoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id).populate('session', 'code');

        if (!poll || !poll.isActive) {
            res.status(404).json({ success: false, message: 'Active poll not found' });
            return;
        }

        if (optionIndex === undefined || optionIndex < 0 || optionIndex >= poll.options.length) {
            res.status(400).json({ success: false, message: 'Invalid option selected' });
            return;
        }

        // Check if user already voted
        const existingResponse = poll.responses.find((r: any) => r.user.toString() === req.user?._id.toString());
        if (existingResponse) {
            res.status(400).json({ success: false, message: 'You have already voted' });
            return;
        }

        poll.options[optionIndex].votes += 1;

        if (req.user && req.user._id) {
            poll.responses.push({
                user: req.user._id,
                optionIndex,
                name: req.user.name || 'Unknown'
            });
        }

        await poll.save();

        // Reward points for voting (+20)
        const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $inc: { points: 20 } }, { new: true });

        const session = poll.session as any;
        emitToSession(session.code, 'poll_update', poll);

        // Emit points update so leaderboard reflects the change instantly
        if (updatedUser) {
            emitToSession(session.code, 'points_updated', {
                userId: updatedUser._id,
                points: updatedUser.points,
                name: updatedUser.name
            });
        }

        res.status(200).json({
            success: true,
            data: poll
        });
    } catch (error) {
        console.error('Vote poll error:', error);
        res.status(500).json({ success: false, message: 'Server error submitting vote' });
    }
};

// @desc    Close a poll
// @route   PATCH /api/polls/:id/close
// @access  Private (Teacher only)
export const closePoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const poll = await Poll.findById(req.params.id).populate('session', 'code teacher');

        if (!poll) {
            res.status(404).json({ success: false, message: 'Poll not found' });
            return;
        }

        const session = poll.session as any;
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        poll.isActive = false;
        await poll.save();

        emitToSession(session.code, 'poll_closed', poll);

        res.status(200).json({
            success: true,
            data: poll
        });
    } catch (error) {
        console.error('Close poll error:', error);
        res.status(500).json({ success: false, message: 'Server error closing poll' });
    }
};

// @desc    Get active poll for a session
// @route   GET /api/polls/session/:sessionId
// @access  Private
export const getActivePoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const poll = await Poll.findOne({ session: req.params.sessionId, isActive: true });
        res.status(200).json({
            success: true,
            data: poll
        });
    } catch (error) {
        console.error('Get poll error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching poll' });
    }
};

// @desc    Declare a winner option for a poll and award points
// @route   PATCH /api/polls/:id/declare-winner
// @access  Private (Teacher only)
export const declarePollWinner = async (req: Request, res: Response): Promise<void> => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id).populate('session', 'code teacher');

        if (!poll) {
            res.status(404).json({ success: false, message: 'Poll not found' });
            return;
        }

        const session = poll.session as any;
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        if (optionIndex === undefined || optionIndex < 0 || optionIndex >= poll.options.length) {
            res.status(400).json({ success: false, message: 'Invalid option index' });
            return;
        }

        // Find all students who voted for this option
        const winners = poll.responses.filter((r: any) => r.optionIndex === optionIndex);

        // Award points to winners (+50)
        for (const winner of winners) {
            await User.findByIdAndUpdate(winner.user, { $inc: { points: 50 } });
        }

        // Emit celebration event! 
        emitToSession(session.code, 'poll_winner_declared', {
            pollId: poll._id,
            winningOptionIndex: optionIndex,
            winningOptionText: poll.options[optionIndex].text,
            winnerCount: winners.length
        });

        // Trigger confetti for everyone
        emitToSession(session.code, 'celebration', {
            type: 'confetti',
            duration: 5000
        });

        // Also emit points update for each winner so leaderboards refresh
        for (const winner of winners) {
            const updatedUser = await User.findById(winner.user);
            if (updatedUser) {
                emitToSession(session.code, 'points_updated', { userId: winner.user, points: updatedUser.points, name: updatedUser.name });
            }
        }

        res.status(200).json({
            success: true,
            winnerCount: winners.length,
            message: `Awarded points to ${winners.length} students`
        });
    } catch (error) {
        console.error('Declare winner error:', error);
        res.status(500).json({ success: false, message: 'Server error declaring winner' });
    }
};
