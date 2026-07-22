# Life Planner Assistant

A personal planning app that brings your calendar, tasks, notes, budget and a
local AI advisor into one place. Built with React, TypeScript, Tailwind CSS,
shadcn/ui and Supabase.

## Features

- **Calendar** — month and week views, click-to-create events.
- **Day Planner** — hour-by-hour time blocking for a single day.
- **Tasks** — priorities, due dates, project/category grouping, search and filters.
- **Notes** — a quick personal notes editor (stored locally on-device).
- **Expenses** — income/expense tracking, per-category budgets with progress
  bars, a spending chart, and CSV export of the current month's transactions.
- **Pomodoro** — configurable focus/break timer with session history.
- **AI Advisor** — chats with a locally-running [Ollama](https://ollama.com)
  model, using a live snapshot of your own events/tasks/expenses as context
  (scoped to Today, Tasks, Finance, or the Full Planner).
- **Auth & multi-user data** — Supabase email/password auth; every record is
  scoped to the signed-in user.

## Tech stack

- [Vite](https://vitejs.dev) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)
- [Recharts](https://recharts.org) for charts
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) for tests
- A local [Ollama](https://ollama.com) server for the AI Advisor (optional — the rest of the app works without it)

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:8080)
```

Sign up for an account on the login screen — Supabase auth handles the rest.
The Supabase project URL/anon key are already wired up in
`src/integrations/supabase/client.ts` (the anon key is safe to ship client-side —
it's the Row Level Security policies on each table, configured in the Supabase
dashboard and scoped to `auth.uid()`, that actually protect data). Every query
in `src/hooks/` also filters by the current user's id client-side, but that's
a UX convenience, not a substitute for RLS — double check RLS is enabled on
`planner_items` and `budgets` in the Supabase dashboard before shipping.

### AI Advisor (optional)

The AI Advisor talks to a local Ollama server, not a hosted API:

1. Install [Ollama](https://ollama.com) and pull a model, e.g. `ollama pull llama3`.
2. Make sure `ollama serve` is running (default `http://localhost:11434`).
3. In the app, go to **Settings → Ollama AI Advisor**, set the server URL, and
   click **Test Connection** — this also populates the **Model** dropdown with
   whatever models you have installed locally.

If Ollama isn't running, every other part of the app still works normally.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Testing

Unit and component tests live next to the code they cover (`*.test.ts(x)`),
using Vitest + React Testing Library + jsdom. Run `npm test` before pushing —
CI-equivalent checks are `npm run lint`, `npx tsc --noEmit`, `npm test`, and
`npm run build`.

## Deployment

The app is a static Vite build, deployed to [Vercel](https://vercel.com).
`vercel.json` rewrites all routes to `index.html` so client-side routing
(React Router) works on refresh/deep links. No environment variables are
required at build time — the Supabase anon key is a public, client-safe key.

## Project structure

```
src/
  components/     shared UI (Layout, AIAdvisorPanel, PageHeader, shadcn/ui in components/ui)
  pages/          one file per route (see src/App.tsx for the route table)
  hooks/          Supabase-backed data hooks (usePlannerItems, useBudgets, useCurrentUser)
  integrations/   Supabase client
  lib/            framework-agnostic helpers (cn, markdown parsing)
```
