# Plan for the looping Tokyo street

Spec `specs/01-tokyo-street-environment.md`  
Branch `feat/tokyo-street-environment`  
Status in progress

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
- [ ] Finish recycling and host integration. Verify motion, lifecycle, viewport changes, and frame/resource budgets with the running preview.

## Risks

Check batch and texture disposal when quality changes. Sample the road joins and full loop at increased speed. Verify subdued signs and road spill from straight and oblique views to catch clipping, sign orientation, and oversaturated lighting.

## Progress

- 2026-11-13. Read the spec and workspace instructions. Created the feature branch.
- 2026-11-13. Added the Vite preview, road, curb and pavement geometry. Typecheck, lint and production build passed.
- 2026-11-13. Added all five facade types, an atlas for fictional shop signs, bloom, fog, and matching wall and road spill. Captured and inspected the fixed preview in Chrome at straight and ±60° views.

## Verification

Pending.

## Final report

Pending.
