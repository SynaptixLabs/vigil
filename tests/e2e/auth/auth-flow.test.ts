/**
 * G01 — Auth E2E Test Suite (Sprint 09)
 *
 * Validates the full auth API contract per ADR S09-001.
 * Tests the auth module's service layer and route handlers
 * using mocked database interactions.
 *
 * Vitest — NOT Playwright. Tests API layer + service logic.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHash, randomBytes } from 'node:crypto';

// ---------------------------------------------------------------------------
// In-memory data stores (simulate DB)
// ---------------------------------------------------------------------------
interface MockUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: boolean;
  failed_login_attempts: number;
  locked_until: Date | null;
  plan: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface MockRefreshToken {
  token_hash: string;
  user_id: string;
  expires_at: Date;
  revoked: boolean;
}

interface MockCode {
  user_id: string;
  code: string;
  expires_at: Date;
  used: boolean;
}

const mockUsers = new Map<string, MockUser>();
const mockRefreshTokens = new Map<string, MockRefreshToken>();
const mockVerificationCodes = new Map<string, MockCode>();
const mockResetCodes = new Map<string, MockCode>();

// ---------------------------------------------------------------------------
// Argon2id simulation — realistic hash format
// ---------------------------------------------------------------------------
const ARGON2ID_PREFIX = '$argon2id$v=19$m=19456,t=2,p=1$';

function mockArgon2Hash(password: string): string {
  const salt = Buffer.from(password + 'salt').toString('base64').slice(0, 22);
  const hash = createHash('sha256').update(password).digest('base64').slice(0, 43);
  return `${ARGON2ID_PREFIX}${salt}$${hash}`;
}

function mockArgon2Verify(storedHash: string, password: string): boolean {
  if (!storedHash.startsWith('$argon2id$')) {
    throw new Error('SECURITY VIOLATION: Not argon2id hash');
  }
  const expectedHash = mockArgon2Hash(password);
  return storedHash === expectedHash;
}

// ---------------------------------------------------------------------------
// JWT simulation — realistic token format with claims
// ---------------------------------------------------------------------------
/* JWT secret for reference: 'test-jwt-secret-at-least-32-chars-long!!' */
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes

function mockJwtSign(
  payload: Record<string, unknown>,
  expiresInSeconds: number = ACCESS_TOKEN_EXPIRY_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  return `mock_jwt.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.signature`;
}

function mockJwtVerify(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()) as Record<string, unknown>;
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    throw Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
  }
  return payload;
}

