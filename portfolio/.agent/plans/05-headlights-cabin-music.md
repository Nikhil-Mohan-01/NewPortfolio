# Plan for R34 lighting and night-drive music

Spec `specs/Headlights_Cabin_Music_Codex_Instructions.md`
Branch `feat/headlights-cabin-music`
Status in progress

## Goal

Reveal the road and cabin with fixed R34 lights, and add a quiet, opt-in stock music loop.

## Repository findings

The existing driver-look commits are on GitHub and the checked-out branch. GitHub main still ends at the retro filter, so this branch builds on the driver-look branch required by this spec. The Three.js renderer has one composer, HDR bloom and an ACES output stage. The asphalt and cabin use textured physically based materials. Cabin darkness is concentrated in the interior material and road, with visible shadow detail in the existing grade.

## Decisions

- Mount symmetric spotlights and their targets under the normalized car in metres. Add one short-range warm cabin light with enough clearance from the road surface.
- Verify a stock loop against its creator's source before bundling. Keep audio independent of the renderer and start only from the music control.

## Milestones

- [x] Capture the baseline and tune the headlight/cabin rig against the moving road and cockpit.
- [ ] Bundle the licensed loop, wire opt-in playback and verify controls, seams and lifecycle.

## Risks

A lighting bump in the scene-wide exposure would wash out the city. Check for a hot foreground, bright facades, and cabin light leakage while turning the camera. Check the browser's actual loop, audio rejection and the movement threshold on audio button clicks.

## Progress

- 2026-11-16. Captured the existing paused cockpit at 1440 × 900, DPR 1, and probed the front lens vertices. Found CC0 source archive and confirmed author and license on the creator's asset page.

- 2026-11-16. Tuned two headlights with a shared beam mask to lower the wash on facades and a short overhead spotlight to reveal the wheel and dash. Compared desktop and side views at the existing camera pose.

## Verification

Pending.
