# PetLife iOS App

PetLife is a SwiftUI iOS prototype for a pet life-cycle platform. The current codebase now covers a fuller product shell instead of only static screens.

## Current Product Scope

- Account onboarding and session-aware app entry
- Pet profile management with owner-facing profile hub
- Christmas tree album with timeline detail and memory creation
- Pet video publishing flow with upload queue and detail pages
- Social square with feed publishing, post detail, comments, and chat entry
- Local in-memory backend actor that can later be replaced by Firebase, Supabase, or a custom API

## Architecture

- `PetLife/App`
  - App entry and root authenticated shell
- `PetLife/Shared`
  - Domain models
  - `AppModel` state container
  - `InMemoryPetBackend` async mock backend
  - Shared theme tokens
- `PetLife/Features`
  - `Auth`: sign-in onboarding
  - `Home`: dashboard and navigation shortcuts
  - `ChristmasTree`: album tree, detail, and creation flow
  - `Video`: upload composer, queue, and detail
  - `Match`: pet discovery, feed, post detail, and chat
  - `Profile`: user profile hub, pet archive, and inbox

## Backend Evolution Path

The current backend layer is intentionally split from the UI:

- `AppModel` owns view-facing state and orchestration
- `InMemoryPetBackend` simulates async data operations
- feature views call async methods instead of mutating raw arrays directly

This makes it straightforward to swap in:

- Firebase Auth for login
- Supabase/Postgres or Firestore for pets, posts, and chats
- Supabase Storage / Firebase Storage / OSS / S3 for videos and media
- moderation and recommendation services for publish/review/match flows

## Notes

- The project targets iOS 17 and uses SwiftUI + Observation.
- This environment cannot run Xcode, so the code has not been compiled here.
- If you continue on macOS with Xcode, the next practical step is wiring a real backend and media storage.
