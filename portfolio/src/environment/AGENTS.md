# src/environment: Three.js street environment

Reusable, self-contained environment module. It is later embedded in the car/portfolio scene by the host app.

## Boundaries
- Does NOT create or own the renderer, camera, canvas, or app UI.
- Exposes a small public interface: speed, paused, seed, quality, fog, palette, lighting intensity, plus `update(dt)`, `dispose()`, and an `Object3D` root to add to a scene.
- Anything it changes on the host (fog, background, tone mapping) must be restored in `dispose()`.

## Suggested modules
`config` · `rng` (seeded) · `facades` (archetype generators) · `textures` (canvas/atlas) · `materials` · `chunk` · `chunkPool` · `lighting` · `index` (public API)

## Conventions
- Scene units are metres. Camera looks down -Z; environment moves toward +Z.
- All randomness goes through the seeded RNG. Never call `Math.random()` here.
- Create geometry, materials, and textures once and reuse. Nothing is regenerated per frame.
- Movement derives from elapsed time with clamped delta; speed 0 freezes everything.
- Dispose only resources this module created.
- Comment honestly where an effect is an artistic approximation (e.g. road light spill is not a real reflection).
- Keep draw calls and triangle counts within the spec's budget; use instancing for repeated windows/trim.
