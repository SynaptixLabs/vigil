/**
 * Auth Routes — /api/auth/*
 *
 * Thin route handlers that delegate to auth.service.ts.
 * All input validation via Zod schemas from auth.schemas.ts.
 *
 * Route contract from ADR S09-001:
 *
 * PUBLIC:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/verify-email
 *   POST /api/auth/resend-verification
 *   POST /api/auth/refresh
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *
 * AUTHENTICATED:
 *   POST /api/auth/logout
 *   GET  /api/auth/profile
 *   PUT  /api/auth/profile
 *   POST /api/auth/change-password
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.schemas.js';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  checkRateLimit,
  AuthError,
} from './auth.service.js';
import { authMiddleware } from './auth.middleware.js';
import { REFRESH_TOKEN_TTL } from './jwt.utils.js';
import { ZodError } from 'zod';

export const authRouter = Router();

// ============================================================================
// Rate limit constants
// ============================================================================

/** 5 registrations per IP per hour. */
const REGISTER_RATE_LIMIT = 5;
const REGISTER_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

/** 3 resend-verification per email per hour. */
const RESEND_RATE_LIMIT = 3;
const RESEND_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

// ============================================================================
// Helpers
// ============================================================================

/** Get client IP from request (X-Forwarded-For or socket). */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

// ============================================================================
// PUBLIC routes
// ============================================================================

/** POST /api/auth/register */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    // Rate limit: 5 registrations per IP per hour
    const ip = getClientIp(req);
    if (!checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT, REGISTER_RATE_WINDOW)) {
      res.status(429).json({ error: 'Too many registration attempts. Try again later.' });
      return;
    }

    const input = registerSchema.parse(req.body);
    const result = await register(input);
    // Note: verificationCode would be sent via Resend (email service)
    // For now, we log it (Sprint 09 — email integration TBD)
    console.log(`[auth] Verification code for ${input.email}: ${result.verificationCode}`);
    res.status(201).json({
      userId: result.userId,
      emailVerified: result.emailVerified,
    });
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** POST /api/auth/login */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input);

    // Set refresh token cookie (HttpOnly, Secure, SameSite=Strict)
    res.cookie('refreshToken', result.refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: REFRESH_TOKEN_TTL,
    });

    // Set fingerprint cookie (HttpOnly, Secure, SameSite=Strict)
    res.cookie('__Secure-Fgp', result.fingerprint.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** POST /api/auth/verify-email */
authRouter.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const input = verifyEmailSchema.parse(req.body);
    const result = await verifyEmail(input.code);
    res.json(result);
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** POST /api/auth/resend-verification */
authRouter.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const input = resendVerificationSchema.parse(req.body);

    // Rate limit: 3 resend per email per hour
    if (!checkRateLimit(`resend:${input.email}`, RESEND_RATE_LIMIT, RESEND_RATE_WINDOW)) {
      res.status(429).json({ error: 'Too many verification requests. Try again later.' });
      return;
    }

    const result = await resendVerification(input.email);
    if (result) {
      // Note: code would be sent via Resend (email service)
      console.log(`[auth] Resend verification code for ${input.email}: ${result.code}`);
    }
    // Always return 200 — never reveal if email exists or is already verified
    res.json({ message: 'If an unverified account with that email exists, a new code has been sent.' });
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** POST /api/auth/forgot-password */
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const result = await forgotPassword(input.email);
    if (result) {
      // Note: code would be sent via Resend (email service)
      console.log(`[auth] Reset code for ${input.email}: ${result.code}`);
    }
    // Always return 200 — never reveal if email exists
    res.json({ message: 'If an account with that email exists, a reset code has been sent.' });
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** POST /api/auth/reset-password */
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const input = resetPasswordSchema.parse(req.body);
    await resetPassword(input.code, input.newPassword);
    res.json({ message: 'Password reset. Please log in.' });
  } catch (err) {
    handleAuthError(res, err);
  }
});

// ============================================================================
// AUTHENTICATED routes
// ============================================================================

/** POST /api/auth/logout */
authRouter.post('/logout', authMiddleware, async (_req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.clearCookie('__Secure-Fgp', { path: '/' });
  // Note: Token revocation (B06) will add the refresh token to the deny list
  res.json({ message: 'Logged out' });
});

/** GET /api/auth/profile */
authRouter.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const profile = await getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** PUT /api/auth/profile */
authRouter.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const input = updateProfileSchema.parse(req.body);
    const profile = await updateProfile(req.user.id, input);
    res.json(profile);
  } catch (err) {
    handleAuthError(res, err);
  }
});

/** POST /api/auth/change-password */
authRouter.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const input = changePasswordSchema.parse(req.body);
    await changePassword(req.user.id, input.oldPassword, input.newPassword);
    // Clear cookies (force re-login)
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.clearCookie('__Secure-Fgp', { path: '/' });
    res.json({ message: 'Password changed. Please log in again.' });
  } catch (err) {
    handleAuthError(res, err);
  }
});

// ============================================================================
// Error handler
// ============================================================================

function handleAuthError(res: Response, err: unknown): void {
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  console.error('[auth] Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
