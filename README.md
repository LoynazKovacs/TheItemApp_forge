# Forge — internal CRM / PSA

Forge is our own client-relationship + delivery system, built on ItemOS. It tracks
the full lifecycle of turning a customer's idea into shipped software:

```
Lead → Account/Contact → Interaction (discovery) → Deal (pipeline)
     → BRD (+ granular Requirements) → Initiative (project-manager) → delivered App
```

## What it is

A satellite app-container (`forge-api`, Fastify, port 3011) that registers its
manifest with core and serves its seed bundle. There is **no federated frontend** —
the entire UI is core's generic meta-driven prefabs (list / kanban / tree / chart /
show) seeded as dashboards + windows. The backend stays alive only to keep the app
present in the core catalog (the `apps` row is deleted when the container deregisters).

App id: `8d0000000000000000000001` · ObjectId namespace: `8d…` · host port `3011`.

## Data model

Entities:
- **forge_accounts** — client organisations (the CRM backbone)
- **forge_contacts** — people at an account
- **forge_deals** — opportunities through the pipeline (kanban by stage)
- **forge_interactions** — the activity timeline (meetings, calls, chat sessions, voice notes, docs)
- **forge_brds** — Business Requirements Document headers (living; carries source-chat + delivery links)
- **forge_brd_requirements** — atomic, granular requirements (one row each; idempotent re-sync via `reqKey`)

Governed lookups: `forge_account_stages`, `forge_deal_stages`, `forge_interaction_types`,
`forge_brd_statuses`, `forge_requirement_statuses`, `forge_requirement_categories`,
`forge_requirement_priorities`.

## The "living" thread

A BRD is never frozen. Provenance + watermark fields keep it current as a conversation continues:
- `forge_brds.sourceSessionId` → the source `chat_sessions` record
- `forge_brds.lastSyncedMessageId` / `lastSyncedAt` → how far into the chat we've reconciled
- `forge_brd_requirements.reqKey` → stable idempotency key (re-sync upserts, never duplicates)
- `forge_brd_requirements.sourceQuote` / `sourceMessageId` → the customer's exact words
- `forge_brd_requirements.changeLog` → timestamped mutation history (never silently overwrite)
- requirements are dropped/superseded (status + `supersededByReqKey`), not deleted

A BRD also links forward: `forge_brds.initiativeId` (project-manager) and `forge_brds.appId`
(the delivered app), so the whole chain — chat → BRD → work → product — is one query away.

## Dashboards

- **Forge** (home) — accounts, BRDs, pipeline board, deals-by-stage, recent interactions
- **Pipeline** — deals kanban + list + chart
- **BRD Workspace** — BRDs, requirements kanban, requirements tree (by category), category/status charts
- **Accounts & Contacts** — accounts, contacts, accounts-by-stage, interactions

## Deploy

```
docker compose up -d --build
```

Requires `APP_REGISTRATION_KEY` in `.env` (the shared core registration key). The app
joins core's external `theitemapp` network and registers against `http://backend:3001`.
