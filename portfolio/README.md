# Nikhil Mohan’s portfolio

From this directory, install the locked dependencies and start the preview.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Desktop starts in the R34 night drive. Scroll down to advance through the 180-metre route and up to reverse. When scrolling stops, the road settles. Use **Back to Start** at the end of the general drive, or open any app from the centre console or **Open Dashboard**. **Return to Car** restores the road position and camera angle.

Phones and touch-first devices open the readable dashboard first. Choose **Explore the Car** to drive with vertical swipes. Use `#/simple` for the reading launcher, `#/experience` for the full role list, `#/projects` for the catalogue, or `#/projects/protomind` for a direct project link. The readable pages and original PDF work without the 3D engine.

## Experience street timeline

From the desktop cockpit or dashboard, open **Experience** to visit LG Energy Solution, Paraverse Studios, and Code Ninjas along the right-hand side of the road. Scroll manually or use **Previous**, **Next**, and the stop list. **View Stop** aims the camera when requested. **Read More** on either display opens the full role details, suspends the drive, and restores the road position and focus when closed. Press Escape or select **Close** to return to the street.

**List view** opens the readable Experience page. Mobile and reduced-motion visitors start with this page when opening Experience. **Explore the Street** opts into the route, with immediate stop navigation under reduced motion. The first visit begins at LG Energy Solution and later visits in the same tab resume the saved position. **Start Over** returns to the first stop.

Tune route length, scroll distance, damping, landmark positions, and sign placement in [drive configuration](src/app/drive/config.ts). Edit [role and portfolio content](src/app/dashboard/content.ts), the [shared app icons](src/app/dashboard/apps.ts), [launcher sizing and spacing](src/app/dashboard/launcher.css), and the [console pose](src/app/console/config.ts) in their respective modules. Replace `public/resume/Nikhil_Mohan_Resume.pdf` to update the PDF while keeping its URL. See the [scroll-drive plan](.agent/plans/07-scroll-drive-carplay.md) for verification.

## Headlights and music

The R34 carries two warm headlights and a restrained overhead fill. Adjust aim, beam width, intensity and falloff in [`src/cockpit/lighting-config.ts`](src/cockpit/lighting-config.ts). Three.js light intensities are in candela. The headlights use a shared beam mask and ship without shadow maps. The cabin fill has a short range that keeps it off the road.

Select **Play music** in the upper-right controls to start the optional soundtrack. Pause, mute and volume are independent of the drive and the camera. The player pauses when the page is hidden and attempts to resume only if playback was active or requested and audible when the page was hidden.

The bundled track is **Exploration Theme** by Cleyton Kauffman, released under CC0 1.0. Replace `public/audio/night-drive.mp3` for a custom MP3 or change the source path in [`src/app/music/config.ts`](src/app/music/config.ts). [Track attribution](public/audio/ATTRIBUTION.md) · [Replacement guide](public/audio/README.md)

## Driver look

Hold the left mouse button and drag on the scene to look around. Touch devices use vertical swipes to drive. The eye stays fixed. Yaw can move 60° to either side and pitch can move 45° up or down from the starting view.

Use **Reset View** below the radio or at the bottom-right edge to return to the starting view. The edge control remains available when the console moves out of frame, including the default view on narrow portrait screens. For keyboard use, Tab to the driver view and use the arrow keys in 3° steps. Tab onward to a reset button and press Enter or Space. Reduced motion makes dragging and resetting immediate. Looking and resetting work independently of route position.

The original eye and aim are in [`src/cockpit/config.ts`](src/cockpit/config.ts). The look limits, sensitivity, smoothing, and physical console anchor are in [`src/app/driver-look/config.ts`](src/app/driver-look/config.ts). Both reset controls use the same saved cockpit pose and reset function.

## Development preview

These query parameters and the browser console API are available in development.

