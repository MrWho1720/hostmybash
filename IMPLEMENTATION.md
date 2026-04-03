# HostMyBash — Implementation Plan

## Phase 1: Project Scaffolding & Database
- [x] Initialize Next.js project with Bun
- [x] Set up PostgreSQL with Drizzle ORM
- [x] Define all database schemas
- [ ] Run migrations (requires running PostgreSQL)

## Phase 2: Authentication
- [x] Lucia Auth integration
- [x] Register / Login / Logout API routes
- [x] Session middleware (requireAuth)
- [x] Auth UI pages (login/register)

## Phase 3: Script Management
- [x] CRUD API for scripts
- [x] Visibility model (private/public/shared)
- [x] Script sharing endpoints
- [x] Script editor UI (textarea, Monaco can be added later)
- [x] Script detail page with execute button

## Phase 4: Node Management
- [x] Node registration API with API key generation
- [x] Node listing with status
- [x] Node UI pages (list + add)

## Phase 5: Node Agent
- [x] Standalone Bun agent (agent/agent.ts)
- [x] WebSocket connection to panel
- [x] Heartbeat system (30s interval)
- [x] Docker-based sandboxed execution
- [x] Log streaming back to panel

## Phase 6: Execution Engine
- [x] Execution API (create, cancel, list, detail)
- [x] WebSocket connection manager
- [x] Agent message handler (job lifecycle)
- [x] Live terminal UI page
- [x] Log history endpoint

## Phase 7: Scheduling
- [x] Cron schedule CRUD API
- [x] Schedule management UI

## Phase 8: Security Hardening & Deployment
- [x] NGINX config with rate limiting + security headers
- [x] Systemd service files (panel + agent)
- [x] Environment config (.env.example)
- [x] Validation schemas (Zod) on all inputs
