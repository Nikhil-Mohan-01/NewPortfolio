# Portfolio website

A personal portfolio site. The visitor sits inside a Nissan R34 GT-R at night, driving down a looping neon Tokyo street; portfolio content will later live on an in-car Game Boy-style interface.

## Current state
The repository starts **empty**. Specs are built one at a time, in numeric order. Only work on the spec you were pointed at.

## Tech stack (decided; change only with explicit approval)
- Vite + TypeScript (strict)
- Three.js (vanilla, no React/R3F) with its built-in postprocessing (`EffectComposer`, `UnrealBloomPass`, `OutputPass`)
- npm as package manager
- ESLint + Prettier

## Commands (create these npm scripts when scaffolding)
- `npm run dev`: Vite dev server
- `npm run build`: production build
- `npm run typecheck`: `tsc --noEmit`
- `npm run lint`: ESLint
- Before finishing any task, run `typecheck`, `lint`, and `build`, and report results.

## Repo map
- `specs/`: WHAT to build. Numbered feature briefs with acceptance criteria. Treat as source of truth.
- `.agent/PLANS.md`: HOW to execute. Template for multi-step work. Use it for anything non-trivial.
- `src/environment/`: reusable Three.js street environment (see its AGENTS.md)
- `src/app/`: app shell, preview page, camera and renderer ownership (see its AGENTS.md)

## Rules that always apply
- One scene, one renderer, one render loop. Never add a second canvas.
- The reusable environment must not own the camera, renderer, or app UI.
- Do not build features from future specs early (car, cockpit, Game Boy UI, audio, portfolio content) unless the current spec says so.
- No external asset downloads or real brand logos unless already approved.
- Keep dev-only controls behind `import.meta.env.DEV`.
- Measure performance and report real numbers; don't guess.

## Workflow
1. Read this file, the target spec, and `.agent/PLANS.md`.
2. For multi-step work, write a plan into `.agent/plans/<spec-name>.md` (from the template) and keep it updated as you go.
3. Implement in the order the spec lists.
4. Verify against the spec's acceptance criteria, item by item.
5. Give the final report format from the global AGENTS.md.

## Overrides
A temporary `AGENTS.override.md` may be added at the project root. **Codex uses it in place of this file in the same directory**, so any override must restate everything it still needs. See `AGENTS.override.md.example`.
