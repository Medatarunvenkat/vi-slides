import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModels';
import dotenv from 'dotenv';
dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth Strategy initialized');
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
      
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.avatar = profile.photos?.[0]?.value;
        existingUser.isVerified = true;
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new Google OAuth user
        user = new User({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          role: "student", // Default role for Google users
          isVerified: true
        });
        await user.save();
      }
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
}));

export default passport;
