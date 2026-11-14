# Codex build brief: looping neon Tokyo street

## Task and strict scope

Implement a polished Three.js environment for a future portfolio website viewed from inside a Nissan R34 GT-R. **For this task, build only the road and the moving buildings on both sides, including their attached lighting and the minimal street-edge geometry needed to complete the scene.** The car will be integrated separately.

Create a straight, single-lane street at night. The camera stays in place while the environment travels backward, creating the illusion of driving forward. This should be a working, continuously looping scene, not a static mockup or an implementation plan.

Do not build or import a car, cockpit, steering wheel, dashboard, portfolio content, Game Boy interface, navigation menu, loading animation, game controls, traffic, pedestrians, intersections, branching roads, weather particles, audio, or a driving simulation. Do not change unrelated website content. No external city model is needed. Do not spend time reproducing an actual Tokyo street.

Inspect the existing repository and its instructions first. Reuse its framework, renderer, package manager, conventions, and installed dependencies. If it uses React Three Fiber, integrate with that; otherwise use its existing Three.js architecture. Avoid a framework migration or a second canvas/render loop. If no scene exists, create the smallest runnable preview needed to inspect this environment. Keep any preview controls development-only.

## Visual goal

A narrow Tokyo-inspired commercial backstreet after dark: compact mid-rise buildings, small storefronts, vertical illuminated signs, scattered warm windows, and damp asphalt catching pink, violet, and blue light. The atmosphere is quiet, nostalgic, slightly cinematic, and suitable for an R34 night drive. Think grounded urban architecture with restrained retro-game simplification, not a futuristic megacity or a neon tunnel.

The viewer should see a clear road converging toward a dark, hazy vanishing point. Buildings form an irregular corridor on both sides. Brightness comes from individual storefronts and signs, separated by darker stretches. Most wall area remains dark enough that the lights have contrast. Preserve readable building silhouettes and surface depth.

Priority order: convincing street composition; seamless motion; attractive lighting; performance; small decorative details. A few well-designed building variations are preferable to a large set of plain random cubes.

## Dimensions and coordinate convention

Treat one scene unit as approximately one metre. These are starting values to tune visually, not claims of real-world street standards.

| Parameter | Starting value |
| --- | --- |
| Road surface width | 3.6 m, exactly one travel lane total |
| Narrow pavement/edge strip | 0.55–0.9 m on each side |
| Curb height | 0.10–0.15 m |
| Building facade position | Approximately 2.4–3.0 m from road centre |
| Building frontage width | 3.5–7.5 m |
| Building depth | 5–11 m |
| Typical building height | 7–19 m, approximately 2–6 storeys |
| Occasional taller accent | Up to 24 m; avoid a skyscraper skyline |
| Street chunk length | Approximately 32 m |
| Initial chunk pool | 8 chunks, approximately 256 m total coverage |
| Camera position | Near (0, 1.15, 0), with adjustable eye height |
| Camera direction | Down negative Z; Y is up |
| Vertical field of view | Start around 60 degrees |
| Environment velocity | Positive Z, default 6 m/s |

Keep a centred preview camera for this task; expose lateral and height offsets for later right-hand-drive cockpit integration. Do not animate camera position, bob, shake, roll, or field of view. Keep the road straight and level. Use a sensible near clipping plane for future cockpit integration without an unnecessarily enormous far plane.

## Building design

Generate buildings from a small, deliberate library of procedural facade archetypes. Mix the following along both sides:

1. **Small restaurant:** narrow ground-floor entrance, recessed door, warm interior panel behind glass, dark awning, slim vertical sign, two or three relatively quiet upper floors.
2. **Electronics or arcade shop:** blue/purple horizontal fascia, a few luminous window panels, rectangular projecting sign, muted concrete above. Keep it believable in scale.
3. **Mixed-use apartment block:** grey-beige concrete, repeated windows, shallow balcony slabs or railings, occasional air-conditioning boxes. Few commercial lights upstairs.
4. **Closed shop:** corrugated-looking dark shutter, faded fascia, minimal illumination, one small warm window above. These create necessary visual rest.
5. **Older tiled storefront:** desaturated brown or off-white tiles, inset doorway, modest pink or amber lightbox, irregular upper windows.

Each building needs a ground-floor treatment, upper-floor rhythm, roof edge/parapet, and visible side walls. Use shallow geometric depth for door recesses, window frames, signs, awnings, and occasional balconies. Do not make every facade a flat textured rectangle. Model side faces sufficiently for future side-window views; avoid billboard facades that disappear when viewed obliquely.

Use charcoal concrete, muted grey-blue plaster, dirty cream tile, dark brick accents, and dark metal. Walls should be rough and mostly nonmetallic. Vary material subtly; do not randomly assign saturated colours to building bodies.

Compose facade bays consistently within each building. Approximately 20–35% of upper windows may be lit, arranged in believable small clusters rather than uniform checkerboards. Unlit windows should remain dim reflective blue-grey, not bright white. Lit rooms can vary gently between warm cream and subdued cool white.

Place roughly 4–6 frontages per side per chunk, packing them within the chunk bounds rather than allowing overlaps. Vary setbacks modestly and insert occasional dark gaps or recessed entrances; do not create full cross streets. Adjacent frontages must not intersect. Prevent signs, awnings, balconies, and lightboxes from intruding into the road's clear space.

Use a fixed seed for reproducible generation. Left and right sides must differ. Avoid repeating the same archetype more than twice consecutively. Alternate bright storefront clusters with quieter residential/shuttered stretches. The same distinctive sign should not recur every few metres.

## Signs and colour palette

| Role | Suggested colour |
| --- | --- |
| Sky/background | #070911 |
| Distance haze | #111426 |
| Main dark wall | #222632 |
| Secondary wall | #373943 |
| Asphalt base | #11151D |
| Hot pink accent | #FF4FA0 |
| Violet accent | #9868FF |
| Electric blue accent | #4D8EFF |
| Occasional cyan accent | #69DCEB |
| Warm interior accent | #FFD39A |

Treat these as artistic starting colours; tune exposure and intensity together. Most of the image should remain neutral/dark. Use pink, purple, and blue as local accents, with occasional warm interiors to prevent an entirely monochromatic purple scene.

Signs should include vertical lightboxes attached perpendicular to walls, flat fascia boards above storefronts, and occasional small neon outlines. Usually use one main sign and at most one supporting sign per storefront. Vary mounting height and size within believable limits. Not every building needs neon.

Use simple fictional shop names, symbols, or short labels. If Japanese lettering is used, use real text and verify the font can render it; do not display missing-glyph squares or random pseudo-Japanese characters. Generated canvas textures or an atlas are suitable. Keep signage secondary to the overall scene and use no real brand logos or external asset downloads unless already approved in the project.

## Lighting, diffusion, and glow

Distinguish three separate effects and implement each intentionally:

1. **Luminous source:** emissive sign/window materials make the source itself appear bright.
2. **Surface illumination:** a small number of actual lights or carefully placed baked/procedural light patches make nearby walls, pavement, and road pick up that colour. An emissive material alone must not be treated as if it lights neighbouring objects.
3. **Optical glow:** restrained bloom spreads the brightest light into a soft halo. Bloom does not replace surface illumination or atmospheric haze.

For a neon sign, retain a small bright coloured core, a narrow soft halo, and a much weaker broad falloff. The sign's shape must remain legible. Pink light should softly wash the immediate wall beneath/beside a pink sign, with intensity fading over roughly 1–3 m. Blue storefront light should spread outward across the pavement and slightly onto the adjacent road, without illuminating the whole block.

Use dim cool ambient/hemisphere fill to reveal silhouettes, paired with warmer storefront accents. Avoid lighting the entire scene evenly. Use about 4–6 active local lights near the camera on the default quality tier; do not attach a real point light to every window or sign. Choose/pool nearby lights and fade their contributions smoothly as sources approach or recede. Avoid sudden changes when selecting the nearest source.

