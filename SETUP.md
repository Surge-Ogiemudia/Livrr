# Livrr — Setup Guide

## 1. Environment Variables

Fill in `.env.local`:

```
LIVRR_MONGODB_URI=         # Your MongoDB Atlas connection string
ANTHROPIC_API_KEY=         # From console.anthropic.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=  # Run: node scripts/generate-vapid.js
VAPID_PRIVATE_KEY=             # Run: node scripts/generate-vapid.js
VAPID_EMAIL=mailto:your@email.com
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

Generate your own VAPID keys by running:
```bash
node scripts/generate-vapid.js
```

Never commit VAPID keys to the repo — add them only as Vercel environment variables.

## 2. MongoDB Atlas

1. Create a free cluster at cloud.mongodb.com
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` for Vercel (or use specific IPs)
4. Copy the connection string and replace the placeholder in `.env.local`
5. The database name is `livrr` — it auto-creates on first write

## 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Then in Vercel dashboard → Project → Settings → Environment Variables, add all variables from `.env.local`.

For push notifications to work, set `NEXT_PUBLIC_APP_URL` to your actual Vercel URL.

## 5. iPhone PWA Install

1. Open your Vercel URL in Safari on iPhone
2. Tap the Share button → "Add to Home Screen"
3. Tap Add — Livrr appears as an app icon
4. Open from home screen → tap the bell icon → allow notifications

## 6. iPhone Shortcuts Deep Link (optional)

Create an iPhone Shortcut with a "Open URL" action pointing to:
`https://your-app.vercel.app`

Set it as an alarm action so Livrr opens when your alarm goes off.

## Architecture

```
/app/api/chat          — Claude conversation endpoint
/app/api/memory        — Memory read/write + tab management
/app/api/conversations — Load message history per tab
/app/api/notifications — Web Push subscribe + send

/lib/claude.ts         — Claude API wrapper with full memory context
/lib/memory.ts         — MongoDB memory operations
/lib/types.ts          — All TypeScript types

/components/LivrrApp   — Main orchestration component
/components/ChatInput  — Message input
/components/MessageBubble — Rendered messages with markdown
/components/TabBar     — Dynamic tab navigation
/components/RoadmapView — Feature roadmap with Claude Code prompts
/components/ThemeProposal — Emergent tab proposal UI
/components/Onboarding — First-run name capture
/hooks/useUser         — Local user session
/hooks/usePushNotifications — Web Push subscription management
/public/sw.js          — Service worker (PWA + push)
/public/manifest.json  — PWA manifest for iPhone install
```
