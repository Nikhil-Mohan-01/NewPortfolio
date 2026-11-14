# Codex build instructions: retro night-drive camera treatment

## Objective

The portfolio already contains a working neon Tokyo street and an imported Nissan R34 with the camera inside the driver's seat. The scene currently looks too crisp and digitally sharp. Add a coherent, configurable retro camera treatment to the existing 3D rendering.

The desired atmosphere is a softly recorded late-night drive: understated analog-video texture, gently softened detail, slightly muted colours, luminous neon, subtle grain, and dark but readable interior surfaces. The user's mood reference is the atmospheric retro-camera feeling associated with Fears to Fathom. Treat that as a broad aesthetic cue, not an instruction to copy exact shaders, assets, or a particular game's settings.

Implement and visually tune the treatment in the actual scene. Do not stop after adding an untuned shader or describing a plan. The result should immediately feel less pristine while remaining comfortable to view as a portfolio background.

## Strict scope

- Preserve the car model, materials unless a specific bloom issue needs a local correction, driver-camera position, existing street geometry, driving illusion, road speed, controls, and responsive behaviour.
- Modify the 3D image presentation only. Do not rebuild the city, replace the car, move the camera to disguise visual problems, or redesign the website.
- Do not add dashboard apps, Game Boy UI, fake timestamps, REC text, tape borders, audio, camera shake, jump scares, rain, or new gameplay.
- Any HTML text, navigation, resume links, or future full-screen dashboard UI must remain crisp and unfiltered.
- Do not use a CSS filter on the page/body or a grain layer covering all page content. Apply the treatment inside the 3D pipeline or to an isolated scene layer beneath UI.
- This request authorizes the retro filter that earlier environment/car briefs deferred. Other scope boundaries from those stages still apply.

## Inspect before implementation

Read repository instructions and examine the installed renderer, framework, package versions, composer/effects, tone mapping, output colour conversion, antialiasing, pixel ratio, resize behaviour, and existing bloom. Reuse the current rendering architecture and dependencies wherever possible.

Do not introduce a second canvas, competing render loop, parallel effect composer, or another bloom stack. Do not upgrade packages or migrate rendering frameworks just to add this effect. Verify API usage against the installed versions and their documentation when needed.

Capture an unfiltered baseline from the same camera, viewport, quality settings, and street position that will be used for comparison. Provide a development-only way to toggle the complete treatment and freeze the scene for an honest A/B comparison.

## Art direction

The effect hierarchy is:

1. Slightly lower apparent resolving power and gentle softness.
2. A restrained colour grade and forgiving highlight response.
3. Fine, low-contrast analog-like grain.
4. Subtle edge vignette and very small edge colour separation.
5. Optional, nearly invisible scanline texture.

The first two should establish the look before grain is added. Do not try to create the entire aesthetic by putting noisy scanlines over an otherwise untouched sharp render.

The street must retain its pink/purple/blue lights, with occasional warm storefronts. Avoid washing everything into one purple colour, turning the image sepia, making it monochrome green, or making the scene look like a broken television. The Game Boy influence belongs to future UI work, not to this 3D scene's colour palette.

Keep the steering wheel, upper dashboard, windshield edges, road direction, building silhouettes, and luminous sign shapes identifiable at normal viewing size. The viewer should feel atmosphere rather than struggle to see.

## Starting parameters

These are artistic tuning targets, not API-specific values. Translate them to the project's actual shader/effect semantics. Pixel offsets below refer to final displayed CSS pixels unless explicitly noted; account for device pixel ratio and render-target size.

| Parameter | Initial target | Limit or guidance |
| --- | --- | --- |
| Master enabled | true | Must support a true bypass |
| Master strength | 0.65 | 0–1; zero should match the clean baseline |
| Scene render scale | 0.8 of baseline | Explore 0.7–1.0; don't blindly multiply an already low adaptive resolution |
| Softness | approximately 0.4–0.7 px apparent radius | Tiny, low-cost filter; preserve edges and silhouette |
| Saturation | approximately 0.88–0.94 of baseline | Neon retains colour, cabin doesn't become grey mud |
| Contrast | gently softened | Avoid a steep crushing curve |
| Exposure | preserve baseline initially | Only modest measured adjustment if needed |
| Grain amplitude | approximately 0.01–0.025 display-referred luminance | Very subtle; scale to the actual noise distribution |
| Grain update cadence | roughly 20–24 Hz | Scene animation stays at its existing frame rate |
| Vignette corner reduction | approximately 10–18% | Wide feather; nearly absent over the central road |
| Chromatic offset | 0 centrally, roughly 0.3–0.6 px at outer edges | Hard cap around 1 px; no obvious RGB doubling |
| Scanline modulation | off initially; up to about 1–2% if useful | Stationary, faint, no visible black striping |
| Geometric distortion | disabled | No barrel warp for the default version |
| Temporal ghosting/trails | disabled | No accumulation buffer needed |
| Brightness flicker/tracking glitches | disabled | Never required to achieve the look |

