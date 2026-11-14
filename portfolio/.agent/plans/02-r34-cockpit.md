# Plan for the R34 cockpit

Brief `R34_Codex_Integration_Pack/Car_Interior_Codex_Instructions.md`
Branch `feat/r34-cockpit`
Status in progress

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
- [ ] Tune glass, materials and synchronized spill. Verify loop and lifecycle, measure performance, and document the controls.

## Risks

The source's tiny scale, opposing axis, and twin transmissive glass surfaces could create misleading results. Inspect transformed exterior and interior views and compare identical street renders. Keep the load asynchronous and verify the missing-file path.

## Progress

- 2026-11-13. Inspected the embedded asset metadata, bounds, tree and material assignments. Created the feature branch from merged main.
- 2026-11-13. Rendered the exterior, overhead cabin and both seat positions. Confirmed right-hand drive from the wheel, pedal area and driver instruments, with the center console to their left. Copied the source bytes unchanged to the Vite public directory.

- 2026-11-13. Integrated asynchronous loading, the fixed right-hand-drive camera and clear double glazing. Inspected the cockpit at 1440 × 900 and 390 × 844. Captured an unoptimized cockpit sample at 346 scene draw calls.

## Verification

Pending.

## Final report

Pending.
