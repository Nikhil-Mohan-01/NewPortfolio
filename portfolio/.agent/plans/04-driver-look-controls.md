# Plan for driver look controls

Spec `specs/Driver_Look_Controls_Codex_Instructions.md`
Branch `feat/driver-look-controls`
Status done

## Goal

Add bounded cockpit rotation, a console-mounted Reset View button, and an accessible reset fallback. Keep the existing eye pose, scene, filter, and movement.

## Repository findings

GitHub main includes the R34 cockpit and retro filter. One perspective camera is initialized after the R34 loads. It has a slight initial aim in YXZ order, and the filter does not warp the scene. The canvas fills the page. There is no existing input controller.

## Decisions

- Keep pointer and keyboard offsets relative to the final initial quaternion. Integrate with the existing animation frame.
- Project an HTML reset control from the normalized car so its label remains crisp. Use a ray through the anchor to test cabin occlusion. Keep a separate screen-edge reset for recovery.

## Milestones

- [x] Implement bounded drag, keyboard look and reset state. Confirm thresholds, direction, limits and recovery in Chrome.
- [x] Place the console control, add gesture arbitration and inspect all permitted views. Verify resize, accessibility, lifecycle and existing build checks.

## Risks

The GLB cabin and lighting were tuned for a fixed view. Inspect the extremes at the actual eye position. Keep DOM click ownership independent of the look gesture and check for button occlusion.

## Progress

- 2026-11-16. Read the brief and branched from merged main.

- 2026-11-16. Verified direction, independent diagonal clamps, reversal, blur, alternate mouse buttons and scene keyboard look. Raycast the cabin to locate a blank panel below the existing radio.

- 2026-11-16. Mounted the reset on the lower radio panel and added the edge fallback. Verified both buttons, eight angle extremes, keyboard focus, reset interruption and touch emulation in Chrome.

- 2026-11-16. Finished narrow-layout sizing and checked the production build, live side-view recycling, stable renderer counts, and Vite reload.

## Verification

| Criterion | Evidence |
| --- | --- |
| Direction, range and preserved camera | Chrome confirmed the 5 CSS px threshold, correct signs, all four axes and all four diagonal limits at ±60° yaw and ±45° pitch. Dragging back at a clamp took effect on the next input. Position, FOV, roll and paused street position stayed unchanged. |
| Pointer lifecycle and arbitration | Exercised release beyond the canvas, loss of window focus, pointer cancellation, lost capture and a simulated hidden-page transition. Hover, right drag and wheel did not rotate or zoom. Dragging across the console button did not reset. A button press that moved and returned stayed canceled. The click after a scene drag was suppressed and an ordinary following click still fired. |
| Reset and keyboard | Both buttons returned to the exact saved quaternion. Reset worked at all eight extreme views. Checked repeated activation, the in-progress transition and interruption with a new drag. Scene arrows moved in 3° steps with keyboard focus. Tab reached the console then fallback, Space and Enter activated them, and arrow keys remained native in a test input. |
| Responsive and touch | At 1440 × 900 the projected console hit box was about 105 × 44 CSS px. Checked resize to 1050 × 760 and a 390 × 844 Chromium mobile emulation at DPR 2. Tested one-finger dragging and both reset buttons, and verified that the secondary finger did not rotate or zoom the camera. The console plate sits outside the initial portrait frame and appears when looking toward the radio. |
| Appearance and scene | Inspected starting, side, vertical and diagonal screenshots. The upward extremes are mostly dark headliner from the fixed driver's seat. The existing glass, cabin geometry, street, lighting and retro shader are unchanged. No visible cabin clipping or street seam was observed in the sampled views. |
| Runtime and resources | Held +60° during a headless Chrome 157 sample at 1440 × 900 and DPR 1 on an Apple M4 Pro. All eight chunks recycled over 260 m at 32 m/s with fixed car and camera transforms and continuous chunk coverage. Measured 60.0 FPS, 16.7 ms p95 and 80 peak scene draw calls in that sample. After warm-up, repeated sweeps and resets held at 71 geometries and 53 textures. Two Vite reloads each yielded one canvas, one hint and two reset controls. |
| Checks | Typecheck, lint and build passed. The production browser run changed the image on drag and matched the pre-drag screenshot after reset. The existing Vite entry-size warning remains at about 622 kB minified. Touch and visibility-event coverage used emulation. |

## Final report

The controller, shared reset and projected console control are in `src/app/driver-look`. The existing app initializes them after the cockpit loads and updates them through its single render loop. See `README.md` for controls and tuning.
