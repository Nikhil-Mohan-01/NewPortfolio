# Codex instructions: bounded driver look and console camera reset

## Goal

The existing Three.js portfolio contains a stationary Nissan R34 interior, a driver-seat camera, a moving neon Tokyo street, and a retro postprocessing treatment. Add natural **hold-left-click-and-drag look controls** and a clearly identifiable **Reset View button attached to the centre console**.

Implement this in the actual project and verify it in the running scene. Preserve the current default driver view, car, road animation, lighting, retro treatment, and site layout. Do not rebuild the scene or replace the camera composition.

This task adds camera rotation only. It does not add steering, vehicle movement, orbiting, zoom, walking, dashboard apps, or a new UI system.

## Exact interaction contract

| Behaviour | Requirement |
| --- | --- |
| Start looking | Hold the primary/left mouse button on a non-interactive part of the scene and drag |
| Horizontal range | Yaw offset from -60° to +60° relative to the default driver view |
| Vertical range | Pitch offset from -45° to +45° relative to the default driver view |
| Sign convention | Positive yaw means looking right; positive pitch means looking up |
| Drag direction | Drag right to look right; drag left to look left; drag up to look up; drag down to look down |
| Eye position | Fixed at the existing driver's eye position; rotation only |
| Camera roll | None added; keep the established horizon level |
| Mouse release | Stop changing the target; retain the chosen view, with no automatic recentering or momentum |
| Reset | A dedicated console button returns yaw and pitch offsets to zero |
| Other mouse buttons | Do not rotate the camera; retain normal browser right-click behaviour |
| Scroll wheel | No camera zoom; retain existing page/overlay scrolling |

Both limits apply simultaneously. Looking diagonally must reach the allowed corner combination, such as +60° yaw and +45° pitch; do not replace these independent limits with a circular/conical combined limit. Use radians internally where appropriate, with clearly named degree values in configuration.

## Inspect and integrate first

Read repository instructions and inspect the actual framework, camera initialization, scene coordinate system, camera parents, render loop, existing controls, input handlers, postprocessing, and any UI/raycast interactions. Reuse the current framework and installed libraries; verify APIs against their installed versions when needed.

There must be one owner for the camera orientation. Remove or disable conflicting look/orbit handlers only where needed. If an existing frame loop repeatedly resets the camera's rotation or calls lookAt, refactor that specific ownership conflict rather than fighting it with another frame callback. Do not add another canvas, camera, or animation loop.

Use Pointer Events or the framework's equivalent integration so capture, cancellation, and input arbitration are reliable. Do not request pointer lock or fullscreen, hide the cursor, or rotate on hover.

## Preserve the default camera correctly

Capture a stable base pose after the car's normalization and driver-camera setup are complete. That base pose defines the reset destination. Do not capture the current dragged orientation as a new base during component rerenders, hot reloads, or resets.

Store look offsets separately from the base pose. Derive the orientation from the base pose and current bounded offsets instead of repeatedly accumulating rotations on the current camera quaternion. Avoid drift and angle wrapping errors.

Yaw should turn around the scene's established up axis; pitch should tilt around the resulting camera-right axis. Respect parent transforms and any initial camera downward aim. Positive/negative axes in Three.js must be mapped to the user-facing sign convention above; verify the visible result instead of assuming the raw Euler signs agree.

Use a deliberate yaw/pitch rig or a correctly composed quaternion solution. Do not blindly set camera.rotation.x/y without accounting for the base orientation and rotation order. Prevent unintended roll. The default may already include a slight downward look, so the requested +/-45° range is an offset around that default, not necessarily absolute world pitch.

Position remains fixed. Never orbit around the vehicle centre or steering wheel, and do not move the eye to avoid geometry. If the seat/headrest or roof clips at an allowed angle, inspect camera placement and nearby model geometry and report a specific issue; do not silently shrink the requested ranges.

## Drag calculation and angle limits

Use CSS-pixel pointer deltas so sensitivity is independent of device pixel ratio. A reasonable starting sensitivity is about 0.16 degrees per pixel for both axes, exposed in one config object for tuning. It must not depend on frame rate. Do not multiply pointer-event deltas by frame delta time.

On an accepted primary-button pointerdown, record the active pointer ID and initial position. Begin a look gesture only after a small movement threshold, approximately 4–6 CSS pixels. Once that threshold is crossed, apply movement smoothly without a noticeable jump. Only one active pointer may control the view.

Clamp target yaw to [-60, 60] degrees and target pitch to [-45, 45] degrees on every update. Update the stored pointer position even when clamped. This prevents a dead zone at a limit: dragging back from +60° must immediately start looking left, even if the user previously dragged far past the bound.

