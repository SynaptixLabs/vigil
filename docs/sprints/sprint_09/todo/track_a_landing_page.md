# Track A — Landing Page

**Sprint:** 09 | **Owner:** UI/UX + `[DEV:dashboard]` | **Priority:** P0 | **Vibes:** ~8V
**Branch:** `sprint-09/landing-page`
**Team:** Dashboard Team

---

## Instructions — READ BEFORE STARTING

### Every team member MUST follow this protocol:

**When you finish your work on a task, you MUST:**

1. **Check your checkbox** in the TODO table below
2. **Create a report** in `docs/sprints/sprint_09/reports/` using the naming convention for your role
3. A task is **DONE only when all 3 checkboxes are checked and all 3 reports exist**

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_A_{task_id}_{YYYY-MM-DD}.md` — files changed, tests, risks |
| QA | `[x] QA` | `reports/QA_A_{task_id}_{YYYY-MM-DD}.md` — AC check PASS/FAIL, commands run |
| GBU | `[x] GBU` | `reports/DR_A_{task_id}_{YYYY-MM-DD}.md` — Good/Bad/Ugly, scorecard, verdict |

---

## Mission

Design and build a Vigil-branded public landing page that converts visitors into registered users. Unique visual identity — dark, developer-focused, bug-hunting aesthetic. NOT a Papyrus clone. Mobile-responsive (D041). Served from vigil-server at `/`.

**Refs:**
- `specs/SPRINT_09_SPEC_production_launch.md` §5
- **`docs/ui/UI_KIT.md`** — Design tokens, colors, typography, component specs (MUST READ before implementing)
- **`docs/ui/VIGIL_UI_KIT.html`** — Interactive HTML demo (open in browser for visual reference)
- `.claude/roles/aria_ux.md` — ARIA operating manual (for UX agent)

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| A01 | Design wireframes + brand identity | Wireframes for all sections (desktop + mobile). Color palette, typography, iconography defined. FOUNDER approval. | 2V | [ ] | [ ] | [ ] |
| A02 | Hero section + navigation | Nav with logo, links (Features, Pricing, Docs), Sign In / Sign Up CTA. Hero: headline, subhead, demo visual/GIF. Mobile hamburger menu. | 2V | [ ] | [ ] | [ ] |
| A03 | Features + How It Works sections | "How It Works" 3-step (Record → Capture → Resolve). Features grid (6 features with icons). Responsive. | 1.5V | [ ] | [ ] | [ ] |
| A04 | Pricing section | 4 tier cards (Free/Pro/Team/Enterprise). Token pack cards (Spark/Flow/Surge). Currency toggle if needed. Links to register. Mobile stacked layout. | 1.5V | [ ] | [ ] | [ ] |
| A05 | CTA + Footer + SEO | Final CTA ("Start free — no credit card"). Footer with SynaptixLabs branding, links, legal. Meta tags, OG images, basic SEO. | 1V | [ ] | [ ] | [ ] |

---

### A01 Details

**Task:** Create wireframes and brand identity for the Vigil landing page
**Files:** Design deliverables (Figma/images), `packages/dashboard/src/modules/landing/README.md`
**AC:**
- [ ] Desktop wireframes for all 7 sections (Nav, Hero, How It Works, Features, Pricing, CTA, Footer)
- [ ] Mobile wireframes for all 7 sections (stacked layout, hamburger nav)
- [ ] Color palette defined (dark theme, developer aesthetic)
- [ ] Typography selected (heading + body fonts)
- [ ] FOUNDER has approved the design direction

### A02 Details

**Task:** Implement hero section and fixed navigation
**Files:** `packages/dashboard/src/modules/landing/components/LandingNav.tsx`, `HeroSection.tsx`, `pages/LandingPage.tsx`
**AC:**
- [ ] Navigation fixed at top: Logo, Features, Pricing, Docs links + Sign In / Sign Up buttons
- [ ] Hero section: compelling headline, subtitle, demo visual (static image or GIF for V1)
- [ ] Mobile: hamburger menu, touch-friendly CTA buttons
- [ ] Route configured at `/` (public, no auth)
- [ ] All text content in a constants file (single source of truth for copy)

### A03 Details

**Task:** Implement Features and How It Works sections
**Files:** `packages/dashboard/src/modules/landing/components/FeaturesSection.tsx`, `HowItWorksSection.tsx`
**AC:**
- [ ] "How It Works" section: 3 steps with icons/visuals (Record → Capture → Resolve)
- [ ] Features grid: 6 feature cards (session recording, inline bugs, AI auto-complete, vigil_agent, MCP, dashboard)
- [ ] Responsive: 3-col desktop → 2-col tablet → 1-col mobile

### A04 Details

**Task:** Implement pricing section with tier cards and token packs
**Files:** `packages/dashboard/src/modules/landing/components/PricingSection.tsx`, `packages/dashboard/src/modules/landing/data/pricing.ts`
**AC:**
- [ ] 4 tier cards: Free (€0), Pro (€19/mo), Team (€49/mo), Enterprise (Custom)
- [ ] Each card shows: price, SXC/month, key features, CTA button
- [ ] Token pack section: Spark (€9/200 SXC), Flow (€29/1K SXC), Surge (€99/5K SXC)
- [ ] Pricing data in single file `pricing.ts` (source of truth, matches `paddle.config.ts`)
- [ ] CTA buttons link to `/auth/register` (or `/auth/register?plan=pro` with plan pre-selected)
- [ ] Mobile: cards stack vertically

### A05 Details

**Task:** Final CTA, footer, and SEO basics
**Files:** `packages/dashboard/src/modules/landing/components/CTASection.tsx`, `Footer.tsx`
**AC:**
- [ ] CTA section: "Start free — no credit card required" with prominent register button
- [ ] Footer: SynaptixLabs logo, product links, legal (Terms, Privacy), copyright
- [ ] HTML `<head>`: title, description, OG meta tags
- [ ] Lighthouse mobile score >= 80

---

## Dependency Map

```
A01 (design) ──→ A02 (hero + nav) ──→ A03 (features) ──→ A05 (CTA + footer)
                                  ──→ A04 (pricing)   ──→ A05
```

A01 blocks all implementation. A02-A04 can run in parallel after A01 approved.

---

## Regression Gate

```bash
npx tsc --noEmit
npx vitest run
npm run build
# Visual check: landing page loads at / without auth
# Mobile check: responsive at 375px, 768px, 1024px, 1440px
```

---

*Track A | Sprint 09 | Owner: UI/UX + [DEV:dashboard] | Dashboard Team*
