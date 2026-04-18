# PetLife iOS App

PetLife is a SwiftUI iOS prototype for a pet life-cycle platform. The current codebase now covers a fuller product shell instead of only static screens.

## Current Product Scope

- Account onboarding and session-aware app entry
- Pet profile management with owner-facing profile hub
- Christmas tree album with timeline detail and memory creation
- Pet video publishing flow with upload queue and detail pages
- Social square with feed publishing, post detail, comments, and chat entry
- CloudKit-backed persistence with automatic in-memory fallback for local debugging

## Architecture

- `PetLife/App`
  - App entry and root authenticated shell
- `PetLife/Shared`
  - Domain models
  - `AppModel` state container
  - `PetBackend` protocol with two implementations:
    - `CloudKitPetBackend` (real iCloud private database)
    - `InMemoryPetBackend` (fallback + previews)
  - Shared theme tokens
- `PetLife/Features`
  - `Auth`: sign-in onboarding
  - `Home`: dashboard and navigation shortcuts
  - `ChristmasTree`: album tree, detail, and creation flow
  - `Video`: upload composer, queue, and detail
  - `Match`: pet discovery, feed, post detail, and chat
  - `Profile`: user profile hub, pet archive, and inbox

## CloudKit Backend Setup

The backend layer is split from UI via protocol so feature views stay unchanged.

- `AppModel` owns view-facing state and orchestration
- `PetBackendFactory` chooses CloudKit by default
- `CloudKitPetBackend` uses normalized CloudKit records (multi-record-type, not a single payload blob)
- if CloudKit is unavailable, it auto-switches to `InMemoryPetBackend`

### CloudKit record schema (normalized)

- `PLSession`: active app session (`activeUserID`)
- `PLUserAccount`: app profile
- `PLOwnedPet`: owned pets
- `PLHolidayMemory`: tree memories
  includes metadata plus `photoAsset` / `audioAsset` CloudKit assets
- `PLUploadVideo`: video publish queue
- `PLFeedPost`: social posts
- `PLPostComment`: comments for posts
- `PLChatThread`: chat threads
- `PLChatMessage`: chat messages

The app also includes a one-time migration path from old single-record payload storage (`current.payload`) to this normalized schema.

### Xcode / Apple Developer configuration

1. Open target `PetLife` -> `Signing & Capabilities` -> add `iCloud`.
2. Enable `CloudKit` and select/create container `iCloud.<your-bundle-id>`.
3. Keep `PetLife.entitlements` in source control (already includes `CloudKit` and default container pattern).
4. Run app on a device/simulator signed in with Apple ID (for CloudKit access).
5. Create sample data by using the app flows, then open CloudKit Dashboard and deploy schema from Development to Production.

### Optional runtime switches

- Force memory backend (for UI-only debugging):
  - set environment variable `PETLIFE_BACKEND=memory` in your Xcode scheme.
- Use explicit container ID:
  - add `CLOUDKIT_CONTAINER_ID` to Info.plist (or Build Settings `INFOPLIST_KEY_CLOUDKIT_CONTAINER_ID`).

## Notes

- The project targets iOS 17 and uses SwiftUI + Observation.
- This environment cannot run Xcode, so the code has not been compiled here.
- If you continue on macOS with Xcode, the next practical step is wiring a real backend and media storage.
