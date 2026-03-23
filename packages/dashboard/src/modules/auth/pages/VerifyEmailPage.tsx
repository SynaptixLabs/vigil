/**
 * VerifyEmailPage — 6-digit code input for email verification
 *
 * D02: Code input with resend button, auto-redirect on success.
 * Receives email from location state (from register/login redirect).
 */

import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { verifyEmailApi, resendVerificationApi } from '../auth.api';
import { ApiError } from '../../../shared/api/client';

const CODE_LENGTH = 6;

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    // Allow only single digit
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && newDigits.every((d) => d !== '')) {
      submitCode(newDigits.join(''));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move back on backspace when current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    // Focus last filled or next empty
    const nextIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if complete
    if (newDigits.every((d) => d !== '')) {
      submitCode(newDigits.join(''));
    }
  }

  async function submitCode(code: string) {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verifyEmailApi({ code });
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => {
        navigate('/auth/login', { state: { verified: true } });
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
      // Clear digits on error
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) return;
    setResendLoading(true);
    setError('');

    try {
      await resendVerificationApi({ email });
      setSuccess('A new verification code has been sent to your email.');
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length === CODE_LENGTH) {
      submitCode(code);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}`
          : 'Enter the 6-digit code sent to your email'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* 6-digit code input */}
        <div className="flex justify-center gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={loading}
              aria-label={`Digit ${index + 1}`}
              className={`
                w-11 h-13 text-center text-lg font-mono font-semibold
                bg-v-bg-void text-v-text-primary
                border rounded-v-md
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-v-accent-glow focus:border-v-accent-500
                disabled:opacity-50
                ${error ? 'border-v-p0' : 'border-v-border-default'}
              `}
            />
          ))}
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={digits.some((d) => !d)}
          className="w-full"
        >
          Verify Email
        </Button>

        {/* Resend */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0 || !email}
            className="text-xs text-v-text-tertiary hover:text-v-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : resendLoading
                ? 'Sending...'
                : "Didn't receive a code? Resend"
            }
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
