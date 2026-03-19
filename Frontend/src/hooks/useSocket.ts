import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (sessionCode: string, role: string, userName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionCode) return;

    const newSocket = io('http://localhost:5000', {
      query: {
        sessionCode,
        role,
        userName
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionCode, role, userName]);

  return { socket, connected };
};