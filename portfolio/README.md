# Tokyo street preview

From this directory, install the locked dependencies and run the development preview.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The preview starts at 6 m/s and uses a fixed camera at 1.15 m. A system reduced-motion preference starts the street stationary.

## Development preview

Use query parameters to inspect the scene. These settings and the browser console API are development-only.

| Parameter | Example | Purpose |
| --- | --- | --- |
| `speed` | `?speed=8` | Speed in metres per second. Use 3–10 for normal travel, 0 to freeze, or up to 64 to stress the loop. |
| `paused` | `?paused=1` | Hold the starting view. |
| `yaw` | `?paused=1&yaw=-60` | Inspect an oblique view, up to 70° to either side. |
| `x`, `eye` | `?x=0.36&eye=1.08` | Preview lateral and vertical camera offsets in metres. |
| `quality` | `?quality=low` | Reduce decorative geometry, point lights, and pixel ratio, and disable bloom. |
| `seed` | `?seed=7128` | Reproduce a particular set of frontages and pavement variations. |

Use `window.streetPreview.street.paused` and `window.streetPreview.street.speed` to pause, resume, or change speed live. `window.streetPreview.stats` shows scene draw calls, triangles, and renderer resource counts.

## Host integration

Import `createTokyoStreet` from `src/environment` and add `street.root` to the host scene. Call `street.update(deltaSeconds)` once per host frame. Start with the camera aimed along −Z near `(0, 1.15, 0)`, with 60° vertical FOV and clip planes at 0.045 and 160 m. The road and both building rows travel along +Z. The recycling envelope supports side glances up to ±70° with the preview’s bounded offsets.

The host owns the scene background, fog, animation loop, visibility handling, camera, and renderer. Use the color and planes in `street.fog` for the scene fog, and match the background to its color. The default fog fades from 25 m to 138 m. Keep custom far fog distances at or below 160 m to conceal recycled sections. To reproduce the preview’s glow, render through one `RenderPass → UnrealBloomPass → OutputPass` chain with ACES tone mapping. The default preview caps device pixel ratio at 1.5, and low quality caps it at 1.

Pass seed, quality, fog, palette, and lighting intensity in `StreetOptions`. Recreate the module to change seed, quality, or palette. Change speed and pause directly on the returned instance. Change `lightingIntensity` to scale the scene lights while preserving sign and window emission. Call `street.dispose()` when removing it to release its owned resources.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

The [execution plan](.agent/plans/01-tokyo-street-environment.md) records browser verification and measurements.
