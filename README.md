This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

This project is pinned to port `3001`. Port `3000` is used by another local app on this machine; do not use `localhost:3000` to review 828 Construction.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, Space Mono, and IBM Plex Mono.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production regression checks

After installing dependencies, run:

```sh
npm run lint
npm run build
npm run test:contact
npm run audit:seo
npx playwright install chromium firefox webkit
npm run test:release
```

`test:release` starts the production build on port 3011 with a fresh test-only contact signing key. It covers all eight routes at phone, tablet, and desktop widths in Chromium, Firefox, and WebKit, plus navigation, forms, galleries, reduced motion, and cursor behavior. Email delivery is mocked in browser submission tests; these checks do not send customer leads. CI runs this same suite and uploads failure screenshots/traces.

To run existing tests against a separately started local server, set `TEST_BASE_URL` to that server's URL. Port 3000 belongs to another application and must not be used for this project.

See [SEO maintenance](docs/SEO-MAINTENANCE.md) for sitemap and Search Console follow-up.

## Moving to another device

See [new-device setup](docs/NEW-DEVICE-SETUP.md) for installation, credentials, tests, and what Git does not transfer.
