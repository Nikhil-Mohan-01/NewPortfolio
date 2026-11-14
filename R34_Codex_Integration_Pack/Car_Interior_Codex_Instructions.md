# Codex instructions: integrate the R34 and driver-seat camera

## Goal

The existing Three.js portfolio scene already has a working, attractive, looping Tokyo-inspired street. Integrate the supplied Nissan R34 GT-R model so the visitor sees that same street from the driver's seat inside the car.

**Preserve the existing street's appearance and movement. Add a stationary car and a carefully positioned interior camera.** Complete the implementation and inspect it in the running website. Do not rebuild the street, redesign the site, or merely describe a solution.

The supplied asset is a complete car with interior and exterior. Inspect it before deciding that Blender edits are needed. A full car model is acceptable input. Do not assume the exterior must be deleted, that the model has correct scale, or that its meshes have useful names.

## Model drop location

In the repository, create this location if appropriate for its asset pipeline:

`public/models/r34/`

Recommended self-contained file:

`public/models/r34/r34.glb`

In frameworks that serve `public` at the web root, its runtime URL will normally be `/models/r34/r34.glb`; verify the project's actual base path and deployment configuration. Do not include `/public` in that URL automatically. If the project uses another asset convention, follow it and document the resolved location.

The user can drop the original GLB here unchanged. If it is a `.gltf` asset, copy its companion `.bin` and all texture files too, preserving their relative paths. Do not rename extensions to convert file formats. If the asset is an FBX, OBJ/MTL, or Blender file, inspect the supported tooling and explain any conversion needed; do not pretend it is a GLB. Prefer a local glTF/GLB delivery asset when conversion is practical.

Treat the original supplied asset as immutable. Put optimized or converted versions under a distinct filename, such as `r34-runtime.glb`, and preserve any attribution/license file. Do not upload the model to external conversion or hosting services.

If there is no car asset yet, create the folder and a short placement README, prepare only integration scaffolding that can fail gracefully, and report the exact expected file location. Do not download a substitute car or claim the integration is visually verified.

## Scope boundaries

Implement:

- Model loading, inspection, alignment, and rendering.
- A fixed camera placed at the actual driver's eye position.
- A convincing view of the existing moving street through the windshield and side windows.
- Necessary material, glass, clipping, and lighting fixes.
- Responsive framing and a small configuration surface for future tuning.
- A temporary development-only way to inspect and adjust camera position.

Do not implement dashboard apps, portfolio content, a Game Boy UI, steering-wheel interaction, public look-around controls, driving physics, wheel rotation, vehicle translation, head bob, camera shake, audio, rain, wipers, VHS effects, or a new city. Do not activate imported vehicle animations automatically.

The existing environment moves to simulate driving. The car and camera remain stationary in the same world coordinate system. Do not parent the car to a street chunk or move the car as well as the street.

## Inspect the project and model first

Read repository instructions and inspect the current framework, renderer, scene tree, camera ownership, lighting, controls, render loop, postprocessing, and asset-loading strategy. Reuse these. Do not create another canvas, another animation loop, or a competing default camera. Use installed package versions and verify their relevant APIs before writing code.

Inspect the supplied model and record a concise summary:

| Property | What to establish |
| --- | --- |
| Bounds and units | Overall dimensions, scale, wheel positions, lowest geometry |
| Axes | Up direction and the physical front of the car |
| Driver side | Actual steering-wheel/pedal/seat side; expect right-hand drive but verify the asset |
| Mesh structure | Body, cabin, seats, dashboard, wheel, glass, mirrors, wheels, optional hidden parts |
| Materials | Number, texture sizes, transparency, roughness, metalness, emissive elements |
| Runtime cost | File size, visible triangles, draw calls, textures and material count |
| Dependencies | Texture paths and any compression decoders required |
| Existing helpers | Imported cameras, lights, rigs, animations or environment objects |

Use model structure and visual inspection together. Mesh names are clues, not proof. Do not dump the entire mesh tree into the final report. Remove or disable imported cameras/lights from active use unless intentionally needed; do not let them override the established scene.

## Alignment and scale

Keep a parent transform dedicated to asset normalization. Preserve the model's internal transforms and hierarchy where possible. Avoid scattered unexplained offsets on many individual meshes.

1. Establish the real front of the car and align it with the existing scene's forward viewing direction. The previous street convention was negative Z forward and Y up; verify the implementation instead of assuming it still matches.
2. If the street uses metre-like units, scale the car to a plausible passenger-car size using the model's dimensions. A roughly 4.6 m length is an initial sanity check, not an instruction to override known model dimensions blindly.
3. Place the tyre contact plane at the road surface. Do not align the bottom of the body bounding box to the road if an antenna, helper, or unexpected component skews the bounds.
4. Centre the vehicle body in the single travel lane, while the camera is offset to the actual driver's seat.
5. Ensure road, curb, buildings, signs, and existing light volumes do not intersect the cabin.

