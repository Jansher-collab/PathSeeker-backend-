import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { mockUsers } from '../seed/seedData';
import { emailService, sentEmailsLog } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'pathseeker_super_secret_jwt_key_2026_career_passport', {
    expiresIn: '7d',
  });
};

// 1. User Registration
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'Student', targetRole, bio } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    const emailNormalized = email.toLowerCase().trim();
    const isStrictDB = !!process.env.MONGO_URI;

    // Check if user already exists
    let existingUser: any;
    try {
      existingUser = await User.findOne({ email: emailNormalized });
    } catch (e: any) {
      if (isStrictDB) throw new Error('Database connection failed: ' + e.message);
      existingUser = mockUsers.find((u) => u.email === emailNormalized);
    }

    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inaugural Visa Stamp for new registration
    const initialStamp = {
      id: `stamp-${Date.now()}`,
      title: 'Inaugural Explorer Stamp',
      category: 'Onboarding',
      icon: 'FaCompass',
      tier: 'Bronze' as const,
      unlockedAt: new Date(),
      description: `Activated PathSeeker Career Passport as ${role}.`,
      code: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    };

    // Generate avatar
    const avatarUrl = req.body.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    let newUser: any;

    try {
      newUser = await User.create({
        name,
        email: emailNormalized,
        password: hashedPassword,
        role: role as UserRole,
        avatar: avatarUrl,
        targetRole: targetRole || 'Full Stack Developer',
        bio: bio || `Career passport holder exploring ${targetRole || 'technology'} paths.`,
        visaStamps: [initialStamp],
        isEmailVerified: true,
      });
    } catch (dbErr: any) {
      if (isStrictDB) {
        throw new Error('Database failed to create user profile: ' + dbErr.message);
      }
      
      // In-Memory Fallback
      newUser = {
        _id: `user-${Date.now()}`,
        name,
        email: emailNormalized,
        password: hashedPassword,
        role: role as UserRole,
        avatar: avatarUrl,
        bio: bio || `Career passport holder exploring ${targetRole || 'technology'} paths.`,
        targetRole: targetRole || 'Full Stack Developer',
        education: [],
        skills: ['JavaScript', 'Problem Solving'],
        interests: ['Career Growth'],
        experience: [],
        bookmarks: [],
        visaStamps: [initialStamp],
        quizHistory: [],
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.unshift(newUser);
    }

    // Dispatch Trigger 1: Registration / Welcome Email
    try {
      await emailService.sendWelcomeEmail(emailNormalized, name, role);
    } catch (e) {
      console.error('[Email] Failed to send welcome email:', e);
    }

    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    // Strip password from response
    const userResponse = { ...newUser.toObject ? newUser.toObject() : newUser };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to PathSeeker!',
      token,
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. User Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' });
      return;
    }

    const emailNormalized = email.toLowerCase().trim();
    const isStrictDB = !!process.env.MONGO_URI;
    
    let user: any;

    try {
      user = await User.findOne({ email: emailNormalized }).select('+password');
    } catch (e: any) {
      if (isStrictDB) throw new Error('Database connection failed: ' + e.message);
      user = mockUsers.find((u) => u.email === emailNormalized);
    }

    if (!user && !isStrictDB) {
      // Check in-memory store if DB query failed
      user = mockUsers.find((u) => u.email === emailNormalized);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
      return;
    }

    // Dispatch Trigger 2: Login Alert / Security Notification
    const forwarded = req.headers['x-forwarded-for'];
    const clientIpRaw = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress || '127.0.0.1';
    const clientIp = clientIpRaw.trim();
    const userAgent = req.headers['user-agent'] || 'Modern Web Browser';
    const loginTime = new Date().toUTCString();

    try {
      await emailService.sendLoginAlertEmail(user.email, user.name, clientIp.toString(), userAgent, loginTime);
    } catch (e) {
      console.error('[Email] Failed to send login alert:', e);
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    const userResponse = { ...user.toObject ? user.toObject() : user };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful. Passport authorized.',
      token,
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Current User Profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { name, bio, targetRole, skills, interests, education, experience, avatar } = req.body;
    const isStrictDB = !!process.env.MONGO_URI;

    let updatedUser: any;

    try {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(name && { name }),
            ...(bio !== undefined && { bio }),
            ...(targetRole && { targetRole }),
            ...(skills && { skills }),
            ...(interests && { interests }),
            ...(education && { education }),
            ...(experience && { experience }),
            ...(avatar && { avatar }),
          },
        },
        { new: true, runValidators: true }
      ).select('-password');
    } catch (e: any) {
      if (isStrictDB) throw new Error('Database profile update failed: ' + e.message);
      
      // In-memory fallback
      const foundIdx = mockUsers.findIndex((u) => u._id === userId.toString());
      if (foundIdx !== -1) {
        mockUsers[foundIdx] = {
          ...mockUsers[foundIdx],
          ...(name && { name }),
          ...(bio !== undefined && { bio }),
          ...(targetRole && { targetRole }),
          ...(skills && { skills }),
          ...(interests && { interests }),
          ...(education && { education }),
          ...(experience && { experience }),
          ...(avatar && { avatar }),
        };
        updatedUser = mockUsers[foundIdx];
      }
    }

    res.status(200).json({
      success: true,
      message: 'Passport profile updated successfully.',
      user: updatedUser || req.user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Forgot Password Request
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide an email address.' });
      return;
    }

    const emailNormalized = email.toLowerCase().trim();
    const isStrictDB = !!process.env.MONGO_URI;
    let user: any;

    try {
      user = await User.findOne({ email: emailNormalized });
    } catch (e: any) {
      if (isStrictDB) throw new Error('Database connection failed: ' + e.message);
      user = mockUsers.find((u) => u.email === emailNormalized);
    }

    if (!user && !isStrictDB) {
      // Check mock store
      user = mockUsers.find((u) => u.email === emailNormalized);
    }

    // Always simulate success response for security, but only send email if user exists
    res.status(200).json({
      success: true,
      message: 'If an account matches that email, a password reset link and 6-digit OTP code has been dispatched.',
    });
    
    if (user) {
      // Generate 6-digit OTP and reset token
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // In a real production system, the resetToken should be hashed and saved to the database user record
      // with an expiration date. For this implementation's scope, we will pass it along.
      try {
        if (isStrictDB) {
          user.resetPasswordToken = resetToken;
          user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
          await user.save();
        }
      } catch (err) {
        console.warn('Failed to save reset token to DB', err);
      }

      // Dispatch Trigger 3: Password Reset Request Email
      try {
        await emailService.sendPasswordResetEmail(user.email, user.name, resetToken, otp);
      } catch (e) {
        console.error('[Email] Failed to send password reset email:', e);
      }
    }

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword, email } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }
    
    if (!token && !email) {
      res.status(400).json({ success: false, message: 'Invalid request. Missing token or email.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const isStrictDB = !!process.env.MONGO_URI;

    let targetEmail = email ? email.toLowerCase().trim() : '';
    let user: any;

    try {
      if (isStrictDB && token && token.startsWith('tok_')) {
        // Find by token if strictly using DB
        user = await User.findOne({ 
          resetPasswordToken: token,
          resetPasswordExpire: { $gt: Date.now() }
        });
        
        if (!user) {
          res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
          return;
        }
      } else if (targetEmail) {
        // Fallback or explicit email based
        user = await User.findOne({ email: targetEmail });
      }
      
      if (user) {
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    } catch (e: any) {
      if (isStrictDB) throw new Error('Database error during password reset: ' + e.message);
      
      // In-memory fallback
      if (!targetEmail) targetEmail = 'student@pathseeker.io';
      const found = mockUsers.find((u) => u.email === targetEmail);
      if (found) {
        found.password = hashedPassword;
        user = found;
      }
    }
    
    if (!user) {
      res.status(404).json({ success: false, message: 'Account not found.' });
      return;
    }

    // Dispatch Trigger 4: Password Updated Confirmation Email
    try {
      await emailService.sendPasswordUpdatedEmail(user.email, user.name);
    } catch (e) {
      console.error('[Email] Failed to send password updated email:', e);
    }

    res.status(200).json({
      success: true,
      message: 'Password has been securely updated. You may now log in with your new credentials.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Dev Endpoint: Inspect Dispatched Emails
export const getSentEmails = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    count: sentEmailsLog.length,
    emails: sentEmailsLog,
  });
};
