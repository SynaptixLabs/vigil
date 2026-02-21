# SynaptixLabs Refine — UI Kit

> Minimal design tokens for Refine extension UI.

## Colors

| Token | Value | Use |
|-------|-------|-----|
| `--refine-primary` | `#3B82F6` (blue-500) | Primary actions, active states |
| `--refine-danger` | `#EF4444` (red-500) | Recording indicator, bugs |
| `--refine-warning` | `#F59E0B` (amber-500) | Paused state |
| `--refine-success` | `#10B981` (green-500) | Completed, features |
| `--refine-bg` | `#1F2937` (gray-800) | Overlay backgrounds |
| `--refine-text` | `#F9FAFB` (gray-50) | Overlay text |

## Typography

- Font: `Inter, system-ui, sans-serif`
- Control bar: 12px
- Bug editor: 14px
- Popup: 14px base

## Z-Index (Content Script)

| Element | Z-Index |
|---------|---------|
| Control bar | `2147483647` (max) |
| Bug editor overlay | `2147483646` |
| Shadow DOM host | `2147483640` |

## Control Bar

- Position: fixed bottom-center
- Height: 40px
- Border radius: 20px
- Background: `--refine-bg` with 95% opacity
- Recording: pulsing red dot indicator

## Accessibility

- All buttons keyboard-navigable
- Screen reader labels on all controls
- High contrast mode: white borders on dark background
