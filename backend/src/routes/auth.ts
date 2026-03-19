import { Router, Request, Response } from 'express';
import { z } from 'zod';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  register,
  login,
  refreshTokens,
  logout,
  getOrCreateGoogleUser,
  getUserById,
} from '../services/auth.service.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens.js';
import prisma from '../lib/prisma.js';

// --------------- Zod schemas ---------------

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// --------------- Cookie config ---------------

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// --------------- Passport Google OAuth ---------------

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          const user = await getOrCreateGoogleUser({
            email,
            firstName: profile.name?.givenName || 'Google',
            lastName: profile.name?.familyName || 'User',
            avatarUrl: profile.photos?.[0]?.value,
          });

          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

// --------------- Router ---------------

const router = Router();

// POST /register
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response) => {
    const result = await register(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  }
);

// POST /login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response) => {
    const result = await login(req.body.email, req.body.password);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({ user: result.user, accessToken: result.accessToken });
  }
);

// POST /logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await logout(token);
  }
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ message: 'Logged out' });
});

// POST /refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const oldToken = req.cookies?.refreshToken;
  if (!oldToken) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'No refresh token', details: [] },
    });
    return;
  }

  const result = await refreshTokens(oldToken);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken: result.accessToken });
});

// GET /me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.id);
  res.json({ user });
});

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req: Request, res: Response) => {
      const user = req.user as any;
      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      await prisma.refreshToken.create({
        data: {
          token: hashToken(refreshToken),
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      const redirectUrl = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')[0].trim();
      res.redirect(`${redirectUrl}/?auth=success`);
    }
  );
}

export default router;
