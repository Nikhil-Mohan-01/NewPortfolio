# R34 cockpit preview

From this directory, install the locked dependencies and start the preview.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The street renders as the local R34 model loads, then the camera switches to the right-hand driver's seat. The street travels at 6 m/s by default. The driver's eye and the car stay fixed. A system reduced-motion preference starts the street stationary.

## Development preview

These query parameters and the browser console API are available in development.

| Parameter | Example | Purpose |
| --- | --- | --- |
| `view` | `?view=street` | Inspect the original street without loading the car. |
| `speed` | `?speed=8` | Speed in metres per second. Use 3–10 for normal travel, 0 to freeze, or up to 64 to stress the loop. |
| `paused` | `?paused=1` | Hold the starting view. |
| `yaw`, `pitch`, `fov` | `?paused=1&yaw=15&pitch=-4&fov=57` | Set the camera angles and vertical field of view in degrees. |
| `x`, `eye`, `z` | `?x=0.35&eye=1.06&z=0.39` | Set the camera position in metres. |
| `quality` | `?quality=low` | Reduce street geometry, street lights, and pixel ratio, and disable bloom. |
| `seed` | `?seed=7128` | Reproduce a particular street layout. |

Use `window.streetPreview.street.paused` and `window.streetPreview.street.speed` to pause, resume, or change speed live. `window.streetPreview.camera` supports live inspection. Call `camera.updateProjectionMatrix()` after changing its FOV or clip planes. `window.streetPreview.stats` shows scene draw calls, triangles, and renderer resource counts.

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
