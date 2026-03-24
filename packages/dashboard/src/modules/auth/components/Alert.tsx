/**
 * Alert — error/success/info messages for auth forms
 *
 * UI Kit: 4 types with icon + message layout.
 */

import type { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

const ALERT_STYLES = {
  success: {
    bg: 'bg-v-p3/10 border-v-p3/30',
    text: 'text-v-p3',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-v-p0/10 border-v-p0/30',
    text: 'text-v-p0',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-v-p2/10 border-v-p2/30',
    text: 'text-v-p2',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-v-accent-400/10 border-v-accent-400/30',
    text: 'text-v-accent-400',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function Alert({ type, children, className = '' }: AlertProps) {
  const style = ALERT_STYLES[type];

  return (
    <div
      className={`flex items-start gap-2.5 px-3 py-2.5 text-sm border rounded-v-md ${style.bg} ${style.text} ${className}`}
      role="alert"
    >
      {style.icon}
      <span>{children}</span>
    </div>
  );
}