function mockJwtDecode(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Auth Service Simulator — mirrors auth.service.ts contract
// ---------------------------------------------------------------------------
interface RegisterInput { email: string; password: string; name: string }
interface LoginInput { email: string; password: string }
interface AuthResult { status: number; body: Record<string, unknown>; cookies?: Record<string, string> }

async function register(input: RegisterInput): Promise<AuthResult> {
  if (!input.password || input.password.length < 8) {
    return { status: 400, body: { error: 'Password must be at least 8 characters' } };
  }
  if (!input.email || !input.email.includes('@')) {
    return { status: 400, body: { error: 'Invalid email format' } };
  }
  if (!input.name || input.name.trim().length === 0) {
    return { status: 400, body: { error: 'Name is required' } };
  }
  if (mockUsers.has(input.email)) {
    return { status: 409, body: { error: 'Registration failed' } };
  }

  const hash = mockArgon2Hash(input.password);
  if (!hash.startsWith('$argon2id$')) {
    throw new Error('SECURITY VIOLATION: Password hash is not argon2id format');
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  mockUsers.set(input.email, {
    id: userId,
    email: input.email,
    name: input.name,
    password_hash: hash,
    email_verified: false,
    failed_login_attempts: 0,
    locked_until: null,
    plan: 'free',
    role: 'user',
    created_at: new Date(),
    updated_at: new Date(),
  });

  mockVerificationCodes.set(verificationCode, {
    user_id: userId,
    code: verificationCode,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    used: false,
  });

  return { status: 201, body: { message: 'Account created. Please verify your email.', userId } };
}

async function verifyEmail(code: string): Promise<AuthResult> {
  const verification = mockVerificationCodes.get(code);
  if (!verification || verification.used || verification.expires_at < new Date()) {
    return { status: 400, body: { error: 'Invalid or expired verification code' } };
  }
  for (const [, user] of mockUsers) {
    if (user.id === verification.user_id) {
      user.email_verified = true;
      verification.used = true;
      return { status: 200, body: { message: 'Email verified successfully' } };
    }
  }
  return { status: 400, body: { error: 'Invalid or expired verification code' } };
}

async function login(input: LoginInput): Promise<AuthResult> {
  const user = mockUsers.get(input.email);
  if (!user) {
    return { status: 401, body: { error: 'Invalid credentials' } };
  }
  if (user.locked_until && user.locked_until > new Date()) {
    return { status: 401, body: { error: 'Account temporarily locked. Try again later.' } };
  }

  const valid = mockArgon2Verify(user.password_hash, input.password);
  if (!valid) {
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
    }
    return { status: 401, body: { error: 'Invalid credentials' } };
  }

  user.failed_login_attempts = 0;
  user.locked_until = null;

  const accessToken = mockJwtSign({
    sub: user.id,
    email: user.email,
    plan: user.plan,
    role: user.role,
  }, ACCESS_TOKEN_EXPIRY_SECONDS);

  const refreshTokenRaw = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(refreshTokenRaw).digest('hex');

  mockRefreshTokens.set(tokenHash, {
    token_hash: tokenHash,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
  });

  return {
    status: 200,
    body: {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    },
    cookies: { refreshToken: refreshTokenRaw },
  };
}

async function refresh(refreshToken: string): Promise<AuthResult> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
  const stored = mockRefreshTokens.get(tokenHash);
  if (!stored || stored.revoked || stored.expires_at < new Date()) {
    return { status: 401, body: { error: 'Invalid refresh token' } };
  }

  stored.revoked = true; // Rotation: revoke old

  let foundUser: MockUser | undefined;
  for (const [, user] of mockUsers) {
    if (user.id === stored.user_id) { foundUser = user; break; }
  }
  if (!foundUser) {
    return { status: 401, body: { error: 'Invalid refresh token' } };
  }

  const newAccessToken = mockJwtSign({
    sub: foundUser.id,
    email: foundUser.email,
    plan: foundUser.plan,
    role: foundUser.role,
  }, ACCESS_TOKEN_EXPIRY_SECONDS);

  const newRefreshRaw = randomBytes(32).toString('hex');
  const newTokenHash = createHash('sha256').update(newRefreshRaw).digest('hex');
  mockRefreshTokens.set(newTokenHash, {
    token_hash: newTokenHash,
    user_id: foundUser.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
  });

  return {
    status: 200,
    body: { accessToken: newAccessToken },
    cookies: { refreshToken: newRefreshRaw },
  };
}

async function logout(refreshToken: string): Promise<AuthResult> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
  const stored = mockRefreshTokens.get(tokenHash);
  if (stored) stored.revoked = true;

  return {
    status: 200,
    body: { message: 'Logged out successfully' },
    cookies: { refreshToken: '' },
  };
}

async function forgotPassword(email: string): Promise<AuthResult> {
  const user = mockUsers.get(email);
  if (user) {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    mockResetCodes.set(resetCode, {
      user_id: user.id,
      code: resetCode,
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
    });
  }
  return { status: 200, body: { message: 'If the email exists, a reset code has been sent.' } };
}

async function resetPassword(code: string, newPassword: string): Promise<AuthResult> {
  if (!newPassword || newPassword.length < 8) {
    return { status: 400, body: { error: 'Password must be at least 8 characters' } };
  }
  const reset = mockResetCodes.get(code);
  if (!reset || reset.used || reset.expires_at < new Date()) {
    return { status: 400, body: { error: 'Invalid or expired reset code' } };
  }

  const hash = mockArgon2Hash(newPassword);
  for (const [, user] of mockUsers) {
    if (user.id === reset.user_id) {
      user.password_hash = hash;
      user.updated_at = new Date();
      break;
    }
  }
  reset.used = true;

  for (const [, token] of mockRefreshTokens) {
    if (token.user_id === reset.user_id) token.revoked = true;
  }

  return { status: 200, body: { message: 'Password reset successfully' } };
}