Choose the shipped values by viewing the real scene, not by treating this table as a guaranteed preset. Put final settings in one clearly named configuration module or object.

## 1. Reduced sharpness without unreadable blur

Slightly reduce the scene's internal resolving power, then upscale smoothly to the canvas's normal display size. Keep aspect ratio correct and update render targets on resize. Use smooth sampling; do not default to nearest-neighbour pixel blocks. The goal is soft analog-video detail rather than a pixel-art game.

A small, controlled blur/softening kernel can supplement this when necessary, but avoid stacking multiple blur passes. Keep softening separate from bloom. Dashboard edges and the road's vanishing point should remain clear. Do not simulate softness with depth of field, focus hunting, directional motion blur, or disabling all antialiasing and accepting jagged edges.

Thin signs, window grids, road texture, and the windshield frame must remain stable while moving. If resolution reduction causes shimmering, restore resolution or improve filtering rather than hiding it under grain. Texture minification and antialiasing must remain sensible.

## 2. Colour grade and highlight diffusion

Start with the existing exposure and lighting. Reduce saturation gently, soften excessive digital contrast, and use a subtle cool bias in shadows with warmer neutral highlights where appropriate. Keep black surfaces dark but preserve visible interior structure. Do not raise black levels so far that the cabin has a milky grey veil.

Neon should have a small bright core and a soft surrounding glow. Reuse and tune the existing bloom if it is already suitable. Avoid duplicating bloom or multiplying its intensity just because the image is meant to look retro. Pink and blue signs must not become featureless white blobs, and the steering wheel must not acquire a large glowing outline.

Distinguish bloom from blur: bloom diffuses bright light, while image softness reduces sharpness across the scene. Use both sparingly. Do not add real-time volumetric light effects or new scene lights as part of this filter.

Choose a documented colour-processing order based on the existing pipeline. Lighting and bloom should operate in the intended HDR/linear stage; tone mapping and display/output conversion must happen exactly once. Apply grading in its deliberately chosen colour domain. Display-like grain/scanline shaping must not accidentally be amplified by HDR bloom. If the framework fuses passes, implement the equivalent correctly in its supported colour domain rather than copying an incompatible pass order. Document this briefly in code.

## 3. Fine grain

Use predominantly monochrome, zero-mean procedural noise with small amplitude. It should be noticeable on inspection in middle tones but not compete with street motion. Keep it fine and evenly distributed, not giant noisy squares or coloured confetti. Reduce amplitude in deep shadows so black areas don't sparkle, and avoid excessive noise in bright sign cores.

Generate noise in the shader or reuse a small appropriate noise texture. Do not generate/upload a full-screen canvas texture every animation frame. Keep grain scale consistent across screen sizes and device pixel ratios. Ensure the grain is still subtle on a high-DPI screen and not coarse on a mobile device.

Update only the noise pattern at a modest cadence; do not quantize the car/street animation or camera to 20–24 fps. Avoid conspicuous periodic repetition, whole-frame exposure pulsing, or high-contrast temporal noise. If noise reads as flicker, reduce its amplitude/cadence or make it static.

## 4. Vignette and small chromatic imperfections

Use a broad, smoothly feathered vignette that subtly darkens outer corners. Keep the centre windshield and dashboard information area readable. It should not look like a black oval mask or cinematic letterboxing. Account for aspect ratio so the vignette behaves sensibly in portrait and ultrawide layouts.

Apply very slight chromatic separation toward the frame edges, with effectively none in the central area. Keep offsets resolution-aware. Do not offset the entire red and blue image visibly in opposite directions. Verify pillars and bright signs for distracting colour doubling. Clamp or safely sample UVs so edge offsets cannot expose bright borders or wrap the image.

Do not add barrel distortion by default. It may cause misleading cursor alignment if a future 3D screen is interactive, and isn't necessary for this brief. Future raycast interactions should retain their existing screen-coordinate mapping.

## 5. Optional scanlines

Only add scanlines if the above effects still need a little analog texture. Keep them low contrast and fixed rather than scrolling. No rolling bars, tearing bands, black scanline grids, or TV-static overlays.

