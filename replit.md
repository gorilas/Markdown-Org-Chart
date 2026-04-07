# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Organigrama desde Markdown (DESY)
- **Path**: `artifacts/orgchart-pwa/`
- **Preview**: `/`
- **Type**: react-vite (PWA)
- **Description**: PWA that converts structured Markdown (using ## / ### / - hierarchy) into interactive org charts. Users can toggle each node between horizontal and vertical child layout. Export to PDF supported. Follows DESY design system (Gobierno de Aragón).
- **Key features**:
  - Markdown editor with real-time org chart rendering
  - Per-node horizontal/vertical layout toggle (persisted in localStorage)
  - PDF export via html2canvas + jsPDF
  - PWA installable (manifest.json + service worker)
  - DESY styles: Source Sans 3, #00539f blue, institutional colors

### API Server
- **Path**: `artifacts/api-server/`
- **Type**: Express 5 API
- **Preview**: `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/orgchart-pwa run dev` — run org chart PWA locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
