---
status: approved
created: "2026-04-30"
quick_id: "260430-4cy"
slug: "redesign-app-shell-and-client-detail-ux-"
---

# UI-SPEC: Premium Arabic Operations Dashboard

## Product Intent

Rakhtety is not a generic dashboard. It is an operations room for engineering office staff who track permits, client documents, money, and blocked workflow steps.

The UI must make the next action obvious and make the file status feel controlled, not scattered.

## Visual Direction

- Tone: premium government-office operations desk.
- Feel: calm, serious, high-trust, paperwork-aware.
- Avoid: flat white cards everywhere, weak hierarchy, repeated helper boxes, generic teal-only styling.
- Signature: deep ink sidebar, warm document-paper surfaces, amber action highlights, large client status hero.

## Layout Contract

- App shell uses a dark fixed RTL sidebar on desktop.
- Main area uses a soft radial background and wide page container.
- Client detail starts with a hero section:
  - client identity
  - primary actions
  - workflow status pills
  - key location/file metadata
- Guidance cards must be compact and scannable, not long walls of text.
- Intake documents are a gallery grid with action buttons.
- Workflow steps stay below the document overview, because employees first need to know what is already in the file.

## Typography

- Keep Arabic readability as priority.
- Use Cairo as body font because it is already loaded and Arabic-safe.
- Use bolder section labels and larger hero title to create hierarchy.

## Color Tokens

- Background: warm paper gray.
- Sidebar: deep ink/green-black.
- Primary: controlled teal.
- Accent: amber/gold for operational actions and document affordances.
- Success/error/warning remain semantic.

## Interaction Contract

- Cards lift subtly on hover.
- Focus states remain visible.
- Preview/download document actions must be clearly visible.
- Mobile keeps bottom navigation but gains stronger visual contrast.

## First Implementation Slice

- Redesign global tokens/background.
- Redesign app shell/sidebar.
- Redesign client detail top summary and guide/document sections.
- Preserve existing API behavior and workflow logic.

## Verification

- Browser-use on active client page.
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