Do not attach the car to the camera as a screen-space overlay. Keep both in one stable world arrangement so later camera rotation can produce correct interior parallax.

## Driver camera: the most important part

Place the camera where a seated driver's eyes would be. Use the driver's seat cushion/backrest, steering-wheel hub, windshield, and roof as geometric reference points. Do not use the car's bounding-box centre as the eye position. Do not position the camera in the rear seat just to fit more dashboard into the frame.

For a right-hand-drive asset, the wheel should sit ahead of the viewer on the right side of the cabin, with the centre console toward the viewer's left. Verify this from the actual model rather than relying on an X-axis sign. Do not mirror the whole model to change the driving side.

Tune the initial view to satisfy these composition goals:

- The wheel and upper dashboard form a clear foreground without covering the road's vanishing point.
- The windshield is the dominant viewing area; the neon street remains recognisable.
- The frame includes enough roof edge/A-pillars or door structure to clearly feel inside a car.
- The centre console can be partly visible for future dashboard work, but do not force the entire console into view with an extreme lens.
- The camera is behind and above the wheel, clear of the headrest, seat mesh, roof lining, and windshield surface.
- Road height feels natural; avoid a ceiling-mounted, bonnet-mounted, or rear-seat perspective.
- Keep the horizon level. A modest downward aim may help include the dashboard, but do not tilt toward the floor.

Start near a 55–65 degree vertical field of view, then tune for the actual geometry and viewport. Avoid extreme wide-angle distortion just to show every interior detail. A near plane around 0.02–0.05 m is a starting point for nearby interior geometry; balance this with depth precision and the existing far distance. Fix an incorrectly positioned camera rather than hiding the problem with an excessively tiny near plane.

Store eye position, look direction/target, field of view, near/far planes, and normalization transform in one clearly named configuration. Add comments explaining the model-specific choices. A temporary developer inspector may expose these values, but remove visible tuning widgets from the normal visitor view.

Verify camera changes against the driver's seat after all normalization transforms. If deriving a position from a mesh, convert between local and world coordinates correctly. Avoid overwriting the camera every frame in a way that would prevent future intentional look-around controls.

## Preserve exterior geometry intelligently

Keep exterior bodywork by default. Bonnet edges, pillars, door frames, and mirrors may be visible from inside and help sell the viewpoint.

If performance requires simplification, first identify genuinely irrelevant geometry: detailed engine internals, undercarriage hardware, hidden trunk contents, or duplicate meshes. Hide optional subtrees non-destructively only after checking the driver's view. Frustum culling does not eliminate all hidden interior/exterior rendering cost, so measure rather than assuming invisible parts are free.

Do not hide the entire body, roof, doors, front wheels, or windshield merely because they belong to an exterior group. Do not delete originals. If the model merges everything into one mesh and targeted removal is worthwhile, document a precise Blender cleanup task rather than using brittle material-name guesses.

## Glass, surfaces, and transparency

The moving street must remain clearly visible through the windshield. Preserve subtle tint and window boundaries without a large opaque grey/black sheet blocking the view.

Inspect existing windshield and side-window materials before changing them. Prefer the simplest glass treatment that looks convincing and works with the renderer. Physical transmission is optional, not mandatory; avoid expensive glass that looks dark or requires major render-pipeline changes.

If a lightweight transparent material is used, tune opacity/tint, depth writing, and render order only as required by the actual visual issue. Preserve depth testing. Avoid global rendering hacks and arbitrary ordering changes across the entire scene. Fix only the relevant glass materials, cloning shared materials first if necessary.

Check overlapping inner/outer glass layers and transparency sorting from the driver's view. Be alert for a hidden opaque tint layer, incorrectly oriented normals, or windshield meshes that disappear from inside. Do not make every material double-sided. Change side handling selectively only where physically sensible or necessary for the asset.

Preserve rubber, leather/fabric, plastic, metal, and painted trim as distinct surfaces. The dashboard should be mostly rough/dark and readable, not glossy chrome. Do not flatten the car's materials into one generic material. Keep existing gauges visually quiet; do not add a functional display or replace the dashboard UI in this task.

Mirrors may retain a simple subdued material or existing static appearance. Live mirror render targets are outside scope. Do not create a fake live mirror that misleadingly shows the wrong scene.

## Cabin lighting and neon integration