Choose a stable frequency and filter it to avoid moire on different viewport sizes and pixel ratios. Disable scanlines on mobile or any configuration where they shimmer. It is acceptable to ship with scanlines off; the softness, grade, grain, and restrained glow should carry the effect.

## Configuration and UI isolation

Provide a simple integration interface for enabled state and strength, plus individual tuning values for render scale, softness, saturation/grade, grain, vignette, chromatic offset, and optional scanlines. Use uniforms/configuration updates rather than rebuilding materials each frame.

Suggested preset labels are Clean, Subtle, and Retro. These can be developer presets only; do not build a visitor-facing settings panel in this task. Default to a carefully tuned Retro preset that remains restrained. Clean should bypass the extra processing and restore the original render scale; strength zero must not silently leave reduced resolution, colour changes, or a vignette active.

The complete 3D cockpit and street share the treatment. HTML overlays remain outside it. Prepare an enabled/strength control for later full-screen dashboard transitions, but do not build those transitions now. A future reading view should be able to disable or fade the visual treatment without reconstructing the scene.

## Motion preferences and lifecycle

Preserve existing pause and reduced-motion behaviour. When reduced motion is requested, retain static grading/softness/vignette if desired but freeze animated noise and disable any temporal imperfections. If the site is paused, freeze the filter's animated state too so the view does not keep crawling. Resume without abrupt jumps or a burst of noise.

Pause updates when the document is hidden. Dispose owned effect materials and render targets on teardown, avoid duplicate event listeners, and don't dispose shared resources belonging to the existing renderer. Verify hot reload or remounting doesn't stack multiple copies of the filter.

## Performance

Prefer a lightweight composite effect for compatible colour operations rather than many separate full-resolution passes. Reuse the existing composer. Keep any blur kernel small and avoid temporal history buffers, optical-flow effects, motion vectors, or extra scene captures.

Offer a low-cost quality path that disables chromatic separation/scanlines and reduces optional softening while preserving the core grade and subtle grain. Align scene render scale with the existing adaptive-quality policy. Do not report improved FPS from a smaller render target without disclosing that resolution changed.

Measure before and after on the same device, viewport, route position, and quality conditions. Report the actual performance result rather than promising universal 60 fps. Avoid permanent frame-time debug widgets in the public view.

## Implementation sequence

1. Inspect the existing pipeline and record an unfiltered baseline.
2. Add a configurable, isolated postprocessing integration with a real bypass.
3. Tune mild resolution reduction/softness first.
4. Tune the grade and existing highlight diffusion while preserving the street's palette.
5. Add fine grain, then a subtle vignette and tiny peripheral colour offset.
6. Try faint scanlines only if they improve the result; leave them off if distracting.
7. Compare actual screenshots at identical paused scene positions and inspect movement in the browser.
8. Verify mobile, reduced motion, pause/resume, resize, lifecycle, and performance.
9. Run existing relevant build/type/lint checks and fix errors introduced by this change.

## Acceptance criteria

- [ ] The image immediately feels less pristine and digitally sharp, without looking out of focus.
- [ ] Driver-camera composition, road motion, car geometry, and existing street design are unchanged.
- [ ] Cockpit edges, street direction, building silhouettes, and sign colours remain readable.
- [ ] Neon retains bright coloured cores and restrained halos instead of white glowing blobs.
- [ ] Grain is fine and subtle; the scene does not flicker or look like TV static.
- [ ] No conspicuous RGB doubling, rolling bands, barrel warp, ghost trails, or heavy scanlines.
- [ ] No moire, edge wrapping, texture shimmer regression, or stretched effect on resize.
- [ ] DOM text and controls remain sharp and unaffected.
- [ ] Clean bypass restores the baseline appearance, including resolution and output colour.
- [ ] Pausing and reduced motion freeze temporal noise without breaking the scene.
- [ ] Desktop, portrait, and high-DPI layouts remain visually coherent.
- [ ] No duplicate composers, output conversions, bloom stacks, listeners, or resource growth.
- [ ] Build checks and measured performance are reported honestly.

Inspect stills and the live animation; screenshots cannot prove stable motion or lack of flicker. If browser verification is unavailable, explicitly list the visual checks that remain unverified. Do not claim to have matched a game exactly without an actual supplied reference and comparison.

## Final delivery

Summarize changed files, where to tune/disable the effect, the chosen preset values, the pipeline order, verification performed, and any performance or browser limitations. Provide same-position before/after views when available. Keep the implementation easy to adjust: the user should be able to request more softness or less grain without rewriting the rendering pipeline.
