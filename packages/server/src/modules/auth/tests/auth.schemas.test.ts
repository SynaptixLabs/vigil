// @vitest-environment node
/**
 * Unit tests for auth Zod schemas.
 * Tests input validation for all auth endpoints (B03-B08).
 */
import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../auth.schemas.js';

describe('registerSchema', () => {
  it('validates a correct registration input', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.name).toBe('Test User');
    }
  });

  it('lowercases email', () => {
    const result = registerSchema.safeParse({
      email: 'Test@Example.COM',
      password: 'Password123!',
      name: 'Test',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('trims name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123!',
      name: '  Test User  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Test User');
    }
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
      name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
      name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password longer than 128 chars', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(129),
      name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('accepts password of exactly 8 chars', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
      name: 'Test',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123!',
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(registerSchema.safeParse({}).success).toBe(false);
    expect(registerSchema.safeParse({ email: 'test@test.com' }).success).toBe(false);
    expect(registerSchema.safeParse({ password: 'Password123!' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('validates correct login input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
  });

  it('lowercases email', () => {
    const result = loginSchema.safeParse({
      email: 'USER@EXAMPLE.COM',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'bad',
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('verifyEmailSchema', () => {
  it('validates a 6-digit code', () => {
    const result = verifyEmailSchema.safeParse({ code: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric code', () => {
    const result = verifyEmailSchema.safeParse({ code: 'abcdef' });
    expect(result.success).toBe(false);
  });

  it('rejects code shorter than 6 digits', () => {
    const result = verifyEmailSchema.safeParse({ code: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects code longer than 6 digits', () => {
    const result = verifyEmailSchema.safeParse({ code: '1234567' });
    expect(result.success).toBe(false);
  });

  it('rejects missing code', () => {
    const result = verifyEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('resendVerificationSchema', () => {
  it('validates correct email', () => {
    const result = resendVerificationSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('lowercases email', () => {
    const result = resendVerificationSchema.safeParse({ email: 'TEST@EXAMPLE.COM' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('rejects invalid email', () => {
    const result = resendVerificationSchema.safeParse({ email: 'not-email' });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// B07 — Forgot/Reset Password Schemas
// ============================================================================

describe('forgotPasswordSchema (B07)', () => {
  it('validates correct email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('lowercases email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'USER@EXAMPLE.COM' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
  });
});

describe('resetPasswordSchema (B07)', () => {
  it('validates correct code + newPassword', () => {
    const result = resetPasswordSchema.safeParse({
      code: '123456',
      newPassword: 'NewSecure1!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid code format', () => {
    expect(resetPasswordSchema.safeParse({
      code: 'abc',
      newPassword: 'NewSecure1!',
    }).success).toBe(false);
  });

  it('rejects short newPassword', () => {
    expect(resetPasswordSchema.safeParse({
      code: '123456',
      newPassword: 'short',
    }).success).toBe(false);
  });

  it('rejects long newPassword', () => {
    expect(resetPasswordSchema.safeParse({
      code: '123456',
      newPassword: 'a'.repeat(129),
    }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(resetPasswordSchema.safeParse({}).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ code: '123456' }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ newPassword: 'Pass1234!' }).success).toBe(false);
  });
});

// ============================================================================
// B08 — Change Password + Update Profile Schemas
// ============================================================================

describe('changePasswordSchema (B08)', () => {
  it('validates correct oldPassword + newPassword', () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: 'OldPass123!',
      newPassword: 'NewPass456!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short oldPassword', () => {
    expect(changePasswordSchema.safeParse({
      oldPassword: 'short',
      newPassword: 'NewPass456!',
    }).success).toBe(false);
  });

  it('rejects short newPassword', () => {
    expect(changePasswordSchema.safeParse({
      oldPassword: 'OldPass123!',
      newPassword: 'short',
    }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(changePasswordSchema.safeParse({}).success).toBe(false);
    expect(changePasswordSchema.safeParse({ oldPassword: 'OldPass123!' }).success).toBe(false);
  });
});

describe('updateProfileSchema (B08)', () => {
  it('validates name only', () => {
    const result = updateProfileSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('New Name');
    }
  });

  it('validates image only', () => {
    const result = updateProfileSchema.safeParse({ image: 'https://example.com/avatar.png' });
    expect(result.success).toBe(true);
  });

  it('validates both name and image', () => {
    const result = updateProfileSchema.safeParse({
      name: 'Test',
      image: 'https://example.com/avatar.png',
    });
    expect(result.success).toBe(true);
  });

  it('allows empty object (no updates)', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('trims name', () => {
    const result = updateProfileSchema.safeParse({ name: '  Trimmed  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Trimmed');
    }
  });

  it('rejects name over 100 chars', () => {
    expect(updateProfileSchema.safeParse({ name: 'A'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid image URL', () => {
    expect(updateProfileSchema.safeParse({ image: 'not-a-url' }).success).toBe(false);
  });

  it('rejects image URL over 2048 chars', () => {
    expect(updateProfileSchema.safeParse({
      image: 'https://example.com/' + 'a'.repeat(2040),
    }).success).toBe(false);
  });

  it('allows null image (to clear avatar)', () => {
    const result = updateProfileSchema.safeParse({ image: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBeNull();
    }
  });
});
