# Codex instructions: headlights, readable cabin, and looping night-drive music

## Goal and existing context

The portfolio already has a stationary Nissan R34, a driver-seat camera, moving neon Tokyo buildings and road, retro postprocessing, bounded left-button-drag looking, and a console Reset View control. Improve this existing experience by adding:

1. Two believable headlights shining ahead onto the road.
2. A modest increase in cabin illumination so the wheel, dashboard, and console are easier to see.
3. Quiet, looping stock background music matching the night-drive atmosphere, with a simple path for a later custom track.

Implement the feature in the actual project. Preserve the existing scene composition, look limits, reset behaviour, moving-street system, retro treatment, and unrelated website content. Do not replace the car, rebuild the road, add driving physics, create a music player application, or introduce engine noise, traffic sounds, rain, or horn effects.

## Inspect before changing anything

Read repository instructions and inspect installed rendering/audio libraries, the car hierarchy, normalization transforms, existing lights, exposure, tone mapping, bloom, road materials, camera controls, pointer arbitration, and current UI conventions. Reuse the existing architecture and dependency versions. Verify APIs where necessary rather than copying settings from incompatible library versions.

Capture the current default camera view and note the current lighting configuration before editing. Establish whether the darkness comes from insufficient illumination, incorrect material response, exposure, or the retro grade crushing shadows. Make targeted fixes; don't blindly increase every brightness control.

## Visual target

The road directly ahead should be noticeably easier to read. Two overlapping, broad headlight pools should extend down the lane and fade naturally into the dark street. The wheel, dashboard, door trim, and reset control should become legible without making the cabin look like a brightly lit showroom.

Preserve neon contrast: pink, purple, and blue signs remain prominent, distant buildings remain atmospheric, and warm headlight illumination complements the cool city lighting. Keep near asphalt detail rather than burning it out to white. Maintain dark shadow areas and material texture.

## Headlight implementation

### Placement and orientation

- Inspect the actual front headlamp meshes and position two light sources at the left/right lamps in the normalized car's local space.
- Parent the headlight rig to the stationary car, not to the camera or a moving street chunk.
- Verify the physical front of the asset and the scene's forward direction; do not assume coordinate signs without checking.
- Aim the beams forward and slightly downward toward the road. They must not follow the viewer when looking left, right, up, or down.
- Keep the light targets in a well-defined coordinate space and update their transforms correctly. A light attached to the car and a target in a different parent space must not silently aim the wrong way.
- Ensure the sources are not buried inside an opaque bumper/headlamp mesh that blocks their own beam. Use a small outward offset if required; don't move them visibly away from the car.

### Beam shape and useful range

Start with two spotlights or the project's suitable equivalent. Suggested artistic starting targets for a metre-scale scene:

| Parameter | Starting direction |
| --- | --- |
| Colour | Warm-neutral white, approximately #FFF0D8 |
| Main visible illumination | Roughly 4–30 m ahead |
| Faint useful reach | Approximately 35–45 m, tuned to street fog |
| Beam cone | Broad enough to cover the narrow lane and near curb edges |
| Aim | Approximately 3–6 degrees downward, adjusted to lamp height |
| Edge softness | Generous smooth penumbra, no hard circular border |
| Intensity | Tune to the renderer's actual units, exposure, and road response |

If using a cone-angle API that expects a half-angle, do not confuse it with the full beam width. A half-angle around 20–30 degrees is a reasonable initial exploration, then adjust visually. Avoid prescribing a numeric light intensity without checking the renderer's conventions.

The pools should overlap, producing a wider usable lit region rather than two tiny isolated circles. Keep both beams symmetrical initially. Do not attempt legally precise automotive beam patterns; this is an artistic website scene, not a headlamp simulation.

Actual scene lighting should reveal road texture, paint, curb edges, and nearby lower facades. Do not substitute two transparent cones that appear to glow but never illuminate the road. Do not flood upper floors or distant skyline with white light.

Check how road materials receive light. If a custom shader ignores scene lights, integrate a lightweight equivalent illumination calculation into that shader or use a compatible material path without destroying its existing texture/spill appearance. Explain any approximation in code comments.

### Shadows, fog, and lamp appearance

Start without additional headlight shadows if the visual result is convincing. If obvious lighting through obstacles appears, add a carefully budgeted shadow solution only where it improves the driver's view. Do not enable expensive shadows on every street object or every neon source. Exclude irrelevant/self-obstructing geometry from headlight shadows selectively if necessary, without disabling all sensible occlusion.

Reuse existing distance fog. Ordinary fog and spotlights do not automatically generate visible volumetric beams. Visible light shafts are not required. Do not introduce volumetric raymarching, extra scene captures, or huge translucent cone meshes for this task.

If the actual lamp surfaces are visible in a development view, allow restrained emissive material treatment. It must not change shared windshield/dashboard materials or make the whole car glow. Clone shared materials only as needed and preserve the source asset.

Because the car is stationary and the street moves, light sources stay fixed while road/buildings pass through their pools. Verify that illumination remains continuous when road chunks recycle and that fake road-reflection patches do not detach or get lit twice incorrectly.

