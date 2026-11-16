# Plan for the complete portfolio

Spec `specs/MASTER_Portfolio_Completion_Codex.md`
Branch `feat/complete-portfolio`
Status in progress

## Goal

Ship a complete factual portfolio that opens from the R34 console and remains fully readable without loading the scene.

## Repository findings

The lighting and music branch contains the latest complete cockpit, including driver look. GitHub main still ends at the retro filter, so this branch starts from the lighting and music branch. Vite, strict TypeScript, Three.js and the existing repo scripts are sufficient. The original one-page resume was found and its three embedded profile/project URLs match the brief.

## Decisions

- Build a typed shared content catalogue and a semantic HTML hash-routed dashboard.
- Load the cockpit on demand, reuse one render loop, and mount a projected console launcher in the original radio display area.
- Share one audio player and control panel between the cockpit and Music app.
- Publish source milestones to GitHub. No deployment configuration or authorized production target for this checkout was found.

## Milestones

- [x] Deliver content, shareable routes, launcher, resume and contact.
- [ ] Integrate the real console and transition, restore the driver view and keep independent reading access.
- [ ] Exercise desktop, mobile, failure, navigation, and production flows. Document findings.

## Risks

The radio is small at the default driver pose. Maintain a persistent full-size dashboard shortcut and verify screen placement against model geometry. Route changes can interrupt a camera transition, so settle from the latest navigation intent. Keep the model load separate from core content.

## Progress

- 2026-11-16. Inspected the repository and current reference, located the authorized resume, and checked external destinations.

- 2026-11-16. Built the eight-app launcher, typed content and hash-routed sections. Verified all project details, original PDF response and download, email fallback, music navigation and portrait reading in Chrome.

## Verification

Pending.
