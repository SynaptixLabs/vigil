import { PRICING_TIERS, TOKEN_PACKS } from '../data/pricing';

// ── Checkmark icon ──────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-v-p3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="font-ui font-bold text-3xl sm:text-4xl text-v-text-primary mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-v-text-secondary text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. Pay only for what you use.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col bg-v-bg-raised rounded-v-xl p-6 border ${
                tier.featured
                  ? 'border-v-accent-500 shadow-v-glow'
                  : 'border-v-border-subtle'
              }`}
            >
              {/* Popular badge */}
              {tier.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-v-accent-500 text-black text-[0.65rem] font-bold px-3 py-0.5 rounded-full tracking-wider uppercase">
                  {tier.badge}
                </span>
              )}

              {/* Tier name */}
              <p className="text-xs font-semibold text-v-accent-400 uppercase tracking-wider mb-2">
                {tier.name}
              </p>

              {/* Price */}
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-v-text-primary tracking-tight">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-base font-normal text-v-text-tertiary ml-1">
                    {tier.period}
                  </span>
                )}
              </div>

              {/* SXC/month */}
              <p className="font-mono text-xs text-v-text-secondary mb-5">
                {tier.sxcPerMonth}
              </p>

              {/* Features list */}
              <ul className="flex-1 space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-v-text-secondary">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <a
                href={tier.ctaLink}
                className={`block text-center py-2.5 rounded-v-md text-sm font-semibold transition-all duration-150 ${
                  tier.featured
                    ? 'bg-v-accent-500 text-black hover:bg-v-accent-400 hover:shadow-v-glow'
                    : 'border border-v-border-default text-v-text-primary hover:bg-v-bg-hover hover:border-v-border-strong'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Token packs */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3
              className="font-ui font-semibold text-2xl text-v-text-primary mb-3"
              style={{ letterSpacing: '-0.01em' }}
            >
              Need more tokens?
            </h3>
            <p className="text-v-text-secondary text-sm">
              Purchase SXC token packs anytime. Purchased tokens never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TOKEN_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="bg-v-bg-raised border border-v-border-subtle rounded-v-xl p-5 text-center hover:border-v-border-default transition-colors duration-200"
              >
                <p className="font-ui font-semibold text-lg text-v-text-primary mb-1">
                  {pack.name}
                </p>
                <p className="font-mono text-sm text-v-accent-400 font-medium mb-3">
                  {pack.sxc}
                </p>
                <p className="text-2xl font-bold text-v-text-primary mb-1">
                  {pack.price}
                </p>
                <p className="text-xs text-v-text-tertiary mb-4">
                  {pack.priceUsd}
                </p>
                <a
                  href={pack.ctaLink}
                  className="block text-center py-2 rounded-v-md text-sm font-medium border border-v-border-default text-v-text-primary hover:bg-v-bg-hover hover:border-v-border-strong transition-all duration-150"
                >
                  Buy {pack.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
