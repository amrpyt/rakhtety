## Context

Rakhtety is a Next.js/React Arabic RTL frontend that now has a Frappe custom app backend scaffold under `frappe_apps/`. The user wants the same current system, but with a frontend that feels like ERPNext/Frappe Desk.

Current Frappe research:

- Frappe Desk is the admin interface for System Users and is built around Workspace, Awesomebar, List View, Form View, Grid View, Report Builder, Tree, Calendar, Gantt, Kanban, and Desk Theme: https://docs.frappe.io/framework/v15/user/en/desk
- Desk uses a persistent sidebar where each item links to a Workspace, and Awesomebar is the top navigation/search/create affordance: https://docs.frappe.io/framework/v15/user/en/desk
- List View supports filters, sorting, paging, tags, and view switching; Form View has a sidebar, attachments, tags, assignment/share affordances, and timeline: https://docs.frappe.io/framework/v15/user/en/desk
- Frappe UI is an official frontend toolkit but its starter path creates a Vue frontend inside a Frappe app, while this repo is Next.js/React: https://ui.frappe.io/docs/getting-started
- Frappe REST automatically exposes DocType list/read/create/update/delete endpoints and supports filters, fields, sorting, and paging for resource screens: https://docs.frappe.io/framework/user/en/api/rest

## Goals / Non-Goals

**Goals:**

- Make the current Next.js frontend look and work closer to ERPNext/Frappe Desk.
- Keep the existing Arabic RTL app routes and workflow behavior.
- Give every dashboard route a consistent Desk-like shell: module sidebar, top bar, search/action area, compact cards, dense lists, and document-style content.
- Keep UI primitives boring and reusable: no decorative dashboard hero, no one-off gradients, no hidden backend change.
- Keep the shell hydration-safe for auth-dependent navigation.

**Non-Goals:**

- Do not replace Next.js with Frappe's Vue frontend stack in this change.
- Do not change Frappe DocTypes, backend API routes, auth implementation, or deployment setup.
- Do not rebuild every page field-by-field in one risky pass.
- Do not copy Frappe/ERPNext source code or trademarked assets; match interaction pattern and visual density.

## Decisions

1. Keep Next.js/React and build a local Desk-inspired shell.

   Rationale: Frappe UI's official getting-started path targets Vue inside a Frappe app. Replatforming this app from React to Vue would be a second migration while the backend migration is still active. The safer path is to mirror Desk patterns in current React components.

   Alternative considered: use Frappe UI directly. Rejected for this edit round because it would add a Vue stack beside React and increase migration risk.

2. Add shared shell components instead of restyling each page independently.

   Rationale: ERPNext Desk feels consistent because every module lives inside the same chrome. A shared shell lets dashboard, clients, workflows, employees, and finance inherit the same navigation and header behavior.

   Alternative considered: edit each page manually. Rejected because it creates drift and makes later Frappe backend wiring harder to reason about.

3. Use a restrained light desk palette.

   Rationale: Frappe Desk is a utilitarian work surface, not a marketing dashboard. Use light background, thin borders, compact spacing, subtle shadows, and blue/gray action colors.

   Alternative considered: keep the current green/gold operations theme. Rejected because it does not look like ERPNext/Frappe Desk and is more decorative.

4. Treat Frappe concepts as UI contracts.

   Rationale: Current screens map naturally to Frappe concepts:
   - Dashboard -> Workspace
   - Clients, Workflows, Employees -> List View
   - Client detail -> Form View with sidebar/timeline/document panels
   - Finance -> Report-like workspace

   Alternative considered: expose raw ERPNext module names directly. Rejected because the office domain still needs Arabic Rakhtety terms.

## Risks / Trade-offs

- Visual similarity risk -> Mitigation: match Desk layout principles and density without copying source code or assets.
- Scope risk -> Mitigation: first round changes the shared shell and core primitives; deeper page-by-page form/list polishing stays task-scoped.
- Hydration risk -> Mitigation: keep the sidebar auth filtering behavior intact and only change markup/styles around it.
- RTL risk -> Mitigation: keep `dir="rtl"` on `<html>` and use logical spacing/borders where practical.
- Backend confusion risk -> Mitigation: this change does not alter Frappe/Supabase data behavior; separate backend changes remain in the existing Frappe deployment/data OpenSpec changes.