## Modest cabin lighting increase

The cabin should be about one perceptual step brighter, not globally washed out. Aim for clear steering-wheel shape, visible upper-dashboard texture, a readable centre console, and discernible door trim from the default driver view.

Use a small, named cabin-light rig with a low-cost strategy appropriate to the existing scene. One or two dim local fill sources can be sufficient. Keep them attached to the car so they do not rotate with the viewer. A very subtle warm overhead/interior fill plus existing coloured street spill is a suitable direction.

Avoid solving this with a large global ambient increase: that would brighten all buildings and weaken the night atmosphere. Avoid a bright camera-mounted flashlight or a point light positioned so close to a dashboard that it produces a hot circular spot.

Use neutral/slightly warm cabin fill, while preserving the existing soft coloured spill from passing signs. Ensure nearby unshadowed fill does not noticeably illuminate the road or shine through exterior panels. Tune distance/falloff and placement; use selective lighting techniques only if supported and justified by the project's actual renderer. Do not assume object layers alone automatically isolate arbitrary light influence.

Check dashboard roughness/metalness and the existing retro shadow grade. If highlights are overly glossy or shadows are crushed, apply the smallest targeted correction. Do not remove the retro look or apply a second tone mapper. Keep windshield transparency and reflections from becoming a bright grey veil.

Headlight brightness, cabin fill intensity, and optional material adjustments should be independently tunable. Do not tie them to music volume or camera angle. Preserve existing environment pause and camera-control behaviour.

## Background music: stock placeholder

Choose one legitimate stock track suited to a quiet late-night neon drive. Prefer instrumental ambient synthwave, restrained lo-fi electronic, or mellow downtempo: soft synth pads, a gentle bass line, light percussion, roughly 70–100 BPM or beatless. Avoid vocals, sudden loud intros, aggressive drops, horror stingers, and recognisable copyrighted game/anime soundtracks.

Use a track with explicit licensing that permits downloading, bundling, and use on this public portfolio website. Prefer CC0/public-domain or clear attribution-permitted stock terms. Do not assume 'royalty-free' means unrestricted, and do not use an asset whose license prohibits this type of distribution. No paid purchase or subscription is authorized.

Verify the track's actual source and license before downloading. Store the track locally in the repository; do not hotlink a streaming service, scrape audio from videos, or depend on a third-party player/iframe. Keep download size sensible, ideally a few megabytes for a compressed loop rather than a long uncompressed WAV.

