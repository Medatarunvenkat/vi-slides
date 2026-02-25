import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import Session from '../models/Session';
import User from '../models/User';
import mongoose from 'mongoose';

let io: SocketServer;

// Map to track socket -> user/session details for disconnect handling
const socketMap = new Map<string, { userId: string; name: string; email: string; sessionCode: string }>();

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Join a session room
        // Payload can be just a code (legacy/string) or object { sessionCode, user }
        socket.on('join_session', async (payload: any) => {
            let sessionCode = '';
            let user = null;

            if (typeof payload === 'string') {
                sessionCode = payload;
            } else {
                sessionCode = payload.sessionCode;
                user = payload.user;
            }

            if (!sessionCode) return;

            socket.join(sessionCode);
            console.log(`📁 User ${socket.id} joined session: ${sessionCode}`);

            // If we have user details, record attendance
            if (user && user._id) {
                try {
                    // Update socket map
                    socketMap.set(socket.id, {
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        sessionCode
                    });

                    // Add attendance record
                    await Session.findOneAndUpdate(
                        { code: sessionCode },
                        {
                            $push: {
                                attendance: {
                                    student: user._id,
                                    name: user.name,
                                    email: user.email,
                                    joinTime: new Date()
                                }
                            }
                        }
                    );

                    // Fetch fresh user data (specifically points)
                    const freshUser = await User.findById(user._id).select('name email points avatar');

                    // Broadcast that user joined to update leaderboards
                    io.to(sessionCode).emit('user_joined', freshUser);

                    // console.log(`Attendance recorded for ${user.name}`);
                } catch (error) {
                    console.error('Error recording attendance:', error);
                }
            }
        });

        // Leave a session room matches logic for disconnect essentially
        socket.on('leave_session', async (sessionCode: string) => {
            socket.leave(sessionCode);
            console.log(`🚪 User ${socket.id} left session: ${sessionCode}`);
            await handleUserLeave(socket.id);
        });

        socket.on('disconnect', async () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            await handleUserLeave(socket.id);
        });

        // Whiteboard Synchronisation
        socket.on('whiteboard_open', ({ sessionCode }) => {
            socket.to(sessionCode).emit('whiteboard_open', { teacherId: socket.id });
        });

        socket.on('whiteboard_close', ({ sessionCode }) => {
            socket.to(sessionCode).emit('whiteboard_close');
        });

        socket.on('whiteboard_draw', ({ sessionCode, data }) => {
            socket.to(sessionCode).emit('whiteboard_draw', data);
        });

        socket.on('whiteboard_clear', ({ sessionCode }) => {
            socket.to(sessionCode).emit('whiteboard_clear');
        });

        // Engagement Features
        socket.on('student_understanding_update', ({ sessionCode, understanding, user }) => {
            socket.to(sessionCode).emit('teacher_understanding_update', {
                socketId: socket.id,
                understanding,
                user
            });
        });

        socket.on('student_hand_raise', ({ sessionCode, isRaised, user }) => {
            socket.to(sessionCode).emit('teacher_hand_raise', {
                socketId: socket.id,
                isRaised,
                user
            });
        });

        // Private Messaging
        socket.on('send_private_msg', ({ recipientId, message, sender }) => {
            // Find recipient's socket(s)
            for (const [sId, data] of socketMap.entries()) {
                if (data.userId.toString() === recipientId.toString() && data.sessionCode === sender.sessionCode) {
                    io.to(sId).emit('receive_private_msg', {
                        sender,
                        message,
                        timestamp: new Date()
                    });
                }
            }
        });

        // Pulse Check Features
        socket.on('pulse_check_init', ({ sessionCode }) => {
            socket.to(sessionCode).emit('pulse_check_start');
        });

        socket.on('pulse_check_response', async ({ userId, sessionCode }) => {
            console.log(`💓 Pulse check response from user ${userId} in session ${sessionCode}`);
            try {
                // Reward 15 bonus points for quick response
                const user = await User.findByIdAndUpdate(userId, { $inc: { points: 15 } }, { new: true });

                // Also add points to session leaderboard
                // Explicitly cast userId to ObjectId for the array filter match
                const userObjectId = new mongoose.Types.ObjectId(userId);

                const result = await Session.updateOne(
                    { code: sessionCode, "attendance.student": userObjectId },
                    { $inc: { "attendance.$.score": 15 } }
                );

                if (result.matchedCount === 0) {
                    console.warn(`⚠️ Failed to update session score for user ${userId}. Attendance record not found for code ${sessionCode}.`);
                } else {
                    console.log(`✅ Session score updated for user ${userId} (+15 pts). Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
                }

                if (user) {
                    io.to(sessionCode).emit('points_updated', { userId, points: user.points, name: user.name });
                }
            } catch (error) {
                console.error('❌ Pulse check reward error:', error);
            }
        });
    });

    return io;
};

// Helper to update leave time
const handleUserLeave = async (socketId: string) => {
    const data = socketMap.get(socketId);
    if (!data) return;

    const { userId, sessionCode } = data;

    try {
        // Find the specific session and update the LAST attendance record for this student that has no leaveTime
        // This is a bit tricky with atomic operators, so we might need to find first.

        // Simplest approach: Find session, find the relevant attendance entry (last one for this user), update it.
        const session = await Session.findOne({ code: sessionCode });
        if (session) {
            // Find the last entry for this student that doesn't have a leaveTime
            // We search from end
            let entryIndex = -1;
            for (let i = session.attendance.length - 1; i >= 0; i--) {
                if (session.attendance[i].student.toString() === userId.toString() && !session.attendance[i].leaveTime) {
                    entryIndex = i;
                    break;
                }
            }

            if (entryIndex !== -1) {
                session.attendance[entryIndex].leaveTime = new Date();
                await session.save();
                // console.log(`Leave time recorded for ${data.name}`);
            }
        }
    } catch (error) {
        console.error('Error recording leave time:', error);
    }

    // Clear from map
    socketMap.delete(socketId);
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper function to emit events to a session room
export const emitToSession = (sessionCode: string, event: string, data: any) => {
    if (io) {
        io.to(sessionCode).emit(event, data);
    }
};
