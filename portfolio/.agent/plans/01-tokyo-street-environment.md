# Plan for the looping Tokyo street

Spec `specs/01-tokyo-street-environment.md`  
Branch `feat/tokyo-street-environment`  
Status done

## Goal

Build the standalone night street and leave camera and renderer ownership with the preview. Scope includes the lane, curbs, procedural buildings, lighting, and loop.

## Repository

The project has a spec and workspace instructions. There is no application, package manifest, or pre-existing renderer. Scaffold the prescribed vanilla Three.js, Vite, strict TypeScript, ESLint, and Prettier setup.

## Decisions

- Keep the lane at 3.6 m. Pack 32 m stretches on both sides and align every slab at its endpoints.
- Batch box details by material and combine sign faces and light spill by chunk to keep draw calls predictable.
- Use eight prebuilt chunks and recycle a chunk after its front edge is more than 60 m behind the eye. Put new chunks past the end of the visible fog.
- Keep the camera and postprocessing outside the street module. Generate all scene art from geometry and local canvas textures.

## Milestones

- [x] Scaffold the preview and a continuous lane with street edges. Verify lint, typecheck, and build.
- [x] Implement the five facade archetypes, signs, atmospheric lighting, and corresponding asphalt spill. Inspect forward and oblique views.
- [x] Finish recycling and host integration. Verify motion, lifecycle, viewport changes, and frame/resource budgets with the running preview.

## Risks

Check batch and texture disposal when quality changes. Sample the road joins and full loop at increased speed. Verify subdued signs and road spill from straight and oblique views to catch clipping, sign orientation, and oversaturated lighting.

## Progress

- 2026-11-13. Read the spec and workspace instructions. Created the feature branch.
- 2026-11-13. Added the Vite preview, road, curb and pavement geometry. Typecheck, lint and production build passed.
- 2026-11-13. Added all five facade types, an atlas for fictional shop signs, bloom, fog, and matching wall and road spill. Captured and inspected the fixed preview in Chrome at straight and ±60° views.

- 2026-11-13. Added continuous travel, chunk recycling, low quality and dev-only inspection. Tuned glazing, tile, paving joints, and sign spacing. Ran the finished scene in Chrome at several speeds and viewport sizes.

## Verification

| Criterion | Evidence |
| --- | --- |
| Single narrow lane, clear vanishing point and structured building rows | Inspected the forward screenshot and several in-motion samples. The 3.6 m asphalt geometry has two dim edge stripes and no centre marking. The screenshot shows clustered signs, quiet bays and receding silhouettes. |
| Dark facades, colored sign cores, halos and matching road response | Inspected forward and oblique captures with bloom, then the low-quality capture without bloom. Colored sources, surface spill and window shapes stayed distinct. |
| Fixed eye point and synchronized movement | At 6 m/s, Chrome reported moving chunks and an unchanged camera. The road, facades, signage and spill are children of each moving chunk. |
| Two full cycles with no seam gaps or jumps | Frame-by-frame positions sampled through 540.28 m of travel at 64 m/s. All eight chunks recycled at least twice, with 32 m spacing preserved, continuous road coverage past the 160 m camera range, and all wraps beyond the view envelope. Inspected screenshots from the running loop. |
| Oblique views | Captured and inspected both ±60° views. In the accelerated run, also sampled the loop at a 60° camera yaw. |
| Pause, resume, visibility and reduced motion | Checked frozen positions with pause and at zero speed. Exercised the visibility handler by simulating the hidden and visible document events in Chrome. Movement stopped during the hidden interval, and the first frame after returning used a zero delta. Verified reduced-motion startup on both development and production builds. |
| Viewport and resize | Chrome rendered the low tier at 390 × 844 and resized to 570 × 780 with matching camera and canvas aspect ratios. |
| Resource counts and performance | Chrome 157 on an Apple M4 Pro MacBook Pro with 24 GB RAM, 1440 × 900 at DPR 1. Standard tier averaged about 120 FPS over 250 frame intervals at 6 m/s, with a 9.3 ms p95 frame interval, 90 peak scene draw calls and 62,452 peak triangles. The accelerated run peaked at 96 calls and 73,720 triangles, excluding postprocessing. Renderer counters stabilized at 22 geometries and 21 textures after warm-up and held through the second loop. |
| Scope and build | Production preview animates by default and omits the dev API. Typecheck, lint, build and npm audit passed. Vite reports the 573 kB minified bundle size warning. Mobile checks used desktop emulation. |

## Final report

The environment lives in `src/environment` and the development preview lives in `src/app`. See `README.md` for the run commands, tuning settings, and host integration contract.