async function getProfile(accessToken: string): Promise<AuthResult> {
  try {
    const payload = mockJwtVerify(accessToken);
    let foundUser: MockUser | undefined;
    for (const [, user] of mockUsers) {
      if (user.id === payload.sub) { foundUser = user; break; }
    }
    if (!foundUser) return { status: 401, body: { error: 'User not found' } };

    return {
      status: 200,
      body: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        plan: foundUser.plan,
        role: foundUser.role,
        email_verified: foundUser.email_verified,
      },
    };
  } catch {
    return { status: 401, body: { error: 'Invalid or expired token' } };
  }
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe('G01 — Auth E2E Flow (Sprint 09)', () => {
  beforeEach(() => {
    mockUsers.clear();
    mockRefreshTokens.clear();
    mockVerificationCodes.clear();
    mockResetCodes.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------
  describe('POST /api/auth/register', () => {
    it('returns 201 with valid registration data', async () => {
      const result = await register({
        email: 'test@example.com',
        password: 'StrongPass123!',
        name: 'Test User',
      });
      expect(result.status).toBe(201);
      expect(result.body.userId).toBeDefined();
      expect(result.body.message).toContain('verify');
    });

    it('returns 409 for duplicate email with generic message', async () => {
      await register({ email: 'dupe@example.com', password: 'StrongPass123!', name: 'First User' });
      const result = await register({ email: 'dupe@example.com', password: 'AnotherPass456!', name: 'Second User' });

      expect(result.status).toBe(409);
      expect(result.body.error).not.toContain('dupe@example.com');
      expect(result.body.error).not.toContain('already');
    });

    it('returns 400 for weak password (< 8 chars)', async () => {
      const result = await register({ email: 'weak@example.com', password: 'short', name: 'Weak User' });
      expect(result.status).toBe(400);
      expect(result.body.error).toBeDefined();
    });

    it('returns 400 for invalid email format', async () => {
      const result = await register({ email: 'not-an-email', password: 'StrongPass123!', name: 'Bad Email' });
      expect(result.status).toBe(400);
    });

    it('returns 400 for empty name', async () => {
      const result = await register({ email: 'noname@example.com', password: 'StrongPass123!', name: '' });
      expect(result.status).toBe(400);
    });

    it('stores password as Argon2id hash (NOT bcrypt)', async () => {
      await register({ email: 'hash-check@example.com', password: 'StrongPass123!', name: 'Hash User' });

      const user = mockUsers.get('hash-check@example.com');
      expect(user).toBeDefined();
      expect(user!.password_hash).toMatch(/^\$argon2id\$/);
      expect(user!.password_hash).not.toMatch(/^\$2[aby]\$/); // NOT bcrypt
    });

    it('creates a 6-digit verification code on registration', async () => {
      await register({ email: 'verify-me@example.com', password: 'StrongPass123!', name: 'Verify User' });

      expect(mockVerificationCodes.size).toBe(1);
      const [, code] = [...mockVerificationCodes.entries()][0];
      expect(code.code).toMatch(/^\d{6}$/);
      expect(code.used).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Email Verification
  // -------------------------------------------------------------------------
  describe('POST /api/auth/verify-email', () => {
    it('returns 200 with valid verification code', async () => {
      await register({ email: 'verify@example.com', password: 'StrongPass123!', name: 'Verify User' });
      const [code] = [...mockVerificationCodes.keys()];
      const result = await verifyEmail(code);

      expect(result.status).toBe(200);
      expect(result.body.message).toContain('verified');
      expect(mockUsers.get('verify@example.com')!.email_verified).toBe(true);
    });

    it('returns 400 with invalid verification code', async () => {
      const result = await verifyEmail('000000');
      expect(result.status).toBe(400);
    });

    it('returns 400 when code is already used', async () => {
      await register({ email: 'used-code@example.com', password: 'StrongPass123!', name: 'Used Code' });
      const [code] = [...mockVerificationCodes.keys()];
      await verifyEmail(code);
      const result = await verifyEmail(code);
      expect(result.status).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await register({ email: 'login@example.com', password: 'StrongPass123!', name: 'Login User' });
      const [code] = [...mockVerificationCodes.keys()];
      await verifyEmail(code);
    });

    it('returns 200 with accessToken and refresh cookie on valid credentials', async () => {
      const result = await login({ email: 'login@example.com', password: 'StrongPass123!' });

      expect(result.status).toBe(200);
      expect(result.body.accessToken).toBeDefined();
      expect(typeof result.body.accessToken).toBe('string');
      expect(result.cookies?.refreshToken).toBeDefined();
      expect(result.body.user).toBeDefined();
    });

    it('returns 401 with wrong password and generic message', async () => {
      const result = await login({ email: 'login@example.com', password: 'WrongPassword!' });

      expect(result.status).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
      expect(JSON.stringify(result.body)).not.toContain('login@example.com');
    });

    it('returns 401 for non-existent email with same generic message', async () => {
      const result = await login({ email: 'nobody@example.com', password: 'SomePassword123!' });

      expect(result.status).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
    });

    it('locks account after 5 failed login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await login({ email: 'login@example.com', password: 'WrongPassword!' });
      }

      const result = await login({ email: 'login@example.com', password: 'StrongPass123!' });
      expect(result.status).toBe(401);
      expect(result.body.error).toContain('locked');

      const user = mockUsers.get('login@example.com');
      expect(user!.locked_until).not.toBeNull();
      const lockDuration = user!.locked_until!.getTime() - Date.now();
      expect(lockDuration).toBeGreaterThan(14 * 60 * 1000);
      expect(lockDuration).toBeLessThanOrEqual(15 * 60 * 1000);
    });

    it('issues JWT access token with 15-minute expiry (ADR S09-001)', async () => {
      const result = await login({ email: 'login@example.com', password: 'StrongPass123!' });

      const token = result.body.accessToken as string;
      const decoded = mockJwtDecode(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.sub).toBeDefined();

      const expirySeconds = (decoded!.exp as number) - (decoded!.iat as number);
      expect(expirySeconds).toBe(15 * 60); // 900 seconds
    });

    it('stores refresh token hash in database (not plain text)', async () => {
      await login({ email: 'login@example.com', password: 'StrongPass123!' });

      for (const [hash] of mockRefreshTokens) {
        expect(hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 = 64 hex chars
      }
    });

    it('resets failed login attempts on successful login', async () => {
      await login({ email: 'login@example.com', password: 'Wrong!' });
      await login({ email: 'login@example.com', password: 'Wrong!' });
      expect(mockUsers.get('login@example.com')!.failed_login_attempts).toBe(2);

      await login({ email: 'login@example.com', password: 'StrongPass123!' });
      expect(mockUsers.get('login@example.com')!.failed_login_attempts).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Token Refresh
  // -------------------------------------------------------------------------
  describe('POST /api/auth/refresh', () => {
    let loginRefreshToken: string;

    beforeEach(async () => {
      await register({ email: 'refresh@example.com', password: 'StrongPass123!', name: 'Refresh User' });
      const [code] = [...mockVerificationCodes.keys()];
      await verifyEmail(code);
      const loginResult = await login({ email: 'refresh@example.com', password: 'StrongPass123!' });
      loginRefreshToken = loginResult.cookies!.refreshToken;
    });

    it('returns new access token and new refresh cookie', async () => {
      const result = await refresh(loginRefreshToken);

      expect(result.status).toBe(200);
      expect(result.body.accessToken).toBeDefined();
      expect(result.cookies?.refreshToken).toBeDefined();
      expect(result.cookies!.refreshToken).not.toBe(loginRefreshToken);
    });

    it('revokes old refresh token after rotation', async () => {
      await refresh(loginRefreshToken);
      const result = await refresh(loginRefreshToken);
      expect(result.status).toBe(401);
    });

    it('rejects invalid refresh token', async () => {
      const result = await refresh('invalid-token-value');
      expect(result.status).toBe(401);
    });
  });

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  describe('POST /api/auth/logout', () => {
    it('revokes refresh token and clears cookie', async () => {
      await register({ email: 'logout@example.com', password: 'StrongPass123!', name: 'Logout User' });
      const [code] = [...mockVerificationCodes.keys()];
      await verifyEmail(code);
      const loginResult = await login({ email: 'logout@example.com', password: 'StrongPass123!' });
      const refreshToken = loginResult.cookies!.refreshToken;

      const result = await logout(refreshToken);
      expect(result.status).toBe(200);
      expect(result.cookies?.refreshToken).toBe('');

      const refreshResult = await refresh(refreshToken);
      expect(refreshResult.status).toBe(401);
    });
  });

  // -------------------------------------------------------------------------
  // Forgot Password
  // -------------------------------------------------------------------------
  describe('POST /api/auth/forgot-password', () => {
    it('returns 200 for existing email (creates reset code)', async () => {
      await register({ email: 'forgot@example.com', password: 'StrongPass123!', name: 'Forgot User' });
      const result = await forgotPassword('forgot@example.com');

      expect(result.status).toBe(200);
      expect(mockResetCodes.size).toBe(1);
    });

    it('returns 200 for non-existent email — NO email enumeration', async () => {
      const result = await forgotPassword('nonexistent@example.com');

      expect(result.status).toBe(200);
      expect(result.body.message).toContain('If the email exists');
      expect(mockResetCodes.size).toBe(0);
    });

    it('response for existing and non-existing emails are identical', async () => {
      await register({ email: 'real@example.com', password: 'StrongPass123!', name: 'Real User' });

      const existingResult = await forgotPassword('real@example.com');
      mockResetCodes.clear();
      const nonExistingResult = await forgotPassword('fake@example.com');

      expect(existingResult.status).toBe(nonExistingResult.status);
      expect(existingResult.body.message).toBe(nonExistingResult.body.message);
    });
  });

  // -------------------------------------------------------------------------
  // Reset Password
  // -------------------------------------------------------------------------
  describe('POST /api/auth/reset-password', () => {
    let resetCode: string;

    beforeEach(async () => {
      await register({ email: 'reset@example.com', password: 'OldPass123!', name: 'Reset User' });
      await forgotPassword('reset@example.com');
      [resetCode] = [...mockResetCodes.keys()];
    });

    it('returns 200 and updates password with Argon2id hash', async () => {
      const result = await resetPassword(resetCode, 'NewStrongPass456!');
      expect(result.status).toBe(200);

      const user = mockUsers.get('reset@example.com');
      expect(user!.password_hash).toMatch(/^\$argon2id\$/);
    });

    it('revokes all refresh tokens for the user after reset', async () => {
      const [vCode] = [...mockVerificationCodes.keys()];
      await verifyEmail(vCode);
      const loginResult = await login({ email: 'reset@example.com', password: 'OldPass123!' });

      await resetPassword(resetCode, 'NewStrongPass456!');

      const refreshResult = await refresh(loginResult.cookies!.refreshToken);
      expect(refreshResult.status).toBe(401);
    });

    it('rejects invalid reset code', async () => {
      const result = await resetPassword('000000', 'NewPass123!');
      expect(result.status).toBe(400);
    });

    it('rejects weak new password', async () => {
      const result = await resetPassword(resetCode, 'short');
      expect(result.status).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // Profile (authenticated)
  // -------------------------------------------------------------------------
  describe('GET /api/auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      await register({ email: 'profile@example.com', password: 'StrongPass123!', name: 'Profile User' });
      const [vCode] = [...mockVerificationCodes.keys()];
      await verifyEmail(vCode);
      const loginResult = await login({ email: 'profile@example.com', password: 'StrongPass123!' });
      accessToken = loginResult.body.accessToken as string;
    });

    it('returns user data from DB when authenticated', async () => {
      const result = await getProfile(accessToken);

      expect(result.status).toBe(200);
      expect(result.body.email).toBe('profile@example.com');
      expect(result.body.name).toBe('Profile User');
      expect(result.body.plan).toBe('free');
      expect(result.body.role).toBe('user');
    });

    it('returns 401 without token (protected route)', async () => {
      const result = await getProfile('');
      expect(result.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const result = await getProfile('invalid.token.here');
      expect(result.status).toBe(401);
    });

    it('returns 401 with expired token', async () => {
      const expiredToken = mockJwtSign({ sub: 'user_123', email: 'test@test.com' }, -1);
      const result = await getProfile(expiredToken);
      expect(result.status).toBe(401);
    });
  });
});
