import { Request, Response } from 'express';
import Session from '../models/Session';
import Question from '../models/Question';
import GuestParticipant from '../models/GuestParticipant';
import { emitToSession } from '../config/socket';

// @desc    Guest join session with form submission
// @route   POST /api/sessions/guest/join
// @access  Public (no authentication required)
export const guestJoinSession = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📝 Guest join request:', req.body);
        const { code, name, email, question } = req.body;

        // Validate required fields
        if (!code || !name || !email) {
            console.log('❌ Missing required fields:', { code, name, email });
            res.status(400).json({
                success: false,
                message: 'Session code, name, and email are required'
            });
            return;
        }

        // Find the session
        const session = await Session.findOne({ code: code.toUpperCase(), status: { $in: ['active', 'paused'] } });

        if (!session) {
            res.status(404).json({
                success: false,
                message: 'Active session not found with this code'
            });
            return;
        }

        // Create guest participant record
        const guestParticipant = await GuestParticipant.create({
            name,
            email,
            session: session._id,
            initialQuestion: question || ''
        });

        // If a question was provided, create it
        let createdQuestion = null;
        if (question && question.trim()) {
            createdQuestion = await Question.create({
                content: question.trim(),
                session: session._id,
                guestName: name,
                guestEmail: email,
                status: 'active',
                analysisStatus: 'not_requested',
                upvotes: [],
                isPinned: false,
                isDirectToTeacher: true
            });

            // Emit the new question to the session
            emitToSession(session.code, 'new_question', createdQuestion);
        }

        res.status(200).json({
            success: true,
            data: {
                sessionCode: session.code,
                guestId: guestParticipant._id,
                questionId: createdQuestion?._id
            },
            message: 'Successfully joined session'
        });
    } catch (error) {
        console.error('Guest join error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during guest join'
        });
    }
};

// @desc    Get public session info (title, status) for guest join
// @route   GET /api/guest/session/:code
// @access  Public
export const getPublicSessionInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;
        const session = await Session.findOne({ code: code.toUpperCase() }, 'title status code');

        if (!session) {
            res.status(404).json({
                success: false,
                message: 'Session not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                title: session.title,
                status: session.status,
                code: session.code
            }
        });
    } catch (error) {
        console.error('Get public session info error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching session info'
        });
    }
};
