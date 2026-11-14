# Plan for the retro night-drive camera treatment

Spec `specs/Retro_Filter_Codex_Instructions.md`
Branch `feat/retro-camera-filter`
Status in progress

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
- [ ] Tune grain, vignette and edge color separation, then verify live motion, responsive framing, isolation, lifecycle and performance.

## Risks

Check the Three.js pass order and make the final shader write display values directly. Verify changing strength or bypass does not change the camera, canvas size or clean output. Test paused and reduced-motion grain, plus repeated transitions and resize.

## Progress

- 2026-11-14. Inspected the installed passes and captured the pre-change scene at identical preset positions and framing.

- 2026-11-14. Added the display composite, grade and scaled targets. Clean matched the original screenshots byte-for-byte in all three profiles. Strength zero and disabling the pass also matched Clean.

## Verification

Pending.
