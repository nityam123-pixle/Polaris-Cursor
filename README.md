# Polaris

A web-based IDE and project workspace built with Next.js. Polaris combines a full-featured code editor (CodeMirror 6), project and file management (Convex), authentication (Clerk), and AI-powered editing (OpenAI, Google AI) in one app.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Controls & Shortcuts](#key-controls--shortcuts)
- [Deployment](#deployment)

---

## Features

### Authentication (Clerk)

- Sign in / sign up with Clerk
- JWT-based auth wired to Convex for secure, per-user data

### Projects & Database (Convex)

- **Projects**: Create projects (with auto-generated names), rename, and list by owner
- **Files**: Hierarchical files and folders per project; create, rename, delete; text content stored in Convex, binary in Convex Storage
- **Real-time**: Convex subscriptions keep the UI in sync across tabs and devices

### IDE Layout

- **Resizable panels**: File explorer and editor area use [Allotment](https://github.com/nicholasrq/allotment) (resize by dragging)
- **Tabs**: Code and Preview tabs; multiple open files as tabs with single-click (preview) vs double-click (pinned)
- **Breadcrumbs**: Current file path (e.g. `src/components/Button.tsx`) above the editor
- **Navbar**: Logo, project name (click to rename), sync status, user menu

### File Explorer

- Tree of files and folders per project
- **Create**: New file or folder at root or inside folders (buttons in header and context menu)
- **Rename**: Right-click → Rename, or select and press Enter
- **Delete**: Right-click → Delete
- **Open file**: Single-click = preview tab, double-click = pinned tab
- Keyboard: Enter on a file opens rename; Enter in rename confirms

### Code Editor (CodeMirror 6)

- **Languages**: JS/TS/JSX/TSX, HTML, CSS/SCSS/Less, JSON, Markdown/MDX, Python, Java, Rust, C/C++, SQL, PHP, XML/SVG, YAML, Go, WAT/WAST, Jinja, Liquid
- **Behavior**: Line numbers, active line highlight, bracket matching, close brackets, indent on input, fold gutter, rectangular selection, multiple selections
- **Theme**: One Dark with custom styling
- **Extras**: Minimap, indentation markers, search (Ctrl+F), history (undo/redo), autocomplete keybindings
- **Persistence**: Content auto-saves to Convex with debounce (~1.5s) on change

### AI Features

- **Inline suggestion (optional)**: Context-aware completion at cursor; accept with **Tab**. (API: `/api/suggestion`, OpenAI; can be enabled in `code-editor.tsx` by uncommenting `suggestion(fileName)`.)
- **Quick Edit**: Select code → **Ctrl/Cmd+K** → enter an instruction (and optionally paste docs/URLs); selection is replaced by AI-edited code. Uses Google Gemini and Firecrawl for URL documentation when you paste links in the instruction.

### Background Jobs & Web Scraping (Inngest + Firecrawl)

- **Inngest**: `demo/generate` function for background text generation with optional URL context
- **Firecrawl**: Used in Quick Edit to scrape URLs you paste into the instruction, and in Inngest for URL-based context

### Error Tracking (Sentry)

- Sentry is integrated for client, server, and edge; errors are reported when configured.

---

## Tech Stack

| Area            | Technology                                    |
| --------------- | --------------------------------------------- |
| Framework       | Next.js 16 (App Router)                       |
| Language        | TypeScript                                    |
| Database / BaaS | Convex                                        |
| Auth            | Clerk                                         |
| Editor          | CodeMirror 6                                  |
| UI              | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| AI              | Vercel AI SDK (OpenAI, Google), Firecrawl     |
| Jobs            | Inngest                                       |
| Monitoring      | Sentry                                        |
| Package manager | Bun (or npm/yarn/pnpm)                        |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh/) (or npm / yarn / pnpm)
- Accounts (free tiers work): [Clerk](https://clerk.com), [Convex](https://convex.dev), and optionally OpenAI, Google AI, Firecrawl, Inngest, Sentry

### 1. Clone and install

```bash
git clone <your-repo-url>
cd polaris
bun install
# or: npm install / yarn / pnpm install
```

### 2. Environment variables

Copy the example env and fill in your values (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env.local
```

Create `.env.local` (and optionally `.env`) with at least:

- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`
- Convex: `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`
- For Convex CLI: ensure Convex is linked (`npx convex dev` will prompt if not)

Add the rest if you use those features: OpenAI, Google AI, Firecrawl, Inngest, Sentry.

### 3. Convex

```bash
npx convex dev
```

Keep this running in a terminal. It syncs schema and functions and gives you a backend URL.

### 4. Run the app

In another terminal:

```bash
bun run dev
# or: npm run dev / yarn dev / pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Clerk, create a project, add files, and use the editor and shortcuts below.

---

## Environment Variables

| Variable                            | Required                 | Description                                                                                                |
| ----------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes                      | Clerk publishable key                                                                                      |
| `CLERK_SECRET_KEY`                  | Yes                      | Clerk secret key                                                                                           |
| `CLERK_JWT_ISSUER_DOMAIN`           | Yes                      | Clerk JWT issuer (e.g. `https://your-app.clerk.accounts.dev`) — used in `convex/auth.config.ts`            |
| `NEXT_PUBLIC_CONVEX_URL`            | Yes                      | Convex deployment URL (e.g. `https://xxx.convex.cloud`)                                                    |
| `CONVEX_DEPLOYMENT`                 | For Convex CLI           | e.g. `dev:your-deployment`                                                                                 |
| `OPENAI_API_KEY`                    | For suggestion API       | Used by `/api/suggestion`                                                                                  |
| `GOOGLE_GENERATIVE_AI_API_KEY`      | For Quick Edit / Inngest | Used by `/api/quick-edit` and Inngest demo                                                                 |
| `FIRECRAWL_API_KEY`                 | For Quick Edit / Inngest | Scrape URLs in instructions and Inngest                                                                    |
| `SENTRY_*`                          | For Sentry               | See Sentry Next.js docs                                                                                    |
| Inngest                             | Optional                 | Configure per [Inngest + Next.js](https://www.inngest.com/docs/getting-started) if you use background jobs |

Use `.env.local` for local development and never commit secrets.

---

## Project Structure

```
polaris/
├── convex/                 # Convex backend
│   ├── schema.ts           # projects, files tables
│   ├── auth.config.ts     # Clerk JWT for Convex
│   ├── auth.ts            # verifyAuth helper
│   ├── projects.ts        # project CRUD
│   └── files.ts           # file/folder CRUD + storage
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/
│   │   │   ├── suggestion/ # AI inline suggestion (OpenAI)
│   │   │   ├── quick-edit/ # AI edit selection (Gemini + Firecrawl)
│   │   │   └── inngest/   # Inngest webhook
│   │   ├── page.tsx       # Home → ProjectsView
│   │   └── projects/[projectId]/  # Project IDE page
│   ├── components/        # Shared UI (providers, shadcn/ui)
│   ├── features/
│   │   ├── auth/          # Clerk unauthenticated / loading views
│   │   ├── editor/        # CodeMirror editor, tabs, breadcrumbs, extensions
│   │   └── projects/      # Projects list, file explorer, navbar, command dialog
│   ├── inngest/           # Inngest client + functions (e.g. demo/generate)
│   └── lib/               # firecrawl client, utils
├── public/
└── package.json
```

---

## Key Controls & Shortcuts

### Global (anywhere in app)

| Shortcut           | Action                                                 |
| ------------------ | ------------------------------------------------------ |
| `Ctrl+K` / `Cmd+K` | Open **Search projects** command dialog (project list) |

### Projects home

| Action                            | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| **Create New Project** (⌘J shown) | Creates a project with a random name and opens it |
| **Import Project** (⌘I shown)     | Placeholder for future GitHub import              |
| **View all**                      | Opens the same command dialog as `Ctrl/Cmd+K`     |

### Inside a project (IDE)

| Shortcut                      | Action                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Ctrl+K` / `Cmd+K`            | **Quick Edit**: if you have a selection, opens AI edit tooltip; type instruction and submit to replace selection |
| `Tab`                         | (When inline suggestion is enabled) Accept current suggestion at cursor                                          |
| Click tab                     | Switch to that file (preview tab)                                                                                |
| Double-click tab              | Pin file (open as permanent tab)                                                                                 |
| Tab × button                  | Close that tab                                                                                                   |
| Click file in explorer        | Open file in preview tab                                                                                         |
| Double-click file             | Open file in pinned tab                                                                                          |
| Right-click file/folder       | Context menu: Rename, Delete, New File, New Folder                                                               |
| Enter on selected file/folder | Start rename                                                                                                     |
| Resize panels                 | Drag the divider between file explorer and editor                                                                |

### CodeMirror (editor)

| Shortcut                       | Action                                       |
| ------------------------------ | -------------------------------------------- |
| `Ctrl+F` / `Cmd+F`             | Find                                         |
| `Ctrl+Z` / `Cmd+Z`             | Undo                                         |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo                                         |
| `Tab`                          | Indent line / accept suggestion (if enabled) |
| Fold gutter                    | Click chevron to fold/unfold code blocks     |

(Additional CodeMirror keymaps: history, search, fold, completion, close brackets — see `custom-setup.ts`.)

---

## Deployment

1. **Convex**: Create a production deployment in Convex dashboard and set `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` for production.
2. **Clerk**: Use a production Clerk application and set production keys and `CLERK_JWT_ISSUER_DOMAIN`.
3. **Next.js**: Deploy to Vercel (or any Node host). Add all required env vars; keep `.env*` out of git.
4. **Inngest**: If you use Inngest, point the app URL and webhook to your production URL.
5. **Sentry**: Configure `SENTRY_*` for your production project.

---

## Scripts

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `bun run dev`    | Start Next.js dev server            |
| `bun run build`  | Production build                    |
| `bun run start`  | Start production server             |
| `bun run lint`   | Run ESLint                          |
| `npx convex dev` | Run Convex dev (schema + functions) |

---

## License

Private / unlicensed unless otherwise specified in the repository.
