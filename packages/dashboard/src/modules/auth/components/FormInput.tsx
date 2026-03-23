/**
 * FormInput — styled input field for auth forms
 *
 * UI Kit tokens: void bg, default border, cyan focus ring.
 * Accessible: label, aria, error message, focus management.
 */

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-v-text-secondary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={`
            w-full px-3 py-2.5 text-sm
            bg-v-bg-void text-v-text-primary placeholder-v-text-ghost
            border rounded-v-md
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-v-p0 focus:ring-v-p0/30'
              : 'border-v-border-default focus:border-v-accent-500 focus:ring-v-accent-glow'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-v-p0 mt-1" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-v-text-tertiary mt-1">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';
