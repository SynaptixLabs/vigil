/**
 * SettingsPage — profile + billing
 *
 * D05: Profile section (name, email read-only) + billing section
 * (plan card, SXC balance placeholder, manage subscription button).
 */

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Alert } from '../components/Alert';
import { getProfileApi, changePasswordApi } from '../auth.api';
import { apiClient, ApiError } from '../../../shared/api/client';
import type { ProfileResponse } from '../auth.types';

// ── Plan card colors ─────────────────────────────────────────────────────────
const PLAN_STYLES: Record<string, { badge: string; border: string }> = {
  free: { badge: 'bg-v-bg-elevated text-v-text-secondary', border: 'border-v-border-subtle' },
  pro: { badge: 'bg-v-accent-400/15 text-v-accent-400', border: 'border-v-accent-500/30' },
  team: { badge: 'bg-purple-500/15 text-purple-400', border: 'border-purple-500/30' },
  enterprise: { badge: 'bg-amber-500/15 text-amber-400', border: 'border-amber-500/30' },
};

interface BillingBalance {
  planTokens: number;
  purchasedTokens: number;
  totalTokens: number;
  renewalDate?: string;
}

export function SettingsPage() {
  const { user } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Billing state
  const [balance, setBalance] = useState<BillingBalance | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    setProfileLoading(true);
    getProfileApi()
      .then(setProfile)
      .catch((err) => {
        setProfileError(err instanceof ApiError ? err.message : 'Failed to load profile');
      })
      .finally(() => setProfileLoading(false));
  }, []);

  // ── Load billing balance ───────────────────────────────────────────────────
  useEffect(() => {
    setBillingLoading(true);
    apiClient<BillingBalance>('/api/billing/balance')
      .then(setBalance)
      .catch(() => {
        // Billing API may not be ready yet — show placeholders
        setBalance(null);
      })
      .finally(() => setBillingLoading(false));
  }, []);

  // ── Change password handler ────────────────────────────────────────────────
  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword) { setPasswordError('Current password is required'); return; }
    if (!newPassword) { setPasswordError('New password is required'); return; }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }

    setPasswordLoading(true);
    try {
      const result = await changePasswordApi({ oldPassword, newPassword });
      setPasswordSuccess(result.message);
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  // ── Manage subscription ────────────────────────────────────────────────────
  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const result = await apiClient<{ url: string }>('/api/subscription/portal', {
        method: 'POST',
      });
      window.open(result.url, '_blank');
    } catch {
      // Portal not available yet
    } finally {
      setPortalLoading(false);
    }
  }

  const plan = profile?.plan || user?.plan || 'free';
  const planStyle = PLAN_STYLES[plan] || PLAN_STYLES.free;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-v-text-primary tracking-tight mb-8">
        Settings
      </h1>

      {/* ── Profile Section ──────────────────────────────────────────────────── */}
      <section className="bg-v-bg-raised border border-v-border-subtle rounded-v-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-v-text-primary mb-4">Profile</h2>

        {profileLoading ? (
          <div className="space-y-3">
            <div className="h-10 bg-v-bg-elevated rounded-v-md animate-pulse" />
            <div className="h-10 bg-v-bg-elevated rounded-v-md animate-pulse" />
          </div>
        ) : profileError ? (
          <Alert type="error">{profileError}</Alert>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-v-text-secondary mb-1">Name</label>
                <div className="px-3 py-2.5 text-sm bg-v-bg-void text-v-text-primary border border-v-border-default rounded-v-md">
                  {profile?.name || user?.name || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-v-text-secondary mb-1">Email</label>
                <div className="px-3 py-2.5 text-sm bg-v-bg-void text-v-text-primary border border-v-border-default rounded-v-md">
                  {profile?.email || user?.email || '—'}
                </div>
              </div>
            </div>

            {/* Change password */}
            {passwordSuccess && <Alert type="success">{passwordSuccess}</Alert>}

            {!showPasswordForm ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </Button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-v-border-subtle">
                <h3 className="text-sm font-medium text-v-text-primary">Change Password</h3>
                {passwordError && <Alert type="error">{passwordError}</Alert>}

                <FormInput
                  label="Current Password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={passwordLoading}
                />
                <FormInput
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={passwordLoading}
                  hint="Minimum 8 characters"
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={passwordLoading}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={passwordLoading}>
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordError('');
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* ── Billing Section ──────────────────────────────────────────────────── */}
      <section className="bg-v-bg-raised border border-v-border-subtle rounded-v-xl p-6">
        <h2 className="text-lg font-semibold text-v-text-primary mb-4">Billing</h2>

        {/* Plan card */}
        <div className={`border rounded-v-lg p-4 mb-4 ${planStyle.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-v-text-primary">Current Plan</h3>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${planStyle.badge}`}>
              {plan}
            </span>
          </div>
          {billingLoading ? (
            <div className="h-4 bg-v-bg-elevated rounded animate-pulse w-40" />
          ) : balance ? (
            <p className="text-xs text-v-text-tertiary">
              Renews {balance.renewalDate || 'N/A'}
            </p>
          ) : (
            <p className="text-xs text-v-text-tertiary">
              Free tier — no billing configured
            </p>
          )}
        </div>

        {/* SXC Balance */}
        <div className="border border-v-border-subtle rounded-v-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-v-text-primary mb-3">SXC Token Balance</h3>
          {billingLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-v-bg-elevated rounded animate-pulse w-24" />
              <div className="h-2 bg-v-bg-elevated rounded-full animate-pulse" />
            </div>
          ) : balance ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-v-accent-400 font-mono">
                  {balance.totalTokens.toLocaleString()}
                </span>
                <span className="text-xs text-v-text-tertiary">SXC tokens</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-v-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-v-accent-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (balance.totalTokens / Math.max(1, balance.planTokens + balance.purchasedTokens)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-v-text-tertiary">
                <span>Plan: {balance.planTokens.toLocaleString()} SXC</span>
                <span>Purchased: {balance.purchasedTokens.toLocaleString()} SXC</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-v-text-tertiary">Balance information unavailable</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManageSubscription}
            loading={portalLoading}
          >
            Manage Subscription
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('/pricing', '_blank')}
          >
            View Plans & Token Packs
          </Button>
        </div>
      </section>
    </div>
  );
}
