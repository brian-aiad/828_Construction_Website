# 828 Construction project structure

## Purpose

The 828 Construction website, including its public pages, real project photography, and contact-request service.

## Canonical workspace

Use the existing checkout in the real local folder for this device:

| Device | Canonical folder |
| --- | --- |
| Windows | `C:\Users\kingt\Desktop\Projects\828_website` |
| Mac | `/Users/brianaiad/Code/Projects/828_website` |

These are actual project directories. Keep the same relative project names and committed source on both computers; the parent location differs because the Mac Desktop syncs to iCloud. Shared context stays in OneDrive. The same repository and `main` commit provide the shared source history.

At session start, open this folder, inspect `git status`, and fetch `origin`. Fast-forward only when local work can be preserved safely. Reconcile existing edits before changing branches. Do not clone another dated project folder for each task. A temporary worktree is an exceptional tool for an actual concurrent task; record and retire it after its unique work is preserved.

## Folder map

| Folder | Contents |
| --- | --- |
| `app/` | Next.js routes, layouts, API endpoints, and local fonts. |
| `components/`, `hooks/`, `lib/`, `utils/` | Shared UI, behavior, typed project data, and helpers. |
| `public/` | Files served directly, including optimized project photographs. Preserve referenced runtime paths. |
| `assets/` | Branding and source/design assets already kept with the repository. |
| `docs/`, `design/` | Handoffs, technical documentation, client direction, and design references. |
| `scripts/`, `tests/` | Development tools, build audits, and regression tests. |

Original Torrance media is indexed in the shared brain at `Projects/828-construction/Assets/Originals/Torrance-Residence/MANIFEST.json`. The existing source folder is preserved locally; website-ready versions remain in `public/images/projects/torrance-residence/`. Other original residence folders and research material must be reviewed for provenance before any reorganization.

## Commands

Use Node 22 and the package scripts: `npm run dev` (port 3001), `npm run lint`, `npm run test:contact`, and `npm run preflight:full`. The full preflight builds production and checks all routes at desktop/mobile sizes. See the root README and `CLAUDE.md` for project-specific release rules. Pushing `main` deploys the official site; use the user's current authorization.

## Shared context

Read `AI_Brain/START_HERE.md`, then `AI_Brain/Projects/828-construction/CONTEXT.md`. The shared brain is in OneDrive `Downloads/AI_Brain` (on macOS, under `~/Library/CloudStorage/OneDrive-Personal`). Keep current decisions, commit, validation results, remaining work, and source-asset references there. If sync is unavailable, report that limitation and reconcile the shared note when access returns.

Keep repository documentation useful on GitHub. Keep credentials, private configuration, dependency folders, build output, and local databases out of the shared brain and commits.

## History/recovery

Git retains committed history. Prior project folders belong in `OLD_Projects/` inside the device's canonical Projects folder above, separate from the active checkout. Organization receipts and preserved snapshots may also remain in the recorded local `Code/Organization_Backups` and `Code/Archive` recovery locations during migration. Preserve unique uncommitted files and original client assets before retiring an old checkout. Summaries are an index to the evidence, not a replacement for unique source files.
