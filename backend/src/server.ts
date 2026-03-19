import express from "express";
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/authRoutes';
import cors from "cors";
import connectDB from "./config/db";
import passport from './config/passport';
import session from 'express-session';
import { createSocketServer } from "./socketServer";
import { createServer } from 'http';

const app = express();
const port = process.env.PORT || 5000;

app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
connectDB();
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("Server working");
});

const httpServer = createServer(app);
const { io } = createSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Socket.IO server running`);
});
