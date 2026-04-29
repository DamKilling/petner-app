# PetLife Technical Documentation Outline

> Scope note: this outline documents the SwiftUI iOS prototype only. The Next.js + Supabase Web app now lives under `web/` and should be documented separately from the iOS prototype.

## 1. Project Overview

PetLife is an iOS prototype built with SwiftUI and Observation. The project explores a pet life-cycle product shell that combines pet records, publishing, social discovery, and communication.

Confirmed facts:

- The current project includes core prototype flows for authentication entry, main Tab navigation, pet profiles, growth/holiday memories, video publishing, social feed posts, comments, and chat.
- The implementation is still at the prototype stage and mainly uses local in-memory data to simulate backend behavior.
- The project has not integrated a real external API, real account system, real media upload pipeline, or cloud database.

Unverified or planned items:

- This environment cannot run Xcode builds or simulator validation, so the project cannot be described as runtime-tested here.
- The complete main flow still needs to be validated in a macOS + Xcode environment.

## 2. Current Technology Stack

Confirmed facts:

- UI framework: SwiftUI.
- State management: Observation, with `AppModel` as the main state container.
- Target platform: iOS 17.
- Swift configuration: Swift 5.
- Bundle ID: `com.petlife.app`.
- Data layer: local `InMemoryPetBackend` actor that simulates asynchronous backend operations.

Unverified or planned items:

- The project currently does not use Firebase, Supabase, Firestore, Postgres, or a real custom API.
- The project currently does not integrate real image or video object storage.

## 3. Current Architecture

Confirmed facts:

- `PetLife/App/PetLifeApp.swift` is the application entry point and initializes `AppModel`.
- `PetLife/App/RootTabView.swift` handles loading state, authentication state, and the main Tab shell.
- `PetLife/Shared/AppState.swift` contains app-level state, session-related state, simulated backend operations, and business action orchestration.
- `PetLife/Shared/Models.swift` defines the domain models for users, pets, memories, videos, feed posts, comments, and chat threads.
- `PetLife/Features` is organized by feature areas, including Auth, Home, ChristmasTree, Video, Match, and Profile.

Suggested architecture data flow:

```text
Feature View
-> calls an async action on AppModel
-> AppModel calls InMemoryPetBackend
-> Backend returns BootstrapPayload or a business result
-> AppModel applies the updated state
-> SwiftUI refreshes the UI through Observation
```

## 4. Completed Progress

Confirmed facts:

- The authentication entry and authenticated main shell have been established. Unauthenticated users see the authentication view, and authenticated users enter the TabView shell.
- The pet profile flow supports prototype-level pet creation and owned-pet display.
- The growth/holiday memory flow supports memory creation and timeline display.
- The video module includes a prototype publishing form, upload queue, and published/review list presentation.
- The social module includes pet recommendations, feed posts, likes, comments, detail pages, and chat entry points.
- Recent fixes cover session cleanup, chat/detail routing stability, and opening the newly created post detail after publishing.

Unverified or planned items:

- The progress above is based on static review of code and project documentation. It has not been compiled, run in a simulator, or tested on a physical device in this environment.
- The timing between closing the publishing sheet and navigating to the newly created post detail still needs runtime validation.

## 5. Current Limitations and Risks

Confirmed facts:

- The current Windows/PowerShell environment does not recognize `xcodebuild`, so iOS compilation cannot be verified here.
- Data is mainly stored in memory and does not yet support persistence, cross-device sync, or real multi-user isolation.
- The media publishing flow is a prototype-level queue and presentation flow. It is not equivalent to real video file upload.
- Some Chinese text appears garbled in PowerShell output, so this environment cannot confirm that all UI copy renders correctly on device.

Unverified or planned items:

- Chinese copy, navigation stacks, sheet behavior, and Tab switching need to be checked in a macOS/Xcode environment.
- After a real backend is introduced, session isolation, chat thread ownership, post-detail routing, and comment persistence need to be revalidated.

## 6. Near-Term Technical Plan

Phase 1: runtime validation and regression checks.

- Build the project in a macOS + Xcode environment.
- Use the simulator to validate the main flows: sign in, sign out, add pet, add memory, publish video, open post detail, comment, and chat.
- Prioritize regression checks for session isolation, chat routing, post-detail routing, and local state refresh.

Phase 2: backend replacement boundary design.

- Preserve the View -> `AppModel` -> backend calling boundary.
- Define data interfaces for authentication, pet profiles, feed posts, comments, and chat threads first.
- Avoid making Feature Views depend directly on a specific backend SDK.

Phase 3: data persistence and media storage.

- Gradually replace in-memory data with a real database or cloud service.
- Design a separate media storage layer for video and image assets.
- Define the state transitions between local drafts, upload status, and remote media URLs.

Phase 4: minimum test and acceptance checklist.

- Create a manual acceptance script for course/demo review.
- Add regression checks for high-risk flows: data isolation after sign-out, opening the correct chat target, and opening the correct post detail.
- Record static review results and runtime verification results separately to avoid overstating delivery progress.

## 7. Verification Plan

Static review:

- Check whether the call chain between `AppModel`, `InMemoryPetBackend`, and Feature Views is consistent.
- Check whether model identity uses stable IDs instead of display text as system identity.
- Check whether publishing, comments, chat, and detail navigation can be traced to explicit target objects.

Build verification:

- Open the project in a macOS + Xcode environment.
- Run a clean build.
- Record compilation errors, warnings, and configuration issues that need follow-up.

Manual acceptance:

- Sign in and enter the main Tab shell.
- Add a pet and confirm that related screens update.
- Add a memory and confirm that the timeline updates.
- Publish a video and confirm that the queue or list updates.
- Publish a feed post, confirm that it appears in the feed, and try to open the matching detail page.
- Validate like, comment, and chat entry behavior once each.

## 8. Conclusion

Confirmed facts:

- PetLife currently has a SwiftUI iOS prototype shell that covers the main business modules.
- The architecture already has an initial separation between Feature Views, `AppModel`, and the local backend actor, which creates a foundation for future backend replacement.
- Recent work has focused on session isolation, routing correctness, and navigation completeness rather than broad feature expansion.

Unverified or planned items:

- The project cannot be claimed as compiled or runtime-tested in the current environment.
- The next stage should focus on runtime validation, persistence, media storage, backend replacement, and regression checks for critical flows.
