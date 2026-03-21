import { Request, Response } from 'express';
import Session from '../models/sessionModel';

export const createSession = async (req: Request, res: Response) => {
  const { name, createdBy } = req.body;
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSession = new Session({
      code,
      name,
      createdBy: createdBy || "teacher",
      status: "active"
    });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSession = async (req: Request, res: Response) => {
  const { code } = req.params;
  if (typeof code !== 'string') {
    return res.status(400).json({ message: "Invalid session code" });
  }
  try {
    const session = await Session.findOne({ code: code.toUpperCase() });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({ status: "active" });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const endSession = async (req: Request, res: Response) => {
  const { code } = req.params;
  if (typeof code !== 'string') {
    return res.status(400).json({ message: "Invalid session code" });
  }
  try {
    const session = await Session.findOneAndUpdate(
      { code: code.toUpperCase() },
      { status: "ended" },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ message: "Session ended successfully" });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: "Server error" });
  }
};
