# Continue on a new device

The repository includes the website source, public assets, package lock, regression tests, SEO cleanup, and October 7 QA report. Existing root-level navigation debugging scripts, unused component drafts, and branding source PNGs are included for continuity. The old navigation debugging scripts still assume port 3000; prefer the maintained test commands below. Do not run those old scripts against an unrelated app on port 3000.

## Install and run

Use Node.js 22 (see `.nvmrc`), npm, Git, and a GitHub account authorized for the repository.

```sh
git clone https://github.com/brian-aiad/828_Construction_Website.git
cd 828_Construction_Website
npm ci
npm run dev
```

Open http://localhost:3001. No private API key is required to work on layouts, navigation, animations, or the local website. The development contact challenge has a development-only fallback; actual email delivery requires the environment variables below.

If this repository is already cloned on the new device, commit or stash any local work first, then use `git pull --ff-only` and `npm ci`.

## Verify changes

```sh
npx playwright install chromium firefox webkit
npm run lint
npm run build
npm run test:contact
npm run audit:seo
npm run test:release
```

The production browser suite uses port 3011 and generates a fresh temporary signing key automatically. Browser submission tests mock delivery, so these tests need no real Resend key and send no emails. On Linux, browser installation may also require `npx playwright install --with-deps chromium firefox webkit`.

## Credentials

There were no real local `.env.local` or `.env.production` files and no `.vercel/project.json` in the old-device checkout at handoff. Only `.env.example` was present. This checks the project folder, not every password manager or system credential store on the device.

For real email integration, copy `.env.example` to `.env.local` and supply:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Private Resend API credential for sending inquiries. |
| `CONTACT_FORM_SECRET` | Private random signing key for the contact-form challenge; use at least 32 random bytes. A separate local key can be generated for development. |
| `CONTACT_EMAIL` | Destination inbox for inquiries; not a secret. |
| `CONTACT_FROM_EMAIL` | Sender address on the verified Resend domain; not a secret. |
| `NEXT_PUBLIC_GA_ID` | Optional public Google Analytics measurement ID. Omit locally unless analytics is needed. |

Retrieve real credentials through the authorized hosting project's environment settings or your password manager, and keep them in `.env.local`, which Git ignores. Do not paste them into GitHub, a chat, or this guide. Local key generation does not require changing the production signing key. `NODE_ENV`, `VERCEL`, and `VERCEL_URL` are supplied by the runtime/hosting environment rather than copied manually.

Authenticate to GitHub on the new device with that device's own login or SSH key. There is no need to copy this device's private SSH key. If managing hosting or Search Console, sign into the existing Vercel/Google accounts and ensure the new session has project access; account credentials are not stored in this repository.

## Files not transferred through Git

`node_modules`, `.next`, `.next-dev`, browser binaries, screenshots/reports in `output`, `.playwright-cli`, `test-results`, `playwright-report`, `.claude-work`, and machine credentials are excluded. Build outputs and tests can be regenerated. Local screenshots, scratch research, and conversation history are not part of the Git handoff; copy those separately if you want the historical artifacts. The durable findings are in [the QA report](WEBSITE-QA-2026-10-07.md) and [SEO maintenance guide](SEO-MAINTENANCE.md).

The Claude hook now uses a repository-relative script path instead of an old Windows user directory. It expects to run from the project root. Its local preflight marker is not transferred; run the required preflight on the new device before using that hook's push workflow.