Pointer capture should keep an active gesture coherent if the cursor leaves the canvas. Handle pointerup, pointercancel, lostpointercapture, window blur, hidden-page transitions, and teardown so no drag gets stuck. If a move event indicates the primary button is no longer held, end the drag defensively. Capture only gestures that belong to the scene; do not steal pointer capture from UI controls.

For smoothing, use a short frame-rate-independent response, approximately 60–100 ms, with no velocity-based inertia. A suitable damping pattern is alpha = 1 - exp(-dt / tau), applied to current bounded yaw/pitch toward their targets. Keep dt and tau in consistent units. Clamp large dt after suspension. Avoid interpolating arbitrary Euler rotations across wrap boundaries.

On release, allow only the tiny remaining smoothing convergence; do not keep adding rotation from prior pointer velocity. Under reduced motion, remove or minimise smoothing and use direct intentional drag rotation. Do not block the user's ability to look just because environmental motion is paused.

## Input arbitration: drag must not activate a button

Separate camera dragging from intentional interaction with console controls and HTML overlays.

- If pointerdown hits a button, link, slider, text field, future dashboard screen, or another registered interactive target, that target owns the gesture; don't start looking.
- If pointerdown starts a scene drag, crossing a button while dragging must not activate it.
- Suppress a synthetic click following a completed look drag, scoped to that gesture. Don't suppress all later clicks globally.
- Activate the console reset only when pointerdown and pointerup form an intentional click on that control within the movement threshold, or through its keyboard activation.
- Hovering an interactive target must show the appropriate pointer cursor, not the look-drag cursor.
- Do not preventDefault or stop propagation across the entire document. Limit input handling to the scene and relevant controls.

Use default/grab while hovering a draggable scene surface and grabbing only during an active look gesture. Keep native selection and scrolling available inside readable page/UI content.

If raycasting manually, compute pointer coordinates from the canvas's actual bounding rectangle, not the entire browser window. Ensure hit testing matches any existing postprocessing distortion; the prior retro treatment should have no geometric warp, but inspect the actual pipeline. Do not introduce distortion in this task.

## Centre-console Reset View button

Place a small dedicated control on or just above a suitable free area of the centre console, close to the existing infotainment/radio area. Inspect the actual R34 asset before choosing a position. In a right-hand-drive cabin, this is usually toward the driver's left, but do not assume a specific world-coordinate sign.

Use an additive child object or anchored overlay so the original model remains intact. Avoid editing or overwriting its source mesh or texture just to add this button. Put the button's local position, orientation, and size in explicit configuration attached to a stable console/car parent transform.

Appearance:

- Compact dark charcoal button or plate with a simple recenter icon and **RESET VIEW** label.
- Restrained amber/cyan or the existing dashboard accent colour; match the current retro interior rather than inventing a bright floating modern card.
- Legible high-contrast text and a modest border or inset surface.
- Subtle hover/focus highlight and pressed response; no flashing, pulsing, or large bloom halo.
- Position flush with or slightly proud of a real console surface. Avoid z-fighting, clipping into knobs, blocking the dashboard screen, or floating in the windshield.

Choose the simplest robust method supported by the project: a world-anchored HTML button with correct depth/occlusion handling, or a small 3D control with raycast interaction plus an accessible DOM equivalent. Do not add a heavy UI library for a single button. If the physical label is postprocessed and becomes unreadable, adjust its size/material or use a crisp anchored UI layer rather than removing the whole scene's retro effect.

Provide a generous interaction target, approximately 44 by 44 CSS pixels in the default view where practical. If the visible physical button is smaller, a slightly larger invisible hit region is acceptable, but it must not intercept neighbouring console controls. Validate projection at actual desktop and mobile sizes; world-unit size alone does not establish usability.

The console button must be discoverable from the default driver view and move with the console's projected position as the viewer looks around. It must not behave like a fixed HUD element disguised as a physical button. Hide or occlude a world-anchored control when it is behind geometry or outside the view rather than letting it show through doors or pillars.

## Reset behaviour and recovery

Reset sets target yaw and pitch to zero and returns exactly to the original default pose. Use a short smooth transition, approximately 300 ms, with no overshoot and no camera-position/FOV change. With reduced motion, reset immediately.

Repeated activation must be idempotent. If a new intentional drag starts during reset, cancel the reset transition, synchronize the drag target to the current orientation, and continue from there without snapping. Do not let a late tween callback overwrite a subsequent drag.

