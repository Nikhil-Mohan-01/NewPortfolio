# Plan for the retro night-drive camera treatment

Spec `specs/Retro_Filter_Codex_Instructions.md`
Branch `feat/retro-camera-filter`
Status done

## Goal

Soften and grade the existing cockpit and street image with a configurable analog-video treatment. Keep the existing camera, models, motion, bloom, and HTML presentation.

## Repository findings

The branch starts from the merged cockpit on GitHub main. Three.js 0.187 uses one WebGL renderer and one EffectComposer with a half-float scene target, up to 2× scene MSAA, existing linear HDR bloom and an ACES/sRGB OutputPass. The existing device pixel ratio caps are 1.5 and 1 for the standard and low tiers. The camera handles resize through its aspect ratio.

## Decisions

- Reuse the existing scene targets and add one compositing pass after OutputPass for display-referred grading and texture. Clean skips the new pass and restores the original render size.
- Keep the canvas at its existing pixel ratio. Scale the composer targets and use CSS-pixel units in the final shader. Preserve the existing low-tier resolution floor.
- Advance just the grain phase with visible, unpaused frame time. Preserve the existing street update.

## Milestones

- [x] Capture the unchanged cockpit at its paused start on desktop, high-DPI portrait and ultrawide.
- [x] Integrate and tune render scale, softness and color. Verify Clean with exact image comparisons.
- [x] Tune grain, vignette and edge color separation, then verify live motion, responsive framing, isolation, lifecycle and performance.

## Risks

Check the Three.js pass order and make the final shader write display values directly. Verify changing strength or bypass does not change the camera, canvas size or clean output. Test paused and reduced-motion grain, plus repeated transitions and resize.

## Progress

- 2026-11-14. Inspected the installed passes and captured the pre-change scene at identical preset positions and framing.

- 2026-11-14. Added the display composite, grade and scaled targets. Clean matched the original screenshots byte-for-byte in all three profiles. Strength zero and disabling the pass also matched Clean.

- 2026-11-14. Tuned low-amplitude grain, vignette, and edge separation against the paused and moving cockpit. Kept scanlines off by default and checked the optional setting.

## Verification

| Criterion | Evidence |
| --- | --- |
| Softness, readable silhouettes and preserved neon | Compared matched starting views at 1440 × 900, 390 × 844 at DPR 2 and 1728 × 648. Inspected the active drive and paused A/B after 4.5 m of travel. Softness and grading reduce sharp edges while retaining the direction of the road, window framing, interior gauges and colored sign cores. |
| Grain, scanlines and framing | Inspected static and moving Retro frames in Chrome and confirmed static pauses and changing grain against a held scene. Default scanlines are off. Enabled the optional desktop pattern briefly and kept it off in the preset. Low-tier captures stayed pixel-identical when edge and scanline settings were enabled in development. |
| True bypass and UI isolation | Clean, explicitly disabled, and strength zero match original captures byte for byte in all three layouts. A temporary opaque DOM button's text stayed pixel-identical when switching from Retro to Clean. The dev-only API and query settings were absent from a production browser run. |
| Motion and resize | At 32 m/s, Chrome sampled over 260 m and each of the eight street sections wrapped. Spacing stayed at 32 m while the car and camera matrices remained fixed. Verified the same eye and correct aspect after resize. Pause, zero speed, reduced motion and simulated visibility changes froze the grain. First resume delta was zero. |
| Resource lifecycle | Ten Clean/Retro cycles returned to the same 71 geometries and 53 textures at a fixed resized viewport. Two Vite reloads each returned to one canvas and one cockpit. Shader and app runs produced no browser runtime errors. |
| Performance | Headed Chrome 157 on an Apple M4 Pro MacBook Pro, standard tier at 1440 × 900, DPR 1, 6 m/s and the same first 12 m of travel. Clean averaged 75.0 FPS with a 13.7 ms p95 frame interval at a 1440 × 900 scene target. Retro averaged 75.0 FPS with a 14.0 ms p95 at 1177 × 736. Retro forced to 1440 × 900 averaged 75.0 FPS with a 14.1 ms p95. Browser frame intervals measure presentation cadence rather than GPU pass duration. Both profiles submitted 146 scene draw calls and 229,305 scene triangles, excluding postprocessing. |
| Build | Typecheck, lint and build passed. The production preview loaded the intended preset, remained still with reduced motion, resumed afterward, and presented one canvas. Vite retained its entry bundle size warning, now about 614 kB minified. Mobile and high-DPI checks used desktop emulation. |

## Final report

The pass, preset values and shader are in `src/app/retro`. The application owns frame timing, resize and teardown, with development controls exposed through the existing preview. See `README.md` for the exact settings and preview commands.
