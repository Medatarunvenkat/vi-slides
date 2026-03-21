import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { askAI } from './services/aiService';

interface Question {
  id: string;
  studentName: string;
  question: string;
  timestamp: string;
  answer?: string;
}

interface ActiveSession {
  [sessionCode: string]: {
    questions: Question[];
    students: { id: string; name: string }[];
    isPaused: boolean;
  };
}

const activeSessions: ActiveSession = {};

export const createSocketServer = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const { sessionCode, role, userName } = socket.handshake.query;

    if (!sessionCode) {
      socket.disconnect();
      return;
    }

    // Initialize session if it doesn't exist
    if (!activeSessions[sessionCode as string]) {
      activeSessions[sessionCode as string] = {
        questions: [],
        students: [],
        isPaused: false
      };
    }

    // Join session room
    socket.join(sessionCode as string);
    console.log(`${role} ${userName} joined session ${sessionCode}`);

    // Add student to active students list
    if (role === 'student' && userName) {
      const session = activeSessions[sessionCode as string];
      if (!session.students.find(s => s.id === socket.id)) {
        session.students.push({ id: socket.id, name: userName as string });
      }
      // Broadcast updated student list
      io.to(sessionCode as string).emit('update-students', session.students.map(s => s.name));
    }
    else if (role === 'teacher') {
      socket.emit('update-students', activeSessions[sessionCode as string].students.map(s => s.name));
    }

    socket.emit('load-questions', activeSessions[sessionCode as string].questions);
    socket.emit('session-paused-toggled', activeSessions[sessionCode as string].isPaused);

    // Handle new question
    socket.on('send-question', (data: { sessionCode: string; question: string }) => {
      const session = activeSessions[data.sessionCode];
      if (!session || session.isPaused) return;

      const newQuestion: Question = {
        id: Date.now().toString(),
        studentName: userName as string,
        question: data.question,
        timestamp: new Date().toISOString()
      };

      session.questions.push(newQuestion);
      io.to(data.sessionCode).emit('new-question', newQuestion);
    });

    // Handle answer
    socket.on('send-answer', (data: { sessionCode: string; questionId: string; answer: string }) => {
      const session = activeSessions[data.sessionCode];
      if (!session) return;
      const question = session.questions.find(q => q.id === data.questionId);
      if (question) {
        question.answer = data.answer;
        io.to(data.sessionCode).emit('new-answer', question);
      }
    });

    // Handle AI request
    socket.on('ask-ai', async (data: { sessionCode: string; questionId: string }) => {
      if (role !== 'teacher') return;
      const session = activeSessions[data.sessionCode];
      if (!session) return;
      const question = session.questions.find(q => q.id === data.questionId);
      if (!question) return;

      const aiResponse = await askAI(question.question);
      question.answer = ` AI response: ${aiResponse}`;
      io.to(data.sessionCode).emit('new-answer', question);
    });

    // Handle end session
    socket.on('end-session', (data: { sessionCode: string }) => {
      if (role === 'teacher') {
        io.to(data.sessionCode).emit('session-ended');
        delete activeSessions[data.sessionCode];
      }
    });

    // Handle toggle pause
    socket.on('toggle-pause', (data: { sessionCode: string }) => {
      if (role === 'teacher') {
        const session = activeSessions[data.sessionCode];
        if (session) {
          session.isPaused = !session.isPaused;
          io.to(data.sessionCode).emit('session-paused-toggled', session.isPaused);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (role === 'student' && activeSessions[sessionCode as string]) {
        const session = activeSessions[sessionCode as string];
        const index = session.students.findIndex(s => s.id === socket.id);
        if (index > -1) {
          session.students.splice(index, 1);
          io.to(sessionCode as string).emit('update-students', session.students.map(s => s.name));
        }
      }
    });

  });

  return { io, httpServer };
};
