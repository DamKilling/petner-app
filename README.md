# PetLife

PetLife is a pet social, companionship, and service platform prototype. The repository currently keeps the original SwiftUI iOS prototype and the newer Next.js Web app side by side.

The current priority is to make the Web version usable for real multi-user flows while preserving the iOS prototype as a reference implementation.

## Current Product Scope

### Web app

The Web app lives in `web/` and is the active implementation target.

- Public landing page with community, service, trust, and product positioning sections
- Email/password login through Supabase Auth
- App workspace with overview, community, services, pets/growth tree, messages, and profile areas
- Community feed with publishing, detail pages, likes, comments, and chat entry
- Service marketplace with service offers, service requests, details, chat handoff, booking status flow, and reviews
- Pet profiles and owner profile hub
- Growth record center with memory creation and detail pages
- Immersive interactive Christmas tree built with Three.js, MediaPipe gesture entry, temporary photo upload, music controls, and mobile chrome collapse
- Chinese / English UI language switcher stored in a cookie without changing URL structure
- Supabase Postgres, RLS, Storage-oriented media helpers, and GitHub Actions heartbeat workflow

### iOS prototype

The iOS project remains under `PetLife/` and `PetLife.xcodeproj`.

- SwiftUI + Observation prototype shell
- Account onboarding and session-aware app entry
- Pet profile management with owner-facing profile hub
- Christmas tree album with timeline detail and memory creation
- Video publishing flow with upload queue and detail pages
- Social square with feed publishing, post detail, comments, and chat entry
- Backend boundary through `AppModel` and local/in-memory prototype data

## Repository Structure

```text
PetLife/
  PetLife/                 SwiftUI iOS source
  PetLife.xcodeproj/       Xcode project
  web/                     Next.js + Supabase Web app
  docs/                    Technical notes and operational docs
  .github/workflows/       GitHub Actions workflows
  CHANGELOG.md             Project change history
```

Ignored local leftovers such as `__MACOSX` and extracted duplicate folders should not be committed.

## Web Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Auth/database/storage: Supabase
- 3D interaction: Three.js, GSAP, MediaPipe Tasks Vision
- Deployment target: Vercel

Useful commands:

```bash
cd web
npm install
npm run dev
npm run lint
npm run build
```

Local URL:

```text
http://localhost:3000
```

## Web Environment Variables

Create `web/.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Do not commit real keys. The app must only expose the Supabase anon/publishable key to the client. Service-role keys do not belong in this repository or client bundle.

## Supabase Setup

Apply the SQL migrations in `web/supabase/migrations/` to the Supabase project:

- `202604230001_petlife_web_schema.sql`
- `202604290001_services_bookings.sql`

The current Web data model covers profiles, pets, memories, videos, feed posts, comments, chat threads/messages, service offers, service requests, bookings, and service reviews.

See `docs/supabase-heartbeat.md` for the optional GitHub Actions heartbeat workflow that keeps a Supabase Free Tier project active.

## Deployment

The Web app is intended to deploy from the `web/` directory on Vercel.

Recommended Vercel settings:

- Framework preset: Next.js
- Root directory: `web`
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave default

Add the same Supabase environment variables in Vercel Project Settings before deploying.

## iOS Notes

- Target: iOS 17
- UI: SwiftUI
- State management: Observation
- Main state container: `PetLife/Shared/AppState.swift`

This Windows environment cannot run Xcode or Simulator builds. iOS compilation and runtime validation still need to be done on macOS with Xcode.

## Current Verification Boundary

Confirmed locally for the Web app:

- `npm run lint`
- `npm run build`

Not confirmed in this environment:

- iOS Xcode build
- iOS Simulator or device runtime
- Production Supabase migration execution unless applied manually in the hosted project
