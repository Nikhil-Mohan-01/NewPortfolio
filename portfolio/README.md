# R34 cockpit preview

From this directory, install the locked dependencies and start the preview.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The street renders as the local R34 model loads, then the camera switches to the right-hand driver's seat. The street travels at 6 m/s by default. The driver's eye and the car stay fixed. A system reduced-motion preference starts the street stationary.

## Headlights and music

The R34 carries two warm headlights and a restrained overhead fill. Adjust aim, beam width, intensity and falloff in [`src/cockpit/lighting-config.ts`](src/cockpit/lighting-config.ts). Three.js light intensities are in candela. The headlights use a shared beam mask and ship without shadow maps. The cabin fill has a short range that keeps it off the road.

Select **Play music** in the upper-right controls to start the optional soundtrack. Pause, mute and volume are independent of the drive and the camera. The player pauses when the page is hidden and attempts to resume only if playback was active or requested and audible when the page was hidden.

The bundled track is **Exploration Theme** by Cleyton Kauffman, released under CC0 1.0. Replace `public/audio/night-drive.mp3` for a custom MP3 or change the source path in [`src/app/music/config.ts`](src/app/music/config.ts). [Track attribution](public/audio/ATTRIBUTION.md) · [Replacement guide](public/audio/README.md)

## Driver look

Hold the left mouse button and drag on the scene to look around. Touch devices use one-finger drag on the canvas, leaving HTML overlays available for their own input. The eye stays fixed. Yaw can move 60° to either side and pitch can move 45° up or down from the starting view.

Use **Reset View** below the radio or at the bottom-right edge to return to the starting view. The edge control remains available when the console moves out of frame, including the default view on narrow portrait screens. For keyboard use, Tab to the driver view and use the arrow keys in 3° steps. Tab onward to a reset button and press Enter or Space. Reduced motion makes dragging and resetting immediate. Looking and resetting also work while the street is paused.

The original eye and aim are in [`src/cockpit/config.ts`](src/cockpit/config.ts). The look limits, sensitivity, smoothing, and physical console anchor are in [`src/app/driver-look/config.ts`](src/app/driver-look/config.ts). Both reset controls use the same saved cockpit pose and reset function.

## Development preview

These query parameters and the browser console API are available in development.

| Parameter | Example | Purpose |
| --- | --- | --- |
| `filter`, `strength` | `?paused=1&filter=retro&strength=0.65` | Compare Clean, Subtle, and Retro or set a custom strength from 0 to 1. |
| `view` | `?view=street` | Inspect the original street without loading the car. |
| `speed` | `?speed=8` | Speed in metres per second. Use 3–10 for normal travel, 0 to freeze, or up to 64 to stress the loop. |
| `paused` | `?paused=1` | Hold the starting view. |
| `yaw`, `pitch`, `fov` | `?paused=1&yaw=15&pitch=-4&fov=57` | Set the camera angles and vertical field of view in degrees. |
| `x`, `eye`, `z` | `?x=0.35&eye=1.06&z=0.39` | Set the camera position in metres. |
| `quality` | `?quality=low` | Reduce street geometry, street lights, and pixel ratio, and disable bloom. |
| `seed` | `?seed=7128` | Reproduce a particular street layout. |

Use `window.streetPreview.street.paused` and `window.streetPreview.street.speed` to pause, resume, or change speed live. `window.streetPreview.camera` supports live inspection. Call `camera.updateProjectionMatrix()` after changing its FOV or clip planes. `window.streetPreview.stats` shows scene draw calls, triangles, and renderer resource counts.

## Retro camera treatment

The default Retro preset renders the scene at 82% of its original internal dimensions on standard quality, then smoothly upscales to the full canvas. At the shipped 0.65 strength, the softness radius is 0.51 CSS px, saturation is about 92% of Clean, and midtone grain peaks at ±0.017 display luminance with a 22 Hz cadence. Corner darkening peaks at 13%, and red and blue can shift up to 0.44 CSS px in opposite directions at the edges. Scanlines ship off. Low quality retains its existing render scale, halves the softness radius, and disables edge color separation and scanlines.

The single composer renders the HDR scene and bloom first, then applies ACES tone mapping and sRGB output through `OutputPass`. One final shader grades and composites the display-encoded picture to the canvas. HTML remains outside that pipeline.

Set the defaults in [`src/app/retro/config.ts`](src/app/retro/config.ts). During development, load `?paused=1&filter=clean` or `?paused=1&filter=retro` for an identical-position comparison. To switch live, call `window.streetPreview.retro.setPreset("clean")` or `setPreset("retro")` on that object. The host can change `retro.settings.enabled` or `retro.settings.strength` at runtime. Disabling the treatment or setting strength to zero skips the final shader and restores native scene resolution. Pausing, zero street speed, reduced motion, and hiding the tab hold the grain phase.

## Model and camera

The unchanged source file lives in [`public/models/r34/r34.glb`](public/models/r34/r34.glb) with [attribution and license](public/models/r34/ATTRIBUTION.md). The loader resolves `models/r34/r34.glb` beneath Vite's configured base URL. The street stays available while the file loads and if the load fails. The browser console reports the URL path and error on failure.

Tune the normalization and driver's eye in [`src/cockpit/config.ts`](src/cockpit/config.ts). The normalization gives the model a 4.60 m length, places it on the source tire contact plane, and turns the bonnet toward −Z. The seated view starts at `(0.35, 1.06, 0.39)` m with 56° vertical FOV and 0.025–160 m clipping. Resizing updates camera aspect while preserving the eye position.

The original glass geometry uses lightweight transparent materials in the running scene. The wheel meshes are batched per wheel and material, and the engine is hidden beneath the closed bonnet. Mirrors retain their static asset appearance.

## Street integration

Import `createTokyoStreet` from `src/environment` and add `street.root` to the host scene. Call `street.update(deltaSeconds)` once per host frame. The road and building rows travel along +Z. The host owns scene fog, camera, renderer, visibility handling and the animation loop. Keep custom far fog distances at or below 160 m to conceal recycled sections. Use the same matched background and fog color and a single `RenderPass → UnrealBloomPass → OutputPass` chain to reproduce the preview's lighting.

Pass seed, quality, fog, palette and lighting intensity through `StreetOptions`. Recreate the module to change seed, quality or palette. Speed, pause and lighting intensity can be changed on the returned instance. Call `street.dispose()` when removing it to release its owned resources.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

The [cockpit execution plan](.agent/plans/02-r34-cockpit.md) records browser verification and measurements.
