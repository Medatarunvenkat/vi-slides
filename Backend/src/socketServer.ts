import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

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
    students: string[];
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
        students: []
      };
    }

    // Join session room
    socket.join(sessionCode as string);
    console.log(`${role} ${userName} joined session ${sessionCode}`);

    // Add student to active students list
    if (role === 'student' && userName) {
      if (!activeSessions[sessionCode as string].students.includes(userName as string)) {
        activeSessions[sessionCode as string].students.push(userName as string);
      }
    }

    // Send existing questions to new user
    socket.emit('load-questions', activeSessions[sessionCode as string].questions);

    // Handle new question
    socket.on('send-question', (data: { sessionCode: string; question: string }) => {
      const newQuestion: Question = {
        id: Date.now().toString(),
        studentName: userName as string,
        question: data.question,
        timestamp: new Date().toISOString()
      };

      activeSessions[data.sessionCode].questions.push(newQuestion);
      
      // Broadcast to all in session
      io.to(data.sessionCode).emit('new-question', newQuestion);
      console.log(`New question in ${data.sessionCode}:`, newQuestion);
    });

    // Handle answer
    socket.on('send-answer', (data: { sessionCode: string; questionId: string; answer: string }) => {
      const questionIndex = activeSessions[data.sessionCode].questions.findIndex(
        q => q.id === data.questionId
      );

      if (questionIndex !== -1) {
        activeSessions[data.sessionCode].questions[questionIndex].answer = data.answer;
        
        // Broadcast to all in session
        io.to(data.sessionCode).emit('new-answer', activeSessions[data.sessionCode].questions[questionIndex]);
        console.log(`Answer added in ${data.sessionCode}:`, data.questionId);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove student from active list
      if (role === 'student' && userName) {
        const index = activeSessions[sessionCode as string].students.indexOf(userName as string);
        if (index > -1) {
          activeSessions[sessionCode as string].students.splice(index, 1);
        }
      }
    });
  });

  return { io, httpServer };
};