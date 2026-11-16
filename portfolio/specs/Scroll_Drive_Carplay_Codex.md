# Codex master update: scroll-driven portfolio and CarPlay navigation

## Objective

Update the existing Nissan R34 portfolio website with three changes:

1. Replace automatic driving with scroll-controlled movement.
2. Redesign the current dashboard to closely resemble the polished visual
   language and layout of Apple CarPlay.
3. Selecting Experience reveals an experience timeline along the right-hand
   wall of the street, which visitors explore by scrolling/driving past it.

Implement this in the existing project. Preserve the current car, driver-seat
camera, Tokyo street, lighting, headlights, music, and working look controls.

This brief supersedes earlier requirements for automatic driving and the
Game Boy-style dashboard. Existing verified portfolio content remains valid.

Video reference:
https://www.youtube.com/watch?v=lf9ZBsi24m4

The transcript was not available when this brief was prepared. Do not claim
to reproduce exact timing or techniques from the video without inspecting it.
Use the interaction requirements below as the implementation source of truth.

## 1. Inspect the existing implementation

Before editing, inspect:

- Current street movement and chunk-recycling logic.
- Car/world coordinate conventions.
- Camera ownership, look controls, and reset behaviour.
- Dashboard rendering and pointer-event handling.
- Existing portfolio content and navigation.
- HTML scrolling containers and global wheel handlers.
- Existing postprocessing, lights, and audio lifecycle.

Reuse the current framework and installed dependencies. Do not add a second
canvas, render loop, camera controller, or duplicate content data source.

Preserve unrelated work. Do not rebuild the city or replace the car model.

## 2. Core interaction

The visitor scrolls to drive forward or backward along a finite street route.

- Scroll down: move forward.
- Scroll up: move backward.
- Stop scrolling: stop driving after a short, smooth settling movement.
- Movement changes position along the road, not camera zoom or field of view.
- The car remains visually stationary while the street moves relative to it,
  if that matches the current architecture.
- Headlights remain attached to the car.
- Looking left/right does not change the direction of travel.
- No automatic forward motion remains.

Retain existing left-button-drag camera looking:

- Horizontal offset: -60 to +60 degrees.
- Vertical offset: -45 to +45 degrees.
- Eye position remains fixed during ordinary looking.
- Reset View resets camera orientation, not route progress.

Do not map scrolling to steering, camera pitch, or steering-wheel rotation.

## 3. Scroll implementation

Prefer one real, finite document scroll range for driving, with the 3D scene
in a sticky viewport. This gives native wheel, trackpad, touch, keyboard,
and scrollbar behaviour without recreating all scrolling manually.

If the existing architecture makes another approach materially better,
use it, but retain accessible keyboard/touch operation and explain the choice.

Define:

- targetProgress: the route position requested by scroll, from 0 to 1.
- renderedProgress: the smoothly interpolated visible route position.
- routeLength: total travel distance.
- travelDistance = renderedProgress * routeLength.

Derive progress from the actual available scroll range:

targetProgress =
  clamp(scrollOffset / max(1, scrollableHeight - viewportHeight), 0, 1)

Use frame-rate-independent damping with a short response, approximately
80–140 ms as an initial tuning range. Avoid long inertial drifting.

Under reduced motion, use direct or minimally damped positioning.

Do not use a timer to keep driving after input stops.
Do not multiply wheel deltas by frame delta time.
Do not apply both native scrolling and a second wheel accumulator.

Recalculate the scroll range after viewport changes while preserving the
visitor's logical route position.

Keep browser zoom gestures intact. Do not hijack Ctrl/Cmd + wheel.

## 4. Make the street reversible and deterministic

The previous forward-only recycling system may break when reversing.

Derive each visible street chunk's placement from absolute travel distance
and a logical chunk index. Use a seeded layout per logical chunk so revisiting
the same position produces the same buildings, signs, and panels.

Do not:

- Regenerate random buildings on every scroll.
- Advance chunks using only positive velocity.
- Accumulate position errors across repeated forward/backward movement.
- Recycle a panel while it is still visible through the side window.
- Wrap the route unexpectedly from the end to the beginning.

Keep enough street coverage in front of and behind the car for the existing
look limits. The route has a clear start and finish.

At the end, offer a simple Back to Start action. Reset View must not double
as route reset.

Expose route length, scroll distance, smoothing, and landmark positions in
one configuration location.

## 5. CarPlay visual redesign

Replace the current Game Boy treatment with a clean, convincing
CarPlay-inspired automotive interface.

Prioritize:

- Large colourful rounded-square app icons.
- Clear white labels below each icon.
- A dark, restrained wallpaper.
- A narrow side dock/status rail.
- Consistent icon dimensions and spacing.
- Smooth, subtle pressed and hover states.
- Modern readable typography.
- Carefully aligned margins and balanced proportions.

Do not use pixel fonts, green monochrome panels, thick retro borders,
cluttered outlines, or tiny labels in this redesign.

Use original portfolio-specific icons with CarPlay-like visual polish.
Do not use Apple branding or imply this website is an Apple product.

The scene may retain its retro camera treatment, but the dashboard's
interactive text and controls must remain crisp.

### App layout

Maintain eight useful apps in a desktop 4-by-2 arrangement:

Top row:
1. Projects
2. Experience
3. About
4. Resume

Bottom row:
5. Skills
6. Education
7. Contact
8. Music

Use recognisable icons:

- Projects: folder or layered cards.
- Experience: briefcase.
- About: person silhouette.
- Resume: document.
- Skills: code brackets or tools.
- Education: graduation cap.
- Contact: envelope.
- Music: musical note.

Each app must have a functioning destination. Do not add fake Phone, Maps,
or Messages apps simply because they appear in actual CarPlay.

The side rail can contain Home, an active-section shortcut, and the existing
music shortcut. Do not show fake connectivity or vehicle telemetry.

## 6. Mounting and usability

Preserve the existing screen's attachment to the centre console.

Tune its content layout before changing its physical placement. If the
screen is too small to use from the driver view, provide an accessible
Open Dashboard action that opens a larger launcher.

Do not require everyone to click a tiny in-world icon.

Use one shared app definition for both the in-car screen and enlarged
launcher. Avoid inconsistent labels or duplicate navigation state.

Ensure interactive controls own their pointer gestures:

- Clicking an app must not start camera dragging.
- Dragging across an app must not activate it.
- Scrolling inside a readable panel must not drive the car.
- Music sliders and buttons must not affect camera movement.

## 7. Experience app: street timeline

Clicking Experience activates an experience route along the RIGHT-HAND
side of the street, relative to the direction the car faces.

Determine that side from the actual scene orientation. Do not guess a
world-coordinate sign.

The right-side facades become a curated timeline containing three stops:

1. LG Energy Solution.
2. Paraverse Studios.
3. Code Ninjas.

Reuse the existing street rather than replacing it with a new environment.
Attach panels to suitable facade areas or tasteful roadside display frames.

The panels should feel like part of the street, not a page of tiny text
floating randomly in the air.

### Activation behaviour

On first activation:

1. Set the active section to Experience.
2. Reveal the experience panels with a short restrained fade.
3. Navigate smoothly to the beginning of the experience route.
4. Show a concise hint: “Scroll to explore my experience.”
5. Show route progress and an accessible list of the three stops.

Subsequent visits should restore the previous experience-route position.
Provide a separate Start Over action.

Do not introduce a second document-scroll system for the Experience route.
Use the same progress source, with section-specific landmarks or mapping.

Programmatic route navigation must update the scroll position and progress
together. Avoid a snap back when the next wheel event occurs.

When the visitor manually scrolls during a programmatic transition, cancel
that transition cleanly and continue from the current position.

## 8. Experience panel placement and readability

Use a deliberate visual rhythm:

- One employer per stop.
- Large employer name.
- Role and dates.
- One prominent outcome or contribution.
- A clearly labelled Read More action.

Do not put full resume paragraphs on distant walls.

Position panels near a useful side-window viewing angle, comfortably within
the existing +60/-60 degree look limits. Tune their forward offset, height,
and orientation from the actual driver's eye position.

Angle the display slightly toward the approaching driver if necessary.
Do not require the visitor to look 90 degrees sideways or through an
opaque pillar.

Keep the three stops spaced far enough apart to read individually.
Use configured positions rather than attaching them to arbitrary recycled
buildings.

Ensure:

- Panels stay anchored to their corresponding street locations.
- Reverse scrolling returns to the same panels.
- Panels do not show through the car, buildings, or windshield pillars.
- Neon and bloom do not wash out text.
- Headlight or street-light changes do not make text disappear.
- Interactive hit regions remain aligned with their visible panels.

Use a subtle contrast backing and readable text treatment. Do not make
every panel an enormous glowing billboard.

## 9. Experience content

Use the existing verified content module if it already contains these facts.
Do not create a second manually maintained version.

### LG Energy Solution

Role:
Software Engineer Intern (Cybersecurity)

Dates:
May–August 2026

Location:
Windsor, Ontario

Street-panel headline:
“Automated a 6+ hour process down to 1.78 seconds.”

Detail content:

- Built a Python invoice reconciliation pipeline that automated PDF
  extraction, field validation, and discrepancy detection.
- Designed and deployed a centralized auditing service using FastAPI,
  SQLite, Debian, and Caddy, with HTTPS/TLS and access controls.
- Built cross-platform security scanners using Python, PowerShell, and
  Bash across Windows, macOS, and Linux, with SHA-256 hashing and
  auditable reports.

Do not publish employer source code, internal addresses, or confidential
screenshots.

### Paraverse Studios

Role:
Software Engineering Intern

Dates:
January–April 2026

Location:
Remote / Toronto, Ontario

Street-panel headline:
“Shipped multiplayer features for an application reaching 7,000+ players.”

Detail content:

- Collaborated across engineering and design on gameplay improvements
  and integration issues.
- Built Node.js and WebSocket services for synchronized real-time player
  interactions and consistent game state.
- Implemented authentication, matchmaking, and session-state management
  through collaborative Git-based development.

Preserve team attribution. Do not claim sole authorship.

### Code Ninjas

Role:
Code Sensei (Instructor)

Dates:
July 2023–August 2025

Location:
Windsor, Ontario

Street-panel headline:
“Coding instruction and mentorship.”

Keep the detail view concise. Do not invent class sizes, quantified outcomes,
or additional accomplishments absent from the supplied content.

## 10. Reading an experience

Clicking Read More on a street panel opens an accessible HTML detail panel
or drawer with the complete experience information.

Opening it should:

- Preserve route progress.
- Stop driving input.
- Disable background look dragging.
- Move focus into the detail view.
- Allow ordinary scrolling inside the content.
- Provide an obvious close button.
- Support Escape to close.

Closing it should:

- Restore the same route position and camera orientation.
- Restore focus to the opener.
- Resume availability of driving controls without automatically moving.

Do not let scrolling an experience description also move the street.
Do not overwrite the visitor's music preference.

Provide a direct readable Experience list as an alternative to the street
timeline. Recruiters must be able to read all three roles without driving.

## 11. Camera behaviour around stops

Do not forcibly rotate the viewer's head on every scroll event.

Keep manual looking available during road exploration. Provide a small
View Stop action beside the current-stop navigation if needed; that action
may gently aim the camera toward the panel.

Any guided look must:

- Stay within the established look limits.
- Keep eye position fixed.
- Cancel cleanly when manual dragging begins.
- Skip animation under reduced motion.
- Never become a repeating auto-recenter loop.

A panel should be readable because of good placement, not because the
camera constantly fights the visitor.

## 12. Behaviour of the other apps

Keep the rest of the portfolio complete.

- Projects opens the existing readable project catalogue and detail views.
- About, Resume, Skills, Education, and Contact open their existing
  readable content.
- Music controls the existing shared player.
- Home returns to the launcher.
- Return to Car returns to the current road position.

Only Experience requires the roadside timeline in this task.
Do not expand every section into a separate 3D route before these core
interactions work reliably.

Preserve existing project descriptions, verified links, resume access,
email contact, and simple-view navigation.

## 13. Scrolling ownership and navigation

Use explicit interaction states, for example:

- Road exploration.
- Dashboard launcher.
- Readable app.
- Experience detail.
- Camera/route transition.

