/**
 * RegisterPage — name + email + password registration
 *
 * D02: Register form with password strength indicator, error handling.
 * On success, redirects to verify email page.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthCard } from '../components/AuthCard';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { PasswordStrength } from '../components/PasswordStrength';
import { ApiError } from '../../../shared/api/client';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Invalid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (password.length > 128) errors.password = 'Password must be 128 characters or fewer';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      // Redirect to verify email page with the email
      navigate('/auth/verify', { state: { email: email.trim() } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          // Map field-level validation errors
          const mapped: Record<string, string> = {};
          for (const d of err.details) {
            mapped[d.field] = d.message;
          }
          setFieldErrors(mapped);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start finding bugs before your users do"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-v-accent-400 hover:text-v-accent-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert type="error">{error}</Alert>}

        <FormInput
          label="Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoFocus
          required
          disabled={loading}
          error={fieldErrors.name}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={loading}
          error={fieldErrors.email}
        />

        <div>
          <FormInput
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
            error={fieldErrors.password}
          />
          <PasswordStrength password={password} />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Create Account
        </Button>
      </form>
    </AuthCard>
  );
}