Prefer no shadow-casting local lights initially. Use facade recesses, ambient shading, and contact-darkening details for depth. Add an expensive effect only if it has clear visual value within the performance budget.

Use the project's existing compatible bloom pipeline if present. Keep ordinary walls, road paint, and unlit windows below the bloom threshold; only luminous accents should glow strongly. Preserve colour instead of clipping all signs to white. Tune bloom by visual outcome rather than copying arbitrary intensity values between renderer versions. Avoid duplicate output/tone-mapping stages.

Add dark blue-violet distance fog: near storefronts remain distinct, buildings progressively lose contrast, and the far street dissolves into darkness. As a starting point, make fog perceptible around 35–50 m and essentially opaque by 130–150 m. Align background and fog colours to avoid a visible horizon band. Do not claim ordinary distance fog creates volumetric light beams. Real volumetric lighting, heavy god rays, and screen-wide purple mist are outside scope.

If a simple soft glow card is needed for a local fixture, keep it small and restrained, with suitable depth behaviour and no visible rectangular border. Do not stack dozens of oversized transparent planes over the camera view.

Do not implement a VHS/retro postprocessing filter yet. The future site may add one, but this environment must look good without grain, pixelation, chromatic aberration, distortion, flicker, or motion blur hiding its weaknesses.

## Road and surface response

Build one continuous, narrow travel lane with thin edge markings or occasional subtle worn paint. **Do not add a centre divider:** it would visually imply two lanes. No highway median, guardrails, wide boulevard, intersection, or decorative neon lane stripes.

Use dark, slightly damp asphalt with restrained fine-grained surface variation, sparse patches, and mild roughness variation. The road must not resemble a perfectly polished mirror, bright plastic, or flat featureless black plane. Avoid excessive microdetail that shimmers while moving.

Add soft, broken pink/blue/violet reflections or light spill beneath corresponding storefronts. These should be strongest near the light source and fade toward road centre. Use irregular, low-contrast elongated patches, not sharp mirrored text. A controlled fake reflection/light-spill technique is acceptable; do not introduce real-time planar reflections or screen-space reflections for this version.

If using decal/overlay patches, avoid z-fighting and visible rectangular edges. Their position and colour must track the originating building in the same moving chunk. Differentiate an artistic spill approximation from a physically accurate reflection in implementation comments.

Road, curbs, facade bases, texture motion, signs, and their light patches must all agree on movement speed and direction. If road texture scrolling substitutes for moving geometry, derive its phase from the same world travel distance, and do not apply both motions to the same pattern. Match road texture repeat and chunk length so seams remain invisible.

## Movement and seamless recycling

Use a finite pool of chunks. Each chunk contains its road section, edge strips, left/right buildings, attached signs, and associated local spill effects. Move these together toward positive Z at the same world speed. Perspective should naturally produce faster apparent motion for nearby objects; do not independently accelerate nearby buildings.

Use frame-rate-independent movement from elapsed time. Clamp large frame deltas after a suspended tab resumes to avoid sudden jumps. Expose speed with a default of 6 m/s and an approximate tuning range of 3–10 m/s. Speed zero must freeze all environment motion without geometry resets.

When a chunk is completely behind the visible camera region, place it exactly one chunk length beyond the furthest forward chunk. Preserve spacing. Do not teleport a chunk while any of it remains visible. Support future bounded side-looking views by retaining enough coverage behind the camera and recycling only beyond the intended view envelope; approximately 50–65 m of rear coverage is a reasonable starting point. Do not promise unrestricted rear-facing viewing with an insufficient chunk pool.

Do not regenerate textures, geometry, random seeds, or React state each frame. Prefer reusing the same seeded chunk designs for the initial version. Make the loop long and varied enough that repetition is unobtrusive. Use fog to conceal forward insertion, while ensuring road geometry always covers the entire visible distance. No holes, overlapping road slabs, facade popping, or lighting jumps at chunk boundaries.

