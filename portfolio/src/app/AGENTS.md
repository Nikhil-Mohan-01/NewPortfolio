# src/app: app shell and preview

Owns the renderer, camera, render loop, postprocessing setup, resize handling, and the dev preview page.

## Conventions
- Single renderer and single animation loop for the whole site.
- Camera: fixed position with adjustable offsets only. No bob, shake, roll, or FOV animation.
- Pause on `document.hidden`; respect `prefers-reduced-motion` (start stationary).
- Dev-only controls (speed, pause, camera yaw, quality) live behind `import.meta.env.DEV` and must not ship in the production build.
- Do not add portfolio content, Game Boy UI, navigation, or audio until a spec asks for it.
