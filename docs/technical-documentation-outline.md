# PetLife Technical Documentation

This document summarizes the current technical state of the PetLife repository. The repository contains two product surfaces: the original SwiftUI iOS prototype and the active Next.js Web app.

## 1. Project Overview

PetLife is a pet social, companionship, and service platform prototype. The product direction combines:

- Community content and pet discovery
- Pet profiles and growth records
- Service offers, service requests, booking handoff, and reviews
- Chat threads tied to pet, post, or service context
- Immersive memory experiences such as the interactive Christmas tree

The Web app is currently the active implementation path because it can be developed, deployed, and tested without an Apple Developer account.

## 2. Current Technology Stack

### Web

- Framework: Next.js App Router
- Language: TypeScript
- UI: React 19 and Tailwind CSS
- Auth/database/storage: Supabase
- Realtime/chat refresh: minimal refresh/subscription-oriented components
- 3D interaction: Three.js, GSAP, and MediaPipe Tasks Vision
- Deployment target: Vercel

### iOS

- UI framework: SwiftUI
- State management: Observation
- Target platform: iOS 17
- Primary state container: `AppModel`
- Prototype backend: local in-memory backend boundary

## 3. Web Architecture

Confirmed structure:

- `web/src/app` contains App Router pages for public routes, login, protected app pages, service details, booking details, tree, videos, chats, and profile.
- `web/src/components` contains product UI, app shell, marketing shell, language switcher, reveal-on-scroll, and interactive Christmas tree components.
- `web/src/lib` contains data access, demo fallback data, i18n, theme, shared types, and utilities.
- `web/supabase/migrations` contains database schema migrations.

Main Web data flow:

```text
Route / Server Component
-> data helper in web/src/lib/data.ts
-> Supabase client or demo fallback
-> page renders product components
-> Server Action handles mutation
-> route refresh / redirect updates UI
```

The Web app uses a lightweight i18n layer:

- Locale type: `zh | en`
- Cookie: `petlife-locale`
- Default language: Chinese
- User-generated content is not auto-translated

## 4. Supabase Data Model

The current migrations cover:

- `profiles`
- `pets`
- `memories`
- `videos`
- `feed_posts`
- `post_likes`
- `post_comments`
- `chat_threads`
- `chat_messages`
- `service_offers`
- `service_requests`
- `bookings`
- `service_reviews`

RLS is expected to protect user-owned records, private service/booking records, and chat participation. Client code must never use a service-role key.

## 5. Key Product Flows

### Community

- Browse pet/community content
- Create feed posts
- Open post detail
- Like and comment
- Open chat from pet or post context

### Services

- Browse service offers
- Browse service requests
- Filter by service type
- Create service offer or request
- Open detail before contacting or booking
- Create booking draft
- Advance booking status
- Submit review after completion

### Growth Records

- Create and view memories
- Upload or reference media through Supabase-oriented helpers
- Open memory detail
- Enter interactive Christmas tree mode

### Interactive Christmas Tree

- Renders a procedural Three.js tree with lights, snow, magic dust, photos, and music controls
- Supports TREE / SCATTER / FOCUS states
- Supports temporary local photo upload without writing back to Supabase
- Supports optional gesture initialization after user interaction
- Has mobile chrome collapse to reduce UI obstruction

## 6. iOS Architecture

Confirmed structure:

- `PetLife/App/PetLifeApp.swift` initializes the app.
- `PetLife/App/RootTabView.swift` handles loading, auth state, and the main tab shell.
- `PetLife/Shared/AppState.swift` contains app-level state, session logic, simulated backend operations, and business orchestration.
- `PetLife/Shared/Models.swift` defines user, pet, memory, video, feed, comment, and chat models.
- `PetLife/Features` contains Auth, Home, ChristmasTree, Video, Match, and Profile feature views.

Current iOS limitations:

- Cannot be built or run in the current Windows environment.
- Still needs macOS/Xcode verification.
- Real backend and media storage are not the active iOS implementation target right now.

## 7. Verification Plan

### Web static and build checks

Run from `web/`:

```bash
npm run lint
npm run build
```

### Web manual checks

- Login/register and logout
- Protected route redirect
- Community feed, post detail, like, comment, and chat entry
- Service marketplace, filters, detail pages, booking flow, and reviews
- Growth record creation and detail
- Interactive tree on desktop and mobile widths
- Chinese / English language switcher
- Vercel deployment with Supabase environment variables

### iOS checks

Run on macOS with Xcode:

- Clean build
- Sign in / sign out
- Add pet
- Add memory
- Publish video
- Publish post and open detail
- Like/comment/chat
- Validate session cleanup and stable routing

## 8. Current Risks and Follow-up

- Hosted Supabase projects must have migrations applied before production data flows are reliable.
- Service marketplace v1 intentionally avoids payment, map picking, advanced calendars, and automated matching.
- Interactive tree gesture mode can be expensive on some browsers; manual button controls remain the fallback.
- iOS runtime behavior is not validated in this Windows environment.
- Old extracted folders such as `petner-app-main 2` and `__MACOSX` remain local cleanup candidates but should not be committed.
