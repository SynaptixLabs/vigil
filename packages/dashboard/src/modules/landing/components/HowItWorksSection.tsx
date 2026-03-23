import { HOW_IT_WORKS_STEPS } from '../data/content';

// ── Step icons ──────────────────────────────────────────────────────────────
function StepIcon({ step }: { step: number }) {
  switch (step) {
    case 1:
      // Record — circle/dot icon
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" fill="#22d3ee" stroke="none" />
        </svg>
      );
    case 2:
      // Capture — camera/bug icon
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.95L13.75 4.22a2 2 0 00-3.5 0L3.32 16.05A2 2 0 005.07 19z" />
        </svg>
      );
    case 3:
      // Resolve — check/auto-fix icon
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="font-ui font-bold text-3xl sm:text-4xl text-v-text-primary mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            How It Works
          </h2>
          <p className="text-v-text-secondary text-lg max-w-xl mx-auto">
            From recording to resolution in three steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div key={item.step} className="relative text-center">
              {/* Step number circle */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-v-accent-glow border-2 border-v-accent-500 flex items-center justify-center text-v-accent-400">
                    <StepIcon step={item.step} />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-v-accent-500 text-black text-xs font-bold rounded-full flex items-center justify-center font-mono">
                    {item.step}
                  </span>
                </div>
              </div>

              {/* Connector line (desktop only, between steps) */}
              {item.step < 3 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-v-border-subtle" aria-hidden="true" />
              )}

              {/* Title */}
              <h3 className="font-ui font-semibold text-xl text-v-text-primary mb-3">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-v-text-secondary text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