Only road exploration consumes scrolling as driving.

When an overlay locks the document:

- Save the current scroll position.
- Prevent background scroll without a visible layout jump.
- Let the overlay's content scroll normally.
- Restore the exact document position when closing.

Avoid blanket wheel prevention across the entire website.
Do not break browser zoom, keyboard focus, or touch scrolling inside content.

Provide accessible Previous Stop and Next Stop buttons. They navigate to
configured landmarks using the same progress system.

Keep direct navigation/deep links coherent with the active section. Reloading
an Experience link should open a useful experience view even if the 3D
model hasn't loaded.

## 14. Mobile and reduced motion

On mobile, prioritize the readable dashboard and experience list, with an
optional Explore the Street action.

If street exploration is enabled, vertical touch scrolling drives the route.
Avoid making the same single-finger movement simultaneously rotate the
camera and drive. Use a clearly separated look mode or retain a fixed
camera while touch-scrolling.

Under reduced motion, default to the readable experience list or discrete
stop navigation without a moving-camera sequence. Keep all content available.

Do not require precise 3D clicking to access any role, project, resume,
or contact information.

## 15. Performance and maintenance

- Derive street positions from route progress; avoid allocations every frame.
- Reuse buildings and materials with deterministic logical chunk indices.
- Keep panel count bounded.
- Avoid rebuilding text textures on every frame.
- Reuse one portfolio content source.
- Stop unnecessary scene updates when a fully opaque reading view is open.
- Preserve lighting and postprocessing quality rather than adding costly
  effects to compensate for poor composition.
- Clean up listeners, pointer capture, tweens, and owned resources.
- Verify remounting doesn't register duplicate scroll handlers.

Expose:

- Route length and scroll range.
- Scroll damping.
- Experience stop positions.
- Panel transforms.
- CarPlay spacing/icon sizing.
- Overlay transition timing.

## 16. Implementation order

1. Make existing road movement scroll-controlled and reversible.
2. Verify forward/backward movement and stopped behaviour.
3. Redesign the CarPlay launcher with eight working apps.
4. Add three right-side experience stops using existing content.
5. Add Read More overlays and direct Experience-list access.
6. Resolve scroll/camera/UI input conflicts.
7. Add mobile and reduced-motion behaviour.
8. Run production checks and inspect the actual website.

Do not spend the first implementation pass on ornamental animations while
core scrolling and content remain broken.

## 17. Acceptance checklist

- [ ] No automatic driving remains.
- [ ] Down scroll advances; up scroll reverses.
- [ ] Stopping input settles promptly with no ongoing drift.
- [ ] Reversing reproduces the same street and experience panels.
- [ ] Route ends are bounded and do not unexpectedly wrap.
- [ ] Look controls and Reset View retain their established behaviour.
- [ ] Headlights remain aligned with the car, not camera look direction.
- [ ] CarPlay has a polished 4-by-2 desktop layout with eight useful apps.
- [ ] Experience reveals the three roles on the correct side of the street.
- [ ] Panels are visible within the allowed camera range.
- [ ] Street text is concise; full content is available in readable HTML.
- [ ] Scrolling a detail panel never moves the street.
- [ ] Closing content preserves route position and camera orientation.
- [ ] Previous/Next Stop and direct Experience-list navigation work.
- [ ] UI interaction never accidentally triggers camera dragging.
- [ ] Mobile and keyboard users can access everything without 3D exploration.
- [ ] Reduced-motion mode provides complete content without forced travel.
- [ ] Existing resume, project, contact, and music actions still work.
- [ ] Production build and relevant checks pass.
- [ ] Actual forward/reverse movement and overlay transitions are inspected.

Test repeated direction changes, fast scrolling, scrollbar dragging, viewport
resize, interrupted navigation, opening/closing details at different stops,
and switching apps while near a route boundary.

A successful build alone does not prove these interactions work. If runtime
inspection is unavailable, report the specific remaining manual checks.

## Final handoff

Report changed files, configuration locations, implemented interactions,
checks performed, and any real limitations.

Include actual screenshots of the redesigned CarPlay and the Experience
street view when possible. Do not claim exact matching to the video unless
the video/transcript was actually inspected.