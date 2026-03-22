# TODO — Dashboard Session Detail Layout Redesign

> Sprint 08 | Assigned: [DEV:dashboard] | Priority: P1 (Founder FAT feedback)
> Created: 2026-03-22 by [CPTO]

---

## Context

Founder feedback from FAT on 2026-03-22: the session detail view needs a layout overhaul.
Current layout is a single-column scroll. Needs to become a two-panel + tabbed view.

## Requirements

### 1. Two-Panel Layout (Timeline + Canvas)
- **Left panel**: Session timeline (events list — actions, bugs, features, screenshots)
- **Right panel**: Canvas/viewer area — shows the content of the selected event
- No vertical scrolling for the main layout — both panels fill viewport height
- Timeline panel should be scrollable internally

### 2. Click Event → Rich Canvas Preview
- Clicking a **bug** in timeline opens its data in the canvas (title, description, priority, screenshot if attached)
- Clicking a **feature** in timeline opens its data in the canvas (same rich format)
- Clicking a **screenshot** in timeline shows the image in the canvas
- Clicking a **recording segment** in timeline shows the rrweb replay player in the canvas
- Default canvas state: show the recording player (or first event)

### 3. Click to Popup (Image / Video)
- Clicking on an image in the canvas opens a lightbox/popup overlay (similar to current implementation)
- Clicking on the recording player in the canvas opens it in a larger popup/modal
- Popup should have close button and ESC to dismiss

### 4. Tab-Based Navigation (No Scroll)
- Replace the current scroll-down-to-see-more pattern with tabs
- Tabs at the top of the canvas area: **Recording** | **Bugs** | **Screenshots** | **Features** | **Annotations**
- Each tab shows a dedicated view (what currently is shown when scrolling down)
- Timeline click auto-switches to the relevant tab

## AC (Acceptance Criteria)
- [ ] Two-panel layout: timeline (left, ~30% width) + canvas (right, ~70% width)
- [ ] Clicking timeline event updates canvas with rich preview
- [ ] Bug/feature data shown in formatted card (not raw JSON)
- [ ] Images and video have popup/lightbox on click
- [ ] Tab navigation replaces vertical scrolling
- [ ] Timeline click auto-selects correct tab
- [ ] Responsive: works at min 1024px width
- [ ] No regressions on existing session data display

## Key Files
- `packages/dashboard/src/views/SessionDetail.tsx` — main session view
- `packages/dashboard/src/components/RecordingPlayer.tsx` — replay player
- `packages/dashboard/src/components/SessionTimeline.tsx` — timeline component

## Checkboxes
- [ ] Dev — implementation committed
- [ ] QA — tested against AC
- [ ] GBU — quality reviewed
