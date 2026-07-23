# ISMS-Flow — ISO 27001:2022 Implementation Portal

A complete, professional ISMS management platform for implementing ISO/IEC 27001:2022 certification without external consultants.

## Quick Start

```
# Double-click or run from project root:
start.bat

# Or from apps/web:
apps\web\start-dev.bat
```

The app runs on **http://localhost:3001**

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Database**: SQLite via Prisma 7 + LibSQL adapter
- **Styling**: Vanilla CSS (no Tailwind)

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Live metrics, risk matrix, readiness dial |
| ISMS Journey | `/journey` | Step-by-step roadmap with checklists |
| Clauses (4-10) | `/clauses` | ISO 27001 mandatory clauses progress |
| Annex Controls | `/controls` | All 93 Annex A controls with status tracking |
| SoA Builder | `/soa` | Statement of Applicability for all controls |
| Risk Register | `/risks` | Add/manage/track information security risks |
| Evidence Hub | `/evidence` | Track evidence collection for audit |
| Document Library | `/documents` | Manage ISMS policies and procedures |
| Audit Prep | `/audit` | Internal audit checklist with CAPA tracking |
| AI Copilot | `/copilot` | ISO 27001 implementation guidance |

## Database Seeding

```bash
# Run from apps/web directory using Node directly:
node "..\..\node_modules\ts-node\dist\bin.js" --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

## Project Structure

```
ISMS-Flow/
├── apps/
│   └── web/                    # Next.js application
│       ├── prisma/
│       │   ├── schema.prisma   # Database schema
│       │   ├── seed.ts         # Database seeding script
│       │   └── dev.db          # SQLite database
│       └── src/
│           ├── app/            # Next.js pages and API routes
│           │   ├── api/v1/     # REST API endpoints
│           │   ├── controls/   # Annex A controls page
│           │   ├── risks/      # Risk register page
│           │   ├── documents/  # Document library page
│           │   └── ...         # Other pages
│           ├── components/     # Reusable UI components
│           └── lib/            # Utilities (Prisma client, API)
├── node_modules/               # Dependencies (hoisted)
├── start.bat                   # Easy startup script
└── package.json                # Workspace configuration
```
