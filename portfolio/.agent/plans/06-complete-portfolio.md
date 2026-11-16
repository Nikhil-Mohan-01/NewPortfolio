# Plan for the complete portfolio

Spec `specs/MASTER_Portfolio_Completion_Codex.md`
Branch `feat/complete-portfolio`
Status done

## Goal

Ship a complete factual portfolio that opens from the R34 console and remains fully readable without loading the scene.

## Repository findings

The lighting and music branch contains the latest complete cockpit, including driver look. GitHub main still ends at the retro filter, so this branch starts from the lighting and music branch. Vite, strict TypeScript, Three.js and the existing repo scripts are sufficient. The original one-page resume was found and its three embedded profile/project URLs match the brief.

## Decisions

- Build a typed shared content catalogue and a semantic HTML hash-routed dashboard.
- Load the cockpit on demand, reuse one render loop, and mount a projected console launcher in the original radio display area.
- Share one audio player and control panel between the cockpit and Music app.
- Publish source milestones to GitHub. No deployment configuration was found in the checkout. GitHub returned no deployment records, and Vercel denied access to verify the project scope.

## Milestones

- [x] Deliver content, shareable routes, launcher, resume and contact.
- [x] Integrate the real console and transition, restore the driver view and keep independent reading access.
- [x] Exercise desktop, mobile, failure, navigation, and production flows. Document findings.

## Risks

The radio is small at the default driver pose. Maintain a persistent full-size dashboard shortcut and verify screen placement against model geometry. Route changes can interrupt a camera transition, so settle from the latest navigation intent. Keep the model load separate from core content.

## Progress

- 2026-11-16. Inspected the repository and current reference, located the authorized resume, and checked external destinations.

- 2026-11-16. Built the eight-app launcher, typed content and hash-routed sections. Verified all project details, original PDF response and download, email fallback, music navigation and portrait reading in Chrome.

- 2026-11-16. Mounted the console launcher and added camera handoff in the existing loop. Chrome verified direct Projects and Experience launches, exact pose/focus restoration, browser Back, and a stationary hidden scene.

- 2026-11-16. Ran transition, mobile, slow and failed asset, context loss and nested-base production checks. Captured the final cockpit, dashboard and portrait views.

## Content sources

- The master brief supplies all user-approved public copy, ordered content, dates and metrics. Its older-site reference is https://nikhil-mohan.vercel.app/. The verified original one-page resume was copied unchanged into `public/resume`.
- The PDF embeds the listed GitHub, LinkedIn and ProtoMind destinations. ProtoMind, Activity Center, GitHub, Steam and the exact Smart Model Router Marketplace page responded successfully. YouTube resolved the supplied video, and its oEmbed response confirmed the title. LinkedIn blocked automated access, so the PDF-backed destination remains. The earlier Azure portfolio returned HTTP 403, so its catalogue entry has no live-site button.
- The three project covers are original CSS diagrams, representing CAD geometry, routing and the board game. They are decorative project identifiers.

## Verification

| Criterion | Evidence |
| --- | --- |
| Desktop cockpit and eight apps | Inspected the finished radio-mounted launcher at 1440 × 900. Chrome opened Projects and Experience directly from their in-car buttons and verified the desktop reading order. The dashboard shortcut, Simple View, Resume and Contact remain in the cockpit overlay during model loading. |
| Factual content and working links | Visited all eight project detail routes, verified their real description and stack, and checked External/Resume/Contact actions. The exact bundled PDF served as `application/pdf` and downloaded under the expected name. Normal clipboard and selection-based copy fallback both passed. |
| Navigation and camera | Checked direct project URLs, reload, Back and Forward, internal section switching, Escape levels, an interrupted entry and exit, and rapid hash changes. Return restored the exact saved eye and quaternion and the original console focus. Both paused and running scene states were retained. |
| Input, accessibility and reduced motion | Dragging across the projected launcher did not activate it. Verified section focus and inactive cockpit tab isolation. Reduced motion skipped the flight. Emulated portrait at 390 and 320 CSS px provided readable content and an optional working car view. |
| Rendering and failure | No scene draw or travel occurred in the opaque dashboard. Deep links issued no request for the engine or GLB. Simulated unavailable WebGL, context loss, and a delayed then missing GLB with working reading access. |
| Shared music | One persisted music UI and one audio file request while opening Music, exploring the car, then reopening Music from the physical console. Browser playback state survived without a restart. |
| Build and deployment | Lint, strict typecheck and production build passed. Chrome loaded the production app at a custom base path and verified the identical PDF bytes, direct URLs, history, opt-in music and no runtime errors on successful paths. The lazy entry is about 28 kB minified. Vite retains the warning for the 624 kB optional 3D bundle. No preview or production deployment verified for this branch. |

## Final report

Dashboard and routing live in `src/app/dashboard` and `src/app/entry.ts`. The projection and camera sequence are in `src/app/console`. See the README for direct routes, controls and asset locations. The feature branch includes the preceding driver-look and lighting/music work because those branches are not yet merged into main.