A console-mounted button can leave the field of view at the requested extremes. Therefore also provide a minimal **Reset View** fallback outside the 3D camera's field of view: a small persistent screen-edge HTML control, styled discreetly, with an accessible name and visible keyboard focus. The console button remains the primary in-world control. Both use the same reset function. Do not add a full toolbar or settings panel.

Allow R as an optional reset shortcut only when focus is on the scene/control context and not in editable fields; do not intercept typing globally. Document the shortcut in the small scene hint if implemented. Keyboard Enter/Space must activate the HTML reset control normally.

For keyboard-only look access, make the scene focusable with a visible focus indicator and a concise accessible description. While the scene itself has focus, arrow keys can adjust yaw/pitch by a small step, such as 3 degrees, using the same bounds. Prevent arrow-key page scrolling only in that focused scene context. Do not trap focus; Tab must move to and from the controls normally.

## Hint and touch behaviour

Add one subtle, concise hint near the scene: **Hold left click and drag to look around.** It may fade after the first successful drag, but avoid a blocking tutorial or modal. Keep the reset recovery control available afterward.

Primary required interaction is desktop left-button drag. If the project supports touch viewing, provide one-finger scene dragging through the same angle logic and a tappable reset control. Do not globally disable touch scrolling. Choose a scoped gesture policy appropriate to the existing full-screen scene or embedded page; document the tradeoff and preserve scrolling on overlays and elsewhere. Multiple fingers must not introduce zoom or corrupt the active-pointer state.

## Configuration and architecture

Keep related values together: yaw/pitch limits, drag sensitivity, threshold, smoothing time, reset duration, console anchor transform, and keyboard step. Keep the stable base pose separate from transient drag state.

Use refs/mutable state for per-frame input and interpolation when appropriate to the framework; do not trigger a full React render on every mouse movement. Reuse temporary vectors/quaternions. Register listeners once per relevant lifecycle and remove them on teardown. Do not leave duplicate controls after hot reload or remounting.

Preserve the separation between environment pause and intentional look input. Pausing the street/retro animated grain should not immobilize the user's look controls. Conversely, changing the look angle must not restart a paused street.

## Verify all allowed views

Inspect the default view, four axis extremes, and diagonal corners. The entire interior and street may not yet have been validated at these angles. Ensure side walls, windows, and nearby street chunks remain convincing. If street recycling becomes visible at a side view, make the smallest coverage adjustment required without redesigning the city. Do not mask gaps by secretly limiting rotation.

Acceptance checklist:

- [ ] Left-button drag turns the view in the specified directions, with fixed eye position and no roll.
- [ ] Yaw reaches exactly -60° and +60°; pitch reaches exactly -45° and +45° as offsets from the saved default.
- [ ] Diagonal combinations work; repeated movement cannot accumulate beyond the bounds.
- [ ] Reversing direction at a limit responds immediately without an overshoot dead zone.
- [ ] Releasing outside the canvas, losing window focus, cancellation, and tab changes never leave the camera dragging.
- [ ] Hover, right click, wheel input, and ordinary UI clicks do not rotate or zoom the camera.
- [ ] Dragging across the reset button never activates it; intentional clicks do.
- [ ] The console button is visually attached, readable, and unobstructed in the default view.
- [ ] Reset returns to the original pose, never an arbitrary world orientation.
- [ ] Reset works from both extremes and diagonal corners through the persistent fallback even when the console is off-screen.
- [ ] Repeated reset clicks and a new drag during reset are stable and free of snapping.
- [ ] Keyboard access, focus, and reduced-motion behaviour work without interfering with editable UI.
- [ ] Camera range and button interaction still work after resize and on high-DPI displays.
- [ ] Car, road speed, lighting, retro filter, and paused state are preserved.
- [ ] No new clipping, see-through cabin walls, visible recycling, or incorrect glass appears at allowed angles, or any unavoidable asset limitation is explicitly reported.
- [ ] Existing relevant build/type/lint checks pass; no duplicate listeners or per-frame resource leaks.

Use meaningful interaction tests for bounds, reversal after clamping, drag-versus-click arbitration, and reset interruption where the project supports them. Inspect the running scene visually for framing and console placement. A build succeeding is not sufficient proof that controls work. If browser access is unavailable, state which visual/input checks remain unverified.

## Delivery

Summarize changed files, console button location, the shared reset function, the camera base-pose/configuration location, input shortcuts, and checks actually completed. Include a default-view screenshot showing the console button and an extreme-view screenshot when available. Deliver the feature, not a proposal for it.
