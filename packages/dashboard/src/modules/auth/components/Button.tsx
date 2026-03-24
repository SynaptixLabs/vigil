/**
 * Button — styled button for auth forms
 *
 * UI Kit: Primary (cyan bg, black text), Secondary (outlined), Ghost (text only).
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES = {
  primary: 'bg-v-accent-500 text-black font-medium hover:bg-v-accent-400 hover:shadow-v-glow disabled:bg-v-accent-700 disabled:text-v-text-ghost',
  secondary: 'bg-transparent text-v-text-primary border border-v-border-default hover:border-v-border-strong hover:bg-v-bg-hover disabled:opacity-50',
  ghost: 'bg-transparent text-v-text-secondary hover:text-v-text-primary hover:bg-v-bg-hover disabled:opacity-50',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs rounded-v-md',
  md: 'px-4 py-2.5 text-sm rounded-v-md',
  lg: 'px-6 py-3 text-base rounded-v-md',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-v-accent-glow focus:ring-offset-0
        disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
