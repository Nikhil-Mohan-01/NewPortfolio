# Scroll-driven R34 and CarPlay launcher

- Branch `feat/scroll-drive-carplay`
- Spec `specs/Scroll_Drive_Carplay_Codex.md`
- Status complete

## Goal

Drive a finite reversible route with native scrolling, open portfolio content from a redesigned shared launcher, and explore three employment landmarks on the right-hand curb.

## Findings and decisions

- The cockpit and readable apps are on the completed portfolio branch. The feature builds on that branch so GitHub can include the prerequisites when reviewing against `main`.
- The camera looks down −Z. Fixed world coordinates on +X put the Experience panels on the right. The panels sit far enough ahead at each stop to clear the windshield pillar from the starting view.
- The existing renderer, lighting, and seeded street geometry remain the basis for the drive. A bounded set of chunks retains its logical identity throughout the route. A sticky cockpit takes its distance from native document scrolling.
- The shared icon definitions serve both layouts. The enlarged dashboard is available at small viewport widths and when the console is out of frame. One content module supplies the signs, the role dialogs, and the readable list.

## Milestones

- [x] Replace automatic driving with reversible native scrolling.
- [x] Push the projected and enlarged CarPlay launchers with all eight apps.
- [x] Add three fixed Experience stops, accessible detail dialogs, and explicit guidance.
- [x] Verify desktop, touch emulation, and production and document the controls.

## Verification

| Area                      | Evidence                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Drive and resize          | Chrome wheel tests verified down and up movement, no steady-state drift, exact chunk and position reproduction after reversal, resizing, bounded start and end, and return to zero. Dragging the native scrollbar moved from 650 px to 1,728 px. Scrolling during guided travel interrupted the move and left the scrollbar in control.          |
| Driver input              | Runtime checks verified keyboard look, Reset View without route movement, explicit View Stop with a fixed eye position, and preservation of look across dashboard transitions. The car-mounted lighting is outside the camera transform.                                                                                                         |
| Launchers                 | Inspected the projected display and enlarged desktop layout. Both showed the same eight apps in order. Dragging across a projected app did not activate it. Direct routes opened the readable destinations.                                                                                                                                      |
| Right-side stops          | Checked the view and clicked the real 3D Read More target at 26, 80, and 138 m. Each opened its corresponding HTML dialog. Previous, Next, Start Over, the stop list, and return near the route boundary kept scroll and route position in sync.                                                                                                 |
| Reading and restoration   | Desktop and touch-emulated checks verified that scrolling inside a role or readable app keeps the road stationary. Closing restored the exact scroll position and camera angle. Escape, user focus restoration, and the direct Experience list were exercised. In the same tab, opening the street again after a reload resumed the stored stop. |
| Mobile and reduced motion | Chrome touch emulation opened the readable dashboard and list by default. An opted-in vertical swipe moved the street while keeping the head fixed. Reduced motion opened the readable Experience app by default and switched opted-in stops immediately.                                                                                        |
| Production                | `npm run typecheck`, `npm run lint`, and `npm run build` passed. Tested a build served below a nested base path. Checked direct links and reload, Back and Forward, original PDF bytes, clipboard, audio playback through dashboard and cockpit, opt-in Experience, and a readable fallback when the model request failed.                       |
| Rendering sample          | Headless Chrome 157 on the workspace Mac at 1,440 × 900 and standard quality reported 158 draw calls and 238,403 triangles at the first stop. A 2-second animation frame sample contained 120 intervals with a 16.7 ms median and 16.8 ms 95th percentile.                                                                                       |

## Handoff

Run `npm ci` and `npm run dev` from the portfolio directory. Tune route length, scroll range, damping, stop positions, and panel transforms in `src/app/drive/config.ts`. Tune the enlarged launcher in `src/app/dashboard/launcher.css`, projected spacing in `src/app/console/style.css`, and role data in `src/app/dashboard/content.ts`. See the portfolio README for controls and direct URLs.

Vite reports a 628.62 kB minified lazy 3D chunk. The readable entry stays separate. Touch verification used Chrome emulation. The linked reference video was unavailable during inspection.
