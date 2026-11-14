# Plan for the R34 cockpit

Brief `R34_Codex_Integration_Pack/Car_Interior_Codex_Instructions.md`
Branch `feat/r34-cockpit`
Status done

## Goal

Use the supplied R34 to frame the existing Tokyo street from the driver's seat. Integrate the stationary model and fixed camera into the single existing scene and render loop.

## Repository and model

The vanilla Three.js and Vite app owns a fixed perspective camera, composer, resize handling and animation loop. The street moves along +Z while the preview faces −Z. The branch starts at the merged street preview on GitHub main.

The 12.6 MB GLB contains 495 mesh primitives, 227,038 triangles, 26 source materials and 37 embedded images (32–512 px). There are no external textures, required decoders, imported lights, cameras, skins or animations. The hood and front grilles face +Z in the glTF scene. The model is Y-up with bounds about 0.0194 × 0.0132 × 0.0459 source units. Its four tire bottoms lie at nearly zero source Y. The cabin has inner and outer glass, and the asset includes separate body, interior, engine, suspension/brake and wheel geometry.

## Decisions

- Copy the original bytes to Vite's public asset path and preserve the embedded attribution in a companion document.
- Normalize the body once at the parent. Use the existing camera to switch to the driver's eye once the cockpit is ready.
- Measure both views on the same Chrome viewport. Examine draw overhead from the many small wheel fragments, transmission and engine geometry before making any simplification.

## Milestones

- [x] Inspect model structure and a rendered cabin, then commit the unchanged runtime asset and attribution.
- [x] Integrate model loading, fixed cockpit camera and fallback. Verify desktop and portrait framing.
- [x] Tune glass, materials and synchronized spill. Verify loop and lifecycle, measure performance, and document the controls.

## Risks

The source's tiny scale, opposing axis, and twin transmissive glass surfaces could create misleading results. Inspect transformed exterior and interior views and compare identical street renders. Keep the load asynchronous and verify the missing-file path.

## Progress

- 2026-11-13. Inspected the embedded asset metadata, bounds, tree and material assignments. Created the feature branch from merged main.
- 2026-11-13. Rendered the exterior, overhead cabin and both seat positions. Confirmed right-hand drive from the wheel, pedal area and driver instruments, with the center console to their left. Copied the source bytes unchanged to the Vite public directory.

- 2026-11-13. Integrated asynchronous loading, the fixed right-hand-drive camera and clear double glazing. Inspected the cockpit at 1440 × 900 and 390 × 844. Captured an unoptimized cockpit sample at 346 scene draw calls.

- 2026-11-13. Batched compatible wheel fragments by material, hid the enclosed engine, and added dim textured cabin fill. The initial 346 scene draw calls dropped to 146 in the same paused view.

## Verification

| Criterion | Evidence |
| --- | --- |
| Local model and texture delivery | Chrome downloaded the 12,616,796-byte GLB at HTTP 200. All 37 source images are embedded. The staged and built files byte-match the supplied GLB. Production also loaded it under the custom `/portfolio-check/` base. |
| Driver side, scale, contact and eye | Exterior, overhead and seated views confirm right-hand drive. The measured runtime box spans about 4.60 m long and 1.94 m wide, with the front tire tips at road Y = 0. The driver's eye at `(0.35, 1.06, 0.39)` is ahead of the seat and above the wheel. The forward camera ray meets only the two windshield layers before exiting the cabin, at 1.123 and 1.130 m. |
| Glass, framing and lighting | Inspected the forward view, both oblique side views, portrait framing and screenshots at different travel phases. Side pillars and mirrors remain present. The street's existing lights provide visibly changing accents on the dashboard and trim. The fill uses the interior texture so the materials stay identifiable between fixtures. |
| Motion and loop | Verified 6 m/s as the default. At 32 m/s, sampled 260.27 m of continuous travel. Each of the eight sections wrapped once, maintaining exact 32 m spacing while the car and camera matrices stayed fixed. Existing street source files are byte-for-byte unchanged from the merged main branch. |
| Pause, reduced motion, resumption and resize | Chrome confirmed paused sections and fixture lights stayed fixed, and resuming continued travel. Simulated the hidden/visible events and verified zero travel during the hidden interval and a zero first-frame delta on resume. Reduced motion showed a stationary rendered cockpit. Resizing to 390 × 844 maintained the same eye position and correct aspect. Portrait used desktop emulation. |
| Fallback and lifecycle | Delayed the GLB request and confirmed the moving street remained visible. Returned a 404 and verified fallback with a diagnostic. Successful development and production runs showed a single canvas and no scene-load or shader errors. Imported cameras and lights are removed from the active model. |
| Performance | Chrome 157 on an Apple M4 Pro MacBook Pro, 1440 × 900 at DPR 1, standard quality, 6 m/s. Compared 6.5 s samples from the same street phase with the street-only and cockpit views. Both averaged about 120 FPS. P95 frame intervals were 10.1 ms street-only and 9.9 ms with cockpit. Peak scene draw calls were 96 and 159, and peak scene triangles were 72,316 and 239,223. Counters exclude postprocessing. |
| Repository checks and scope | Typecheck, lint and production build passed. Vite reported the roughly 609 kB minified entry bundle warning. The production build omits the dev query settings and browser API. The car uses static mirrors and the asset's existing gauges. |

## Final report

The source model and attribution are in `public/models/r34`. The model loader, wheel batching, and normalization and eye configuration are in `src/cockpit`. The single scene, renderer, fallback view, and development inspector are in `src/app`. See `README.md` for local commands and settings. The verified cockpit requires no Blender edits for this phase.
