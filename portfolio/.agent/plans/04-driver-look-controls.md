# Plan for driver look controls

Spec `specs/Driver_Look_Controls_Codex_Instructions.md`
Branch `feat/driver-look-controls`
Status in progress

## Goal

Add bounded cockpit rotation, a console-mounted Reset View button, and an accessible reset fallback. Keep the existing eye pose, scene, filter, and movement.

## Repository findings

GitHub main includes the R34 cockpit and retro filter. One perspective camera is initialized after the R34 loads. It has a slight initial aim in YXZ order, and the filter does not warp the scene. The canvas fills the page. There is no existing input controller.

## Decisions

- Keep pointer and keyboard offsets relative to the final initial quaternion. Integrate with the existing animation frame.
- Project an HTML reset control from the normalized car so its label remains crisp. Use a ray through the anchor to test cabin occlusion. Keep a separate screen-edge reset for recovery.

## Milestones

- [x] Implement bounded drag, keyboard look and reset state. Confirm thresholds, direction, limits and recovery in Chrome.
- [ ] Place the console control, add gesture arbitration and inspect all permitted views. Verify resize, accessibility, lifecycle and existing build checks.

## Risks

The GLB cabin and lighting were tuned for a fixed view. Inspect the extremes at the actual eye position. Keep DOM click ownership independent of the look gesture and check for button occlusion.

## Progress

- 2026-11-16. Read the brief and branched from merged main.

- 2026-11-16. Verified direction, independent diagonal clamps, reversal, blur, alternate mouse buttons and scene keyboard look. Raycast the cabin to locate a blank panel below the existing radio.

- 2026-11-16. Mounted the reset on the lower radio panel and added the edge fallback. Verified both buttons, eight angle extremes, keyboard focus, reset interruption and touch emulation in Chrome.

## Verification

Pending.
