/**
 * LoginPage — email + password login
 *
 * D02: Login form with error handling, loading states.
 * Links to forgot password and register.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthCard } from '../components/AuthCard';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { ApiError } from '../../../shared/api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect destination after login (from AuthGuard state)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403 && err.code === 'EMAIL_NOT_VERIFIED') {
          // Redirect to verify page with email
          navigate('/auth/verify', { state: { email: email.trim() } });
          return;
        }
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in to Vigil"
      subtitle="Enter your credentials to access the dashboard"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/register"
            className="text-v-accent-400 hover:text-v-accent-300 font-medium transition-colors"
          >
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert type="error">{error}</Alert>}

        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
          disabled={loading}
        />

        <div>
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-v-text-tertiary hover:text-v-accent-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>
    </AuthCard>
  );
}
