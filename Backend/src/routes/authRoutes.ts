import express from "express";
import {registerUser,loginUser, googleLogin} from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";
import User  from "../models/userModels";
import passport from "../config/passport";
const router=express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/google-login", googleLogin);

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/auth/success');
  }
);

// Auth success endpoint
router.get('/auth/success', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

router.get('/Profile', authenticateToken, (req:any, res:any) => {
    const user=User.findOne({ email: req.user.email });
    res.json({
        message: "welcome to profile",
        user: req.user
    });
});
export default router;