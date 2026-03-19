import { Request, Response, NextFunction } from 'express';
import User from "../models/userModels";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

//user registration----------
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name, role }: { email: string; password: string; name: string; role: string } = req.body;
  try {
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email,
      password: hashedPassword,
      name: name,
      role: role
    });
    await newUser.save();

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User login---------------
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    res.json({
      message: "Login successful",
      token: token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = async (req: Request, res: Response) => {
  const { token, role } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { email, name } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      const userRole = role || 'student';
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

      user = new User({
        email: email,
        password: randomPassword,
        name: name,
        role: userRole
      });
      await user.save();
    }
    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Google Login successful",
      token: jwtToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Google Login error:", error);
    res.status(500).json({ message: "Server error during Google login" });
  }
};
