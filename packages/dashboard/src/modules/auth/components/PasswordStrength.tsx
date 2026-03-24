/**
 * PasswordStrength — visual password strength indicator
 *
 * Rules: 8-128 chars, mixed case, number, special char.
 * Shows progress bar with color coding.
 */

interface PasswordStrengthProps {
  password: string;
}

interface StrengthCheck {
  label: string;
  met: boolean;
}

function getChecks(password: string): StrengthCheck[] {
  return [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getStrengthLevel(checks: StrengthCheck[]): { score: number; label: string; color: string } {
  const metCount = checks.filter((c) => c.met).length;

  if (metCount <= 1) return { score: 1, label: 'Weak', color: 'bg-v-p0' };
  if (metCount <= 2) return { score: 2, label: 'Fair', color: 'bg-v-p1' };
  if (metCount <= 3) return { score: 3, label: 'Good', color: 'bg-v-p2' };
  if (metCount <= 4) return { score: 4, label: 'Strong', color: 'bg-v-accent-500' };
  return { score: 5, label: 'Excellent', color: 'bg-v-p3' };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const checks = getChecks(password);
  const strength = getStrengthLevel(checks);

  return (
    <div className="space-y-2 mt-2">
      {/* Progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              level <= strength.score ? strength.color : 'bg-v-bg-elevated'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-v-text-tertiary">Password strength</span>
        <span className="text-xs text-v-text-secondary">{strength.label}</span>
      </div>

      {/* Checklist */}
      <ul className="space-y-0.5">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 text-xs ${
              check.met ? 'text-v-p3' : 'text-v-text-ghost'
            }`}
          >
            {check.met ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