## Integration and performance

Keep the environment modular, with a small public interface for speed, paused state, seed, quality, fog, palette, and lighting intensity. Suggested responsibilities: street configuration; seeded facade generation; chunk management; material/texture creation; lighting; and the preview wrapper. Adapt file names and component structure to the repository rather than imposing a new architecture.

Keep camera and application UI ownership outside the reusable environment. Do not mutate global scene fog, renderer settings, or postprocessing without respecting the existing setup and restoring owned changes on teardown. Document any scene-level integration requirements. Dispose only resources owned by this module and avoid breaking shared materials/textures.

Reuse geometry/materials and instance repeated windows or trim where practical. Reuse generated textures or an atlas. Avoid hundreds of unique materials and high-resolution textures for tiny signs. Bound pixel ratio by quality tier; reduce bloom resolution and decorative density on weaker devices. Keep the street appearance coherent when bloom is reduced or disabled.

Aim for smooth 60 fps on the available ordinary desktop test device, with an adjustable lower-cost tier; report actual measured results and device/viewport conditions rather than guaranteeing performance everywhere. Start with an approximate scene budget below 150–200 draw calls and 200k visible triangles, excluding postprocessing passes; revise only with evidence. Keep resource counts stable over repeated loops.

Pause when the page is hidden. Respect reduced-motion preferences by showing a stationary street by default. Expose pause/resume for the host website's future accessible controls, but do not build a public dashboard or settings interface in this task.

## Implementation sequence

1. Inspect the project and establish the smallest isolated street preview or development route.
2. Build the road, curbs, camera composition, and one complete detailed chunk.
3. Create the facade archetypes, window patterns, signs, and constrained seeded variation.
4. Tune dark materials, local illumination, coloured road spill, restrained bloom, and fog.
5. Duplicate into a finite chunk pool and implement continuous recycling.
6. Validate front and oblique side views, then tune repetition and performance.
7. Run the existing relevant build/type/lint checks. Fix failures caused by this work without unrelated refactoring.

## Acceptance criteria and verification

- [ ] Exactly one straight travel lane, with believable building rows on both sides.
- [ ] A clear vanishing point, irregular building heights, and recognisable storefront/upper-floor structure.
- [ ] Pink, violet, and blue signs with restrained local glow; occasional warm windows.
- [ ] Buildings are mostly dark neutral materials rather than giant glowing boxes.
- [ ] Sign cores remain visible inside their halos, and nearby surfaces receive plausible matching colour spill.
- [ ] Road has subtle damp surface variation and coloured light patches without becoming a mirror.
- [ ] Fixed camera and backward-moving environment convincingly suggest forward travel.
- [ ] Road patterns, buildings, signs, and spill stay spatially synchronised.
- [ ] At least two full recycling cycles inspected, including at an increased debug speed; no visible popping, gaps, jumps, or repeating-frame stutters.
- [ ] Side views at approximately 45–70 degrees yaw retain convincing facades and coverage.
- [ ] Pausing freezes the scene; resuming and returning from a background tab do not cause a large jump.
- [ ] Reduced-motion preference produces a stationary initial scene.
- [ ] Resize and a narrow/mobile viewport render correctly without stretching; no full mobile UI is required.
- [ ] No unbounded growth in chunk, material, texture, or geometry counts across repeated loops.
- [ ] No car, portfolio interface, gameplay, audio, weather, or unrelated features were added.
- [ ] Relevant existing checks pass, or remaining limitations are explicitly reported.

Use screenshots from the actual implementation to inspect the default forward view and an oblique view. Verify animation in the running page; a still screenshot cannot establish seamless looping. If browser/runtime verification is unavailable, state that clearly instead of claiming visual validation.

When finished, report the files changed, how to run the preview, the main tuning parameters, checks actually performed, and any remaining visual/performance limitations. Leave the result ready for later cockpit integration without building the cockpit now.