Preserve the existing street's palette, exposure, bloom, fog, and motion. Do not brighten the whole street just to reveal the interior.

The cabin should be dim but legible. Use restrained fill if needed to separate the steering wheel, dashboard, and pillars from complete black. Keep material texture detail visible in foreground shapes. Avoid a bright camera-mounted flashlight effect.

Passing pink/purple/blue signs should create gentle, coherent colour changes on the relevant side of the cabin. Reuse nearby street lights when that works. If a dedicated cabin fill is needed, drive its colour/intensity from nearby actual sign/light positions or the shared street travel state; do not create unrelated rainbow cycling.

Blend light contributions smoothly as signs approach and pass. Keep a small fixed light budget. Add no per-window or per-sign cabin lights, and no shadow-casting headlights for this phase. Fake spill is acceptable if visually subtle and disclosed in code comments.

Watch for light leaking through the roof/body when nearby unshadowed point lights are used. Keep spill restrained and directional where possible. Do not solve light leaks by enabling costly shadows on every street light. Avoid sudden lighting changes at chunk recycling boundaries.

Emissive dashboard elements and reflective trim should not turn into large bloom blobs. Adjust offending materials locally before changing global postprocessing. Use the existing colour-management and tone-mapping conventions consistently; avoid duplicate output conversion or guessing texture colour spaces without checking their role.

No VHS filter, artificial film grain, chromatic aberration, motion blur, or camera shake is needed to make this integration successful.

## Responsive behaviour, lifecycle, and fallback

Maintain the driver's eye location when the viewport changes. Update aspect ratio correctly. Use restrained breakpoint-specific FOV or aim adjustments only if necessary; avoid moving the camera outside the cabin on narrow screens. Check that the road remains visible in portrait view even if less of the centre console fits.

Preserve existing pause/reduced-motion behaviour. If the street is paused, the car and view should still render normally. Pause dependent light-spill animation with the street so signs and cabin illumination do not drift out of sync.

Use the project's normal loading/error approach. Keep the working street available while the car loads or if it fails. Do not block the entire site indefinitely behind a model-loading spinner. Report missing assets or unsupported compression clearly. Loading failure must not silently result in a successful completion claim.

Clean up resources owned by this integration on teardown without disposing shared cached assets used elsewhere. Avoid repeated material cloning or texture allocation in the frame loop. Ensure hot reload and remounting do not accumulate duplicate cars, lights, listeners, or animation loops.

## When Blender is actually needed

Do the initial integration first when the supplied format is usable. Recommend Blender only for a demonstrated issue such as:

- The asset is too heavy and needs mesh/texture reduction or selective hidden-geometry removal.
- Cabin geometry is missing, damaged, or has unusable normals/material assignments.
- The future interactive steering wheel or dashboard screen is fused into unrelated geometry.
- The source file requires conversion, texture relinking, or transformation cleanup that cannot be handled reliably in the current workflow.

Separating the steering wheel is not required for this fixed-camera phase. Do not delay this task for future interactions. If edits are necessary, identify the exact object/material and needed operation, retain an untouched source, and export a new runtime asset with textures intact. Do not ask for a full remodel when one local repair would suffice.

## Verification and delivery

Implement first, then inspect in the running website. Verify all of the following:

- [ ] The car loads from the repository's local asset path with complete textures.
- [ ] The driver side is verified from the actual model.
- [ ] Scale, road contact height, and forward orientation are sensible.
- [ ] The eye position is inside the driver's seat area with no clipping through roof, seat, wheel, or glass.
- [ ] The windshield is clear enough to see the established neon street.
- [ ] The car remains still while the road/buildings move backward at their existing speed.
- [ ] Street visuals and looping behaviour are preserved, including during at least one full recycle cycle.
- [ ] Cabin lighting is readable, restrained, and coherent with passing lights.
- [ ] Desktop and portrait views retain an unmistakable driver perspective and visible road.
- [ ] Pause, reduced motion, tab resumption, and resize still behave correctly.
- [ ] No duplicate cameras/canvases/render loops or console errors are introduced.
- [ ] Compare performance before and after at the same viewport, quality, and route; report measured conditions and any meaningful regression.
- [ ] Relevant existing build/type/lint checks pass, or limitations are reported accurately.
- [ ] No public UI, steering interaction, physics, or unrelated features were added.

Capture the actual default driver view and a portrait view for visual review when tooling allows. A successful asset-load event is not proof of correct camera composition. If runtime visual inspection is unavailable, state that and list the remaining manual checks.

Finish with a concise summary of changed files, model location, verified driver side, camera/scale tuning location, checks actually completed, and any specific Blender edits still recommended. Do not claim Blender is required without identifying a concrete asset problem.
