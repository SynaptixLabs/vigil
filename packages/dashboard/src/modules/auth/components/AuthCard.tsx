/**
 * AuthCard — shared layout for auth pages
 *
 * Centered card with logo, title, subtitle, form content, and footer link.
 * UI Kit: auth form pattern, dark theme, max-width 400px.
 */

import type { ReactNode } from 'react';
import { VigilLogo } from '../../landing/components/VigilLogo';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-v-bg-base flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <a href="/" aria-label="Vigil home">
            <VigilLogo variant="full" height={36} />
          </a>
        </div>

        {/* Card */}
        <div className="bg-v-bg-raised border border-v-border-subtle rounded-v-xl p-6 shadow-v-md">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-v-text-primary tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-v-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content */}
          {children}
        </div>

        {/* Footer link */}
        {footer && (
          <div className="mt-4 text-center text-sm text-v-text-secondary">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
