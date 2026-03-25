# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates code and updates a virtual file system; the preview iframe compiles JSX on the client via Babel standalone and renders it live.

## Commands

```bash
# Initial setup
npm run setup          # install + prisma generate + prisma migrate dev

# Development
npm run dev            # Next.js dev server with Turbopack (NODE_OPTIONS polyfill required)

# Build & production
npm run build
npm run start

# Database
npx prisma studio      # GUI for SQLite database
npm run db:reset       # Drop and re-migrate (destructive)
npx prisma migrate dev # Apply schema changes

# Lint & test
npm run lint
npm run test           # Vitest
npx vitest run <file>  # Run a single test file
```

The `NODE_OPTIONS='--require ./node-compat.cjs'` prefix is required in all Next.js scripts — it's already in package.json scripts.

## Architecture

### Data Flow

```
User chat input
  → useChat (Vercel AI SDK) → POST /api/chat
  → Claude API (streaming)
  → tool calls: str_replace_editor / file_manager
  → FileSystemContext updates virtual FS
  → PreviewFrame recompiles JSX via Babel → iframe re-renders
  → CodeEditor (Monaco) reflects file changes
```

### Key Layers

**State (Context Providers)**
- `src/lib/contexts/file-system-context.tsx` — Virtual file system state; handles AI tool call results (`str_replace_editor`, `file_manager`); broadcasts FS changes to editor and preview
- `src/lib/contexts/chat-context.tsx` — Chat messages; wraps Vercel AI SDK `useChat`

**AI / Backend**
- `src/app/api/chat/route.ts` — Streaming endpoint; calls Claude with two tools attached; passes current FS state in system prompt
- `src/lib/tools/str-replace.ts` — `str_replace_editor` tool (create/replace/insert file content)
- `src/lib/tools/file-manager.ts` — `file_manager` tool (rename/delete)
- `src/lib/provider.ts` — Wraps `@ai-sdk/anthropic`; falls back to `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent

**Preview**
- `src/components/preview-frame.tsx` — Isolated `<iframe>` with `sandbox` attribute; generates import map pointing to esm.sh CDN for React 19; compiles JSX files to blob URLs via Babel standalone at runtime
- `src/lib/transform/jsx-transformer.ts` — Babel-based JSX → JS transformation; maps imports to CDN or blob URLs

**Data Persistence**
- `src/lib/file-system.ts` — In-memory virtual FS with JSON serialization; stored in `Project.data` column
- `prisma/schema.prisma` — SQLite; `User` (email/password) → `Project` (messages JSON, data JSON)
- `src/lib/auth.ts` — JWT sessions via `jose`, stored in httpOnly cookie; bcrypt for passwords

**Routing**
- `/` — Redirects authenticated users to their latest project; shows landing/sign-in for anonymous users
- `/[projectId]` — Protected; loads project from DB and hydrates FS + chat history

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Claude API key; falls back to mock provider if absent |
| `JWT_SECRET` | Yes (prod) | Secret for signing session JWTs |
| `DATABASE_URL` | No | Defaults to `file:./dev.db` (SQLite) |

## Database

The schema is defined in `prisma/schema.prisma`. Reference it whenever you need to understand the structure of data stored in the database.

## Code Style

Do not write comments in code unless the logic is genuinely non-obvious.

## Important Patterns

**Server vs. Client split**: Pages and data-fetching are Server Components by default. Context providers, Monaco editor, chat UI, and preview frame are all `"use client"`. Server Actions (`src/actions/`) handle auth and project CRUD.

**Tool call lifecycle**: The chat API route returns tool call results in the stream; `FileSystemContext` listens for `onToolCall` events from `useChat` and applies FS mutations synchronously before the next render cycle.

**Preview compilation**: Each file in the virtual FS that ends in `.jsx`/`.tsx` is compiled to a blob URL. An import map is injected into the iframe so bare specifiers (`react`, `react-dom`) resolve to esm.sh CDN URLs for React 19.

**Mock provider**: During development without an API key, `MockLanguageModel` in `src/lib/provider.ts` simulates multi-step tool calls generating example Counter/Form/Card components.