| Parameter             | Example                       | Purpose                                                                    |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `filter`, `strength`  | `?filter=retro&strength=0.65` | Compare Clean, Subtle, and Retro or set a custom strength from 0 to 1.     |
| `view`                | `?view=street`                | Inspect the original street without loading the car.                       |
| `yaw`, `pitch`, `fov` | `?yaw=15&pitch=-4&fov=57`     | Set the camera angles and vertical field of view in degrees.               |
| `x`, `eye`, `z`       | `?x=0.35&eye=1.06&z=0.39`     | Set the camera position in metres.                                         |
| `quality`             | `?quality=low`                | Reduce street geometry, street lights, and pixel ratio, and disable bloom. |
| `seed`                | `?seed=7128`                  | Reproduce a particular street layout.                                      |

Use `window.streetPreview.street.distance` to inspect the rendered route distance in metres. `window.streetPreview.camera` supports live inspection. Call `camera.updateProjectionMatrix()` after changing its FOV or clip planes. `window.streetPreview.stats` shows scene draw calls, triangles, and renderer resource counts.

## Retro camera treatment

The default Retro preset renders the scene at 82% of its original internal dimensions on standard quality, then smoothly upscales to the full canvas. At the shipped 0.65 strength, the softness radius is 0.51 CSS px, saturation is about 92% of Clean, and midtone grain peaks at ±0.017 display luminance with a 22 Hz cadence. Corner darkening peaks at 13%, and red and blue can shift up to 0.44 CSS px in opposite directions at the edges. Scanlines ship off. Low quality retains its existing render scale, halves the softness radius, and disables edge color separation and scanlines.

The single composer renders the HDR scene and bloom first, then applies ACES tone mapping and sRGB output through `OutputPass`. One final shader grades and composites the display-encoded picture to the canvas. HTML remains outside that pipeline.

Set the defaults in [`src/app/retro/config.ts`](src/app/retro/config.ts). During development, load `?filter=clean` or `?filter=retro` for an identical-position comparison. To switch live, call `window.streetPreview.retro.setPreset("clean")` or `setPreset("retro")` on that object. The host can change `retro.settings.enabled` or `retro.settings.strength` at runtime. Disabling the treatment or setting strength to zero skips the final shader and restores native scene resolution. A stationary route, reduced motion, and hiding the tab hold the grain phase.

## Model and camera

The unchanged source file lives in [`public/models/r34/r34.glb`](public/models/r34/r34.glb) with [attribution and license](public/models/r34/ATTRIBUTION.md). The loader resolves `models/r34/r34.glb` beneath Vite's configured base URL. The street appears while the file loads. If the model fails to load, the portfolio opens a readable dashboard. The browser console reports the URL path and error on failure.

Tune the normalization and driver's eye in [`src/cockpit/config.ts`](src/cockpit/config.ts). The normalization gives the model a 4.60 m length, places it on the source tire contact plane, and turns the bonnet toward −Z. The seated view starts at `(0.35, 1.06, 0.39)` m with 56° vertical FOV and 0.025–160 m clipping. Resizing updates camera aspect while preserving the eye position.

The original glass geometry uses lightweight transparent materials in the running scene. The wheel meshes are batched per wheel and material, and the engine is hidden beneath the closed bonnet. Mirrors retain their static asset appearance.

## Street integration

Import `createTokyoStreet` from `src/environment`, give it a finite `routeLength`, and add `street.root` to the host scene. Call `street.setDistance(distanceMetres, deltaSeconds)` each frame. The car faces −Z and the street shifts along +Z as distance increases. Chunks keep their seeded identity and place on the route in either direction. The per-frame delta smooths light changes.

The host owns the fog, camera, renderer, visibility handling, and animation loop. Use a matched background and fog color and a single `RenderPass → UnrealBloomPass → OutputPass` chain to reproduce the preview’s lighting. Pass seed, quality, fog, palette, and lighting intensity through `StreetOptions`. Call `street.dispose()` when removing it to release its resources.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

The [cockpit execution plan](.agent/plans/02-r34-cockpit.md) records browser verification and measurements.
