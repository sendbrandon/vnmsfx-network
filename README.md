# VNMSFX Network

The funniest network in New York. A New York network making AI work that doesn't look like AI work.

This is the network homepage — Drop V2 (manifesto-led).

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Archivo Black + Inter (Google Fonts) + Times New Roman

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Auto-deploys to Vercel on push to `main`. Manual:

```bash
npx vercel --prod --yes
```

## Updating the work cards

Work card content lives in `app/page.tsx` under the `WORKS` constant.
Poster frames live in `public/work/`. To swap a video's poster frame:

```bash
ffmpeg -ss 00:00:18 -i path/to/video.mp4 -vframes 1 -q:v 2 public/work/[slug].jpg
```