Create `public/audio/ATTRIBUTION.md` (or the framework's equivalent) with the track title, creator, original source URL, license name/URL, any required attribution text, and modifications such as trimming/fades. Include any required public-facing credit in a compact existing credits location or a small audio-credit link. Don't falsely label a track CC0.

If a permitted stock asset cannot actually be acquired in the available environment, implement and verify the player wiring with a clearly described fallback only if feasible, then report the missing stock asset honestly. Do not claim music is bundled when the file is absent, invent a license/source, or silently replace the request with an unrelated soundtrack.

## Custom track replacement path

Use a clearly documented local path such as:

`public/audio/night-drive.mp3`

For frameworks serving `public` at root, the runtime path is normally `/audio/night-drive.mp3`; verify deployment base paths instead of hardcoding an incorrect `/public/...` URL.

Put the audio source in one configuration value and support the actual chosen format. The later replacement workflow should be: replace that file with the custom track, retaining the same name and encoding/container, or change that single configuration path for a different format. Do not rename file extensions as a conversion method. Mention normal production rebuild/deployment/cache invalidation if required by the asset pipeline.

Create a short `public/audio/README.md` explaining the replacement path, supported tested format(s), suggested level/loop preparation, and how attribution should be updated when the track changes. Do not delete required license history casually; distinguish the active track's credit from previous-source documentation.

## Audio playback behaviour

Use one persistent, non-positional music player for the website experience. Turning the camera should not change stereo balance or volume as if the music source were outside the car. Do not spawn new players on scene re-renders, route updates, look gestures, resets, or quality changes.

Browsers may block audible autoplay. Start in a non-playing state and make playback possible through a clear user action. Preferred behaviour: a small visible **Play music** control, styled consistently with the existing minimal controls. The website must remain fully usable without starting music. Do not present an entry gate or a blocking 'click to enter' modal.

Call playback/resume from the intentional user gesture and handle rejected playback promises without uncaught errors. Do not start music just because the user drags to look or clicks Reset View. Do not repeatedly retry blocked autoplay in the background.

After starting, loop at a quiet background volume: start around 15–20% of the player's range, with a brief 0.5–1 second fade-in if practical. Tune by listening to the actual track because recordings have different loudness. Do not assume a low numeric volume guarantees a comfortable level.

Provide visible play/pause (or clearly labelled on/off) and volume/mute control. Reuse a compact existing controls area or add one small unobtrusive group. This is not a playlist/player app: no album carousel, equalizer, visualizer, or elaborate music dashboard. It should remain accessible when the viewer looks away from the centre console.

Use real accessible HTML controls where practical, with descriptive names, keyboard focus, and state labels that match actual playback events. Do not display 'Playing' if play() failed. Volume zero/mute and pause are distinct internal states; respect the user's explicit choice. Avoid silently unmuting or restarting music after unrelated scene interactions.

Pointer interaction with music buttons or the slider must not trigger camera dragging. Dragging the scene across the controls must not accidentally click them. Preserve the existing gesture-arbitration approach. Touch and keyboard interaction with the slider must work without rotating the view or hijacking global scrolling.

Remember volume/mute preference locally if the project already has a settings pattern, but do not assume stored preference bypasses autoplay restrictions. Do not auto-start audible audio on a later visit without the required browser/user permission context.

## Loop quality and lifecycle

Prefer a stock track authored as a loop. Listen across at least two joins. There must be no obvious click, loudness jump, or long silence at the seam. Set the player to loop and verify the actual file's padding/encoding behaviour rather than claiming a seamless loop from a boolean alone.

For a naturally seamless asset, the simplest persistent audio element may suffice. If its seam audibly gaps, use a properly prepared loop or a small Web Audio solution with accurate buffer looping. Avoid two competing approaches or repeated decoding. A brief crossfade is optional only if needed and tested; don't introduce doubling, phasing, or a persistent volume jump.

Do not repeatedly download or decode the track. Use metadata/no preload until useful, or another deliberate lightweight loading strategy. Keep music loading independent from the car/street loading; an audio failure must not stop rendering or block navigation.

Pause on document hidden to avoid unwanted background playback. Track whether audio was playing before the visibility change separately from a user pause. On return, restore only that previous intended state if playback is allowed; otherwise leave a clear paused state and let the user resume. Handle rejected resumes. Never restart music that the user muted or paused intentionally.

The scene's drive-pause control can remain independent of music: a user may want to listen while reading. Camera reset never restarts the track. Dispose owned audio/listeners on final teardown without breaking a deliberately shared app-level player. Verify hot reload/remounting does not layer multiple soundtracks.

## Configuration and performance

Expose a small configuration surface for headlight mount/target positions, colour, intensity, cone angle, edge softness, range, shadow settings, cabin fill properties, audio source, and initial volume. Keep renderer-specific intensity units documented.

Use a small fixed light count and reuse existing light/material resources. Compare frame time before/after at the same device, viewport, quality, and paused street position. Report observed cost; don't guarantee universal performance. If two headlight shadow maps are too expensive, prioritize stable road illumination and cabin readability over detailed shadows.

Keep audio work out of the render loop. Do not synchronize gain updates to every frame unnecessarily. Restore any scene-level changes owned by this integration during teardown. No additional canvas, renderer, composer, or animation loop should be introduced.

## Implementation order

1. Inspect the current setup and capture a visual/performance baseline.
2. Add correctly aligned, car-mounted headlights and tune their road pools.
3. Add restrained cabin fill and check the glass/retro-grade interaction.
4. Acquire and document one licensed stock loop, then add the single configurable player.
5. Add compact accessible audio controls and integrate with camera gesture arbitration.
6. Verify real playback, loop seams, failure behaviour, camera views, and performance.
7. Run existing relevant build/type/lint checks and fix issues introduced by this work.

## Acceptance checklist

- [ ] Two headlights visibly illuminate the actual road ahead with soft overlapping pools.
- [ ] Lights stay fixed to the car while the camera turns through the existing look limits.
- [ ] Road texture and curbs are clearer without white clipping, giant glow blobs, or abrupt beam edges.
- [ ] Moving street chunks pass smoothly through the illumination without seam flashes.
- [ ] Cabin is modestly brighter, with readable wheel/dashboard/console and preserved nighttime contrast.
- [ ] Glass remains clear; fill lights don't noticeably leak through the roof or wash out the city.
- [ ] A real playable stock file is bundled, with verified source/license and required credit.
- [ ] Playback starts through a deliberate user action and handles autoplay rejection gracefully.
- [ ] Play/pause, mute, and volume states reflect actual audio behaviour and support keyboard/touch.
- [ ] Music controls never trigger look-dragging; camera interactions never restart the track.
- [ ] At least two loop joins are listened to; no click, obvious gap, or loudness jump remains.
- [ ] Hidden-tab handling and manual pause/mute intent are respected; no duplicate players appear.
- [ ] Missing/failed audio leaves the rest of the website usable with a clear control state.
- [ ] Replacement requires only the documented file swap or one source-path change.
- [ ] Existing look/reset controls, retro appearance, road motion, responsive layout, and reduced-motion handling remain intact.
- [ ] Relevant checks and measured performance are reported accurately.

Inspect the actual running scene from default and side-looking views. Capture a before/after view from the same position if available. Listen to the actual audio; a downloaded file and successful build do not prove playback or a clean loop. If audio output/browser verification is unavailable, state exactly what remains unverified rather than claiming listening tests passed.

## Final report

Summarize changed files, light-tuning configuration, music file/source/license, how to replace the track, and validation performed. Include any remaining clipping, lighting, performance, or playback limitations. Do not claim an asset was obtained or a feature tested unless it actually was.
