# VNMSFX Network

Live site: [vnmsfx.com](https://vnmsfx.com)

VNMSFX Network is an AI-assisted media lab and portfolio system from New York. It presents video work, internet-native campaigns, creative experiments, and product demos through a site that feels built from the same world as the work itself.

## Portfolio Signal

This is the strongest umbrella project in my GitHub portfolio. It shows product direction, visual systems, content operations, AI-assisted creative production, and a public launch surface that ties separate experiments into one coherent network.

## What I Built

- Network homepage for VNMSFX projects and public work
- Work-card system for videos, campaigns, and experiments
- Social sharing metadata, icons, sitemap, robots, and manifest assets
- Mailchimp-ready subscribe route with `.env.example`
- Tailwind-based visual system using Archivo Black, Inter, and Times New Roman
- Vercel deployment flow for a custom domain

## Why It Matters

Mission-driven organizations often have valuable stories, services, and proof points scattered across tools. VNMSFX Network demonstrates the same organizing skill in a cultural context: gather the work, give it a memorable structure, and make it easy for people to understand what is happening.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Mailchimp API
- Vercel

## Local Dev

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy

Auto-deploys to Vercel on push. Manual production deploy:

```bash
npx vercel --prod --yes
```

## Updating Work Cards

Work card content lives in `app/page.tsx` under the `WORKS` constant. Poster frames live in `public/work/`. To swap a video's poster frame:

```bash
ffmpeg -ss 00:00:18 -i path/to/video.mp4 -vframes 1 -q:v 2 public/work/[slug].jpg
```
