# PetLife Web

This is the active Web version of PetLife, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

PetLife Web is not a marketing-only site. It is a responsive app prototype for pet community, pet companionship, service discovery, booking handoff, chat, growth records, and immersive pet memories.

## Features

- Public landing page with warm product positioning and scroll reveal animation
- Supabase Auth login/register flow
- Protected app workspace under `/app`
- Community feed, post detail, likes, comments, and chat entry
- Service marketplace with offers, requests, detail pages, booking states, and service reviews
- Pet profile and user profile areas
- Growth record center with memory creation and detail pages
- Interactive Christmas tree at `/app/tree/interactive`
- Chinese / English UI switcher using the `petlife-locale` cookie
- Supabase SQL migrations and RLS policies

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase SSR and Supabase JS
- Three.js, GSAP, and MediaPipe Tasks Vision for the interactive tree
- Vercel deployment

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Supabase

Apply migrations from:

```text
web/supabase/migrations/
```

Current migrations:

- `202604230001_petlife_web_schema.sql`
- `202604290001_services_bookings.sql`

The app expects RLS to be enabled and uses user-scoped Server Actions for mutations. Do not expose a Supabase service-role key to the client.

## Important Routes

- `/` - public landing page
- `/login` - login/register
- `/app` - protected overview
- `/app/match` - community and service workspace
- `/app/match?tab=services` - service marketplace
- `/app/tree` - growth records
- `/app/tree/interactive` - immersive interactive Christmas tree
- `/app/chats` - chat list
- `/app/profile` - profile and account area

## Deployment

Use Vercel with:

- Root directory: `web`
- Framework preset: Next.js
- Build command: `npm run build`

Configure environment variables in Vercel Project Settings:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Verification

Before pushing UI or app changes, run:

```bash
npm run lint
npm run build
```

For visual changes, manually check both desktop and mobile widths. The interactive tree should also be checked on mobile because in-app browsers and camera permission flows can behave differently from desktop Chrome/Edge.
