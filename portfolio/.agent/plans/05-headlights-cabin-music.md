# Plan for R34 lighting and night-drive music

Spec `specs/Headlights_Cabin_Music_Codex_Instructions.md`
Branch `feat/headlights-cabin-music`
Status done

## Goal

Reveal the road and cabin with fixed R34 lights, and add a quiet, opt-in stock music loop.

## Repository findings

The existing driver-look commits are on GitHub and the checked-out branch. GitHub main still ends at the retro filter, so this branch builds on the driver-look branch required by this spec. The Three.js renderer has one composer, HDR bloom and an ACES output stage. The asphalt and cabin use textured physically based materials. Cabin darkness is concentrated in the interior material and road, with visible shadow detail in the existing grade.

## Decisions

- Mount symmetric spotlights and their targets under the normalized car in metres. Add one short-range warm cabin light with enough clearance from the road surface.
- Verify a stock loop against its creator's source before bundling. Keep audio independent of the renderer and start only from the music control.

## Milestones

- [x] Capture the baseline and tune the headlight/cabin rig against the moving road and cockpit.
- [x] Bundle the licensed loop, wire opt-in playback and verify controls, seams and lifecycle.

## Risks

A lighting bump in the scene-wide exposure would wash out the city. Check for a hot foreground, bright facades, and cabin light leakage while turning the camera. Check the browser's actual loop, audio rejection and the movement threshold on audio button clicks.

## Progress

- 2026-11-16. Captured the existing paused cockpit at 1440 × 900, DPR 1, and probed the front lens vertices. Found CC0 source archive and confirmed author and license on the creator's asset page.

- 2026-11-16. Tuned two headlights with a shared beam mask to lower the wash on facades and a short overhead spotlight to reveal the wheel and dash. Compared desktop and side views at the existing camera pose.

- 2026-11-16. Added the CC0 stock MP3, lazy Web Audio player and native controls. Checked gesture ownership, pause and mute intent, one decode, retry, and two native-speed loop boundaries in Chrome.

## Verification

| Criterion | Evidence |
| --- | --- |
| Lighting and glass | Inspected matched forward and side images in Chrome. The warm beams reveal asphalt texture, curbs and lower storefronts with a soft upper edge. The overhead fill reveals the steering rim and upper console while the glass stays clear. Measured symmetric mounts at X ±0.62 m, Y 0.677 m, Z −2.095 m, with targets along −Z and below each lamp. No shadow maps were added. |
| Motion and scene preservation | Turned the driver camera 60° and verified the lamp and target matrices did not move. Reset restored the exact camera quaternion. In the 32 m/s run, all eight sections recycled once over 260.26 m with continuous 32 m spacing and fixed light transforms. The existing street, cockpit model, retro code and package versions are unchanged from the driver-look branch. |
| Stock asset | Creator's OpenGameArt page and original archive both state CC0. Converted the lossless stock loop to a 2.22 MB MP3 and added 6.5 dB of mastering gain. Chrome decoded 5,927,040 frames at 44.1 kHz, matching the original 134.4 s. |
| Playback and controls | Verified no audio request or context before activation. Keyboard, mouse and emulated high-DPI touch exercised play/pause, mute and volume. One file request and decode served repeated starts, with a maximum of one active source. Camera drag across controls and Reset View did not start or restart playback. Simulated visibility changes paused playback and resumed only previously audible playback. Injected a rejected resume and HTTP 404, then recovered with Retry. Two Vite reloads returned to one music group and one canvas. The production build served and played the MP3 from a custom base path. |
| Loop inspection | Rendered two consecutive wraps at native speed with Chrome Web Audio. Both boundaries had an identical left-channel sample step of 0.00177 full scale. The 100 ms RMS windows before and after each boundary differed by about 0.6 dB. The waveform showed no padding gap. Direct subjective listening was unavailable in this session. |
| Performance | Headed Chrome 157 on an Apple M4 Pro MacBook Pro at 1440 × 900, DPR 1 and standard quality with the same paused position. Five-second samples were about 120 FPS and 8.4 ms p95 both before and after. Both reported 146 peak scene draws and 229,305 triangles. The rig adds one shared beam texture. Frame intervals measure delivered cadence, not isolated GPU shader cost. |
| Build | Typecheck, lint and production build passed. Vite's existing entry bundle warning remains at about 627 kB minified. |

## Final report

Lighting lives in `src/cockpit/lighting.ts` and `src/cockpit/lighting-config.ts`. Music playback, controls and settings live in `src/app/music`, and gesture handling is shared with the scene reset. The local track, attribution and replacement guide are in `public/audio`.
