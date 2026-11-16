# MASTER BRIEF — Complete Nikhil Mohan's immersive portfolio

## Mission: ship a complete, usable website tonight

Work in the existing portfolio repository. Finish the website end to end, with real content, functioning navigation, a polished in-car dashboard, responsive reading views, and verified build/runtime behaviour. Implement the work; do not stop with a plan, skeleton, placeholder cards, or an offer to continue.

The content reference is https://nikhil-mohan.vercel.app/. The user's current development project contains the new Three.js experience and may differ from that deployed reference. Preserve the development work. The public URL is a content reference, not source-code access or proof that the new scene is deployed. If the existing repository is unavailable, ask for its location/access rather than trying to reconstruct the entire project from a deployed bundle.

Primary objective: a visitor can remember the immersive R34 night drive, then immediately understand Nikhil's experience and projects, open his resume, and contact him. Complete those tasks before adding decorative features.

Make routine design/implementation choices autonomously. Ask only for genuinely blocking missing repository access or assets. Missing optional project links must not stop completion: omit those link buttons and use the complete descriptions below. Do not fabricate facts, screenshots, destinations, or deployment results.

## Existing experience to preserve

Inspect what is actually implemented before changing it. Expected work from earlier stages:

- Nissan R34 with complete cabin, viewed from the driver's seat.
- Stationary car with a straight, single-lane neon Tokyo street moving past it.
- Pink/purple/blue signs, night fog, damp road appearance.
- Retro camera softness/grain/grade inspired broadly by atmospheric retro games.
- Left-button drag to look, bounded to +/-60 degrees horizontal and +/-45 degrees vertical relative to the default view.
- Console Reset View button and accessible recovery control.
- Headlights and modest cabin illumination.
- Optional looping music with explicit playback controls.

Do not rebuild working systems or migrate frameworks. Reuse package manager, installed dependencies, component conventions, existing renderer/composer, camera ownership, and input arbitration. No second canvas, competing camera loop, duplicate music player, or duplicate bloom. Fix missing/broken core features pragmatically; defer nonessential refinements.

Earlier briefs excluded dashboard UI while building the scene. This master brief now explicitly authorizes and prioritizes that UI. Retain earlier visual/input behaviour where it remains compatible.

## Definition of complete

1. A real interactive screen is mounted inside the car's centre console.
2. Its home screen contains eight labelled app icons in a 4-by-2 grid on desktop.
3. Clicking a section icon zooms toward the console and opens that section immediately in a full-screen readable interface.
4. Every section below contains finished factual copy and functioning actions.
5. Visitors can switch sections without returning to the car.
6. Return to Car restores the prior driver view; Reset View still restores the default view.
7. A direct/simple reading mode works independently of 3D loading and on mobile/unsupported devices.
8. Resume, email, GitHub, and LinkedIn links are accessible without solving the 3D interaction.
9. The production build passes and key flows are tested. Deployment status is reported accurately.

## Visual system: CarPlay structure with retro handheld character

Use an automotive app-launcher layout inspired by CarPlay, with original icons and restrained Game Boy-like pixel details. This is Nikhil's interface, not an Apple-branded replica. Do not add Apple logos or irrelevant Phone/Maps/Messages apps.

Style: charcoal housing, near-black blue-green display, pale cream text, mint-green primary accent, restrained amber/cyan/purple secondary icon colours. Pixel-inspired headings/icons, squared panels, small inset borders, and subtle pressed states provide character. Use a readable sans-serif/monospace font for paragraph text; do not write long descriptions in tiny pixel type. Avoid forcing a four-colour green palette onto every project image or the 3D world.

Starting palette: background #101719, panel #192426, primary text #EDF1DF, secondary text #B6C4BB, accent #B5E48C. Tune contrast against actual rendered colours. Body copy approximately 16–18 CSS px in full-screen reading mode with comfortable line height, bounded paragraph widths, and generous spacing. Use consistent 8px spacing increments as a starting system.

No heavy grain, CRT warp, chromatic aberration, flicker, or blur over readable content. Keep the current retro filter confined to 3D. Subtle static texture in UI is acceptable only if it doesn't reduce legibility. Project images must be real available assets or deliberately designed abstract covers clearly representing the project, not invented product screenshots.

### Eight apps — exact desktop arrangement

| Position | Label | Original icon idea | Destination |
| --- | --- | --- | --- |
| Row 1, column 1 | Projects | Pixel folder/cartridge | Project catalogue and details |
| Row 1, column 2 | Experience | Briefcase | Employment timeline |
| Row 1, column 3 | About | Profile silhouette | Intro and interests |
| Row 1, column 4 | Resume | Document | Resume summary, view/download actions |
| Row 2, column 1 | Skills | Code brackets/chip | Grouped technical skills |
| Row 2, column 2 | Education | Graduation cap | Waterloo and Shad |
| Row 2, column 3 | Contact | Envelope | Email, GitHub, LinkedIn |
| Row 2, column 4 | Music | Note/cassette | Controls for the existing shared music player |

All eight must be functional. Music can honestly show unavailable audio with a disabled play action if no asset exists, but implement player controls and source configuration. Do not invent a track or show fake playing status. Prefer completing an available licensed loop if possible.

## Console integration and transition

Inspect the actual model and select a radio/infotainment area on the centre console. Add an aftermarket-looking screen/bezel if the model lacks a usable screen. Mount it in car-local space with explicit transform configuration. Do not overwrite the car asset or place a floating tablet in the windshield. Keep Reset View reachable.

Use the existing stack's simplest reliable screen technique: world-anchored DOM with appropriate occlusion, or a 3D screen face with mapped click regions and a shared HTML interface for reading. Avoid rebuilding an entire browser UI as canvas-texture paragraphs. Use the same app metadata for in-car and full-screen launchers.

Initial screen: eight large labelled icons, a quiet NIKHIL OS title, and a short 'Select an app' hint if needed. Keep icons readable from the default camera; if screen targets become too small, allow clicking the screen surface to open its full-screen home. A fixed Open Dashboard shortcut must remain available regardless of where the viewer is looking.

One-click principle: clicking Projects in the car opens Projects, not an intermediary menu requiring a second click. Clicking blank screen/bezel space may open dashboard home.

Use an explicit interaction state model: cockpit -> entering -> dashboard -> exiting -> cockpit. Keep active app/project separate from transition state. One system owns camera animation and look controls at any time.

On entry:

1. Save the current driver pose/look offsets and the prior user-selected environment pause state.
2. Disable look-dragging and cancel its pointer capture. Prevent duplicate transitions from rapid clicks.
3. Animate camera position/orientation toward a verified screen-facing pose for roughly 450–650 ms. Use a path that avoids the wheel/dashboard and preserve proper coordinate transforms.
4. Blend into a full-viewport HTML dashboard at the end. Match screen colour/layout so the handoff feels continuous; avoid a giant perspective-stretched web page.
5. Pause or suspend hidden 3D rendering/scene animation to reduce distraction and GPU use, while preserving state. Keep audio governed by the user's existing playback choice.
6. Move keyboard focus to the opened section heading or appropriate control and remove hidden cockpit controls from tab order.

For reduced motion, skip camera travel and switch directly to the readable view. For return, restore the saved driver pose and prior paused/running state, re-enable look controls, and restore focus to the relevant opener. Return to Car should not silently reset the camera to centre. Reset View remains a distinct action.

If navigation interrupts a transition, settle into a coherent final state. Don't leave a transparent overlay trapping clicks, two active UIs, stale tweens, or a disabled camera. Test rapid open/back/return actions.

## Reading view and routing

Full-screen dashboard has a compact header, Home, Back when applicable, current section title, and Return to Car. Keep quick section navigation available without a camera transition. Give content the full usable viewport, not a tiny simulated physical screen. Use natural scrolling within a clearly defined content area; avoid nested scroll traps.

Use the project's router or simple hash routing for shareable sections and project details. Examples: #/projects, #/projects/protomind, #/experience. These are proposed routes, not preexisting URLs. Make browser Back/Forward work and ensure reload/deep linking opens content directly without waiting for the car model. Do not create a history entry on every scroll or camera movement.

Provide a clean Simple View using the same content source, not a second manually maintained copy. It can be a direct reading layout or a minimal dashboard mode. Keep 'Simple View', 'Resume', and 'Contact' immediately accessible in a small unobtrusive overlay while the scene loads.

Mobile: default to the readable launcher/content interface with an optional Explore the Car action. Reflow the eight apps into 2 columns when needed. No landscape lock, tiny desktop shrink-to-fit layout, or reliance on right-click. Keyboard/screen-reader users must access every app and action through semantic controls.

## Content authority and factual guardrails

The content below is ready to implement. It was compiled on November 16, 2026 from the supplied `Nikhil_Shopify_s27.pdf` and text/link data in the live portfolio's deployed JavaScript. This is content extraction, not verification of every linked project's live status or of technical claims beyond the supplied sources.

Use the resume for current employment titles/dates and new project details. Use the current site for additional project descriptions and existing links. Do not treat older site labels as newer than the resume. Avoid adding technologies, achievements, degrees, availability dates, client names, users, revenue, or performance numbers absent from these sources.

Public contact defaults: publish the professional email below. Do not add the resume's phone number as a separate website contact field. The user authorized using the supplied resume for the resume download itself, which contains that number.

### Identity and short copy

- Name: **Nikhil Mohan**
- Main line: **Computer Science at Waterloo. Building software, AI tools, and interactive experiences.**
- Intro: **I'm Nikhil, a Computer Science co-op student at the University of Waterloo. I've built security automation at LG Energy Solution, worked on multiplayer software at Paraverse Studios, and developed projects spanning AI workflows, developer tools, and computer vision.**
- Supporting line: **Explore my projects and experience through the dashboard, or open the simple view for a quick read.**
- Contact CTA: **Have an internship opportunity or an interesting project? Get in touch.**
- Email: `n24mohan@uwaterloo.ca`
- GitHub: `https://github.com/Nikhil-Mohan-01`
- LinkedIn target found on the live site: `https://www.linkedin.com/in/nikhil-mohan-7787372a6/`
- The resume displays a shortened LinkedIn label, but its embedded hyperlink confirms the same full LinkedIn destination above.

Do not headline a specific recruiting season unless the repository/user explicitly confirms it. The resume's file name alone is not a reason to announce public availability.

## Projects: finished content and ordering

Show the first three as featured. Include the remaining projects in the same catalogue, with the legacy portfolio less prominent. Use concise cards and substantial but bounded detail views. Each detail view needs Overview, What I built, Technical approach when sourced, Stack, and available links. Don't invent a lengthy challenge/solution story from a short description.

### 1. ProtoMind

- Date: March 2026.
- Category: AI / developer tools.
- Card: **Turn natural-language hardware specifications into CAD models, Arduino firmware, and structured component data.**
- Detail: **ProtoMind connects AI workflows with an interface for generating hardware-prototyping artifacts. Parallel LangGraph workflows validate structured outputs, check geometry, and regenerate invalid CAD outputs with up to three retries. FastAPI connects the workflows to the interface, while Docker packages reproducible backend environments and artifact generation.**
- Highlights: natural-language input to multiple engineering artifacts; schema validation and geometric checks; bounded automatic recovery; API/UI integration.
- Stack: Python, LangGraph, FastAPI, Docker.
- Repository from the resume's embedded hyperlink: `https://github.com/Nikhil-Mohan-01/ProtoMind`. Use this source-backed destination and check reachability. No live demo URL was supplied; omit that separate action unless verified.

### 2. Smart Model Router

- Date: 2025.
- Category: Developer tools / AI.
- Card: **A published VS Code extension for task-aware AI-model selection, cost estimates, and budget-aware recommendations.**
- Detail: **Smart Model Router integrates multiple model APIs and streaming responses into the editor workflow. It provides configurable provider selection, token and cost estimates, usage tracking, secure credential storage, and user-controlled model preferences to reduce manual model switching.**
- Outcome: **20+ installs without marketing**, as reported in the supplied resume. Do not present this as a live current marketplace count.
- Stack: TypeScript, VS Code API, REST APIs.
- Avoid the comparative claim about predating VS Code native routing; the concrete functionality is sufficient and doesn't require a historical product comparison.
- Marketplace/repository: exact URLs not supplied. Verify a match before adding; otherwise omit link actions without blocking the page.

### 3. Watopoly

- Date: November 2026.
- Category: C++ / software design.
- Card: **A C++20 Monopoly-style game built in a team of three, with a 40-square board, 2–6 players, and persistent game state.**
- Detail: **Implemented gameplay supporting trades, auctions, mortgages, bankruptcy, and save/load state. The project uses a polymorphic hierarchy for properties, gyms, residences, and event squares. Architecture work includes UML and resilience-to-change analysis, with Observer, Decorator, and Strategy patterns evaluated to isolate changing rules. Fixed dice rolls and seeded randomness provide deterministic controls for checking game behaviour.**
- Stack: C++20, object-oriented programming, design patterns, UML.
- Label: **Course project · Source private.**
- Do not publish private course code or claim every evaluated pattern was adopted. Do not conflate this with a separate web/WebSocket version under development elsewhere. No playable browser demo unless a verified one exists for this exact project.

### 4. Cube Hero Odyssey

- Category: Games / collaborative work.
- Card: **A 3D hack-and-slash roguelite featuring a caped hero, monster combat, and varied character builds.**
- Detail: **Contributed to a shipped game project listed on Steam. The existing portfolio reports more than 7,000 players.**
- Stack listed on the current site: Unity3D, C#, JavaScript, Blender, Git.
- Link: `https://store.steampowered.com/app/2954730/Cube_Hero_Odyssey/`
- Present this as a contribution/collaborative project, not sole authorship. The resume also reports 7,000+ players for Paraverse's multiplayer application; do not add these together or claim two independent audiences. Do not automatically attribute all resume backend work to this named title without evidence.

### 5. Activity Center

- Category: Mobile.
- Card: **A hangout-planning app for discovering nearby restaurants, attractions, and activities through a swipe interface.**
- Detail: **Built a mobile discovery experience that helps users explore local places and activities with a simple swipe-based interaction.**
- Stack: React Native, Expo, Firebase, Google Places API.
- Repository: `https://github.com/Nikhil-Mohan-01/Activity-Center`
- Do not invent active-user counts, production availability, group voting, or booking functionality.

### 6. Autonomous Turret

- Category: Computer vision / hardware.
- Card: **A pose-estimation prototype using computer vision to detect body and face positions in real time.**
- Detail: **Built a prototype using MediaPipe and DeepFace for real-time body/face-position detection, applying machine-learning and computer-vision concepts.**
- Stack listed on site: OpenCV, MediaPipe, DeepFace, Python, C/C++, Git.
- Demo: `https://youtu.be/HA06y33xMFA`
- Keep presentation focused on the documented vision prototype. Do not embellish with unverified capabilities, accuracy numbers, hardware specifications, or operational claims.

### 7. Online Speed Card Game

- Category: Full stack / real time.
- Card: **A real-time multiplayer card game with server-authoritative state and synchronized play.**
- Detail: **Built a multiplayer card-game application using Socket.IO to synchronize connected players while the server maintains authoritative game state.**
- Stack: Node.js, Express, Socket.IO, React, Vite, Tailwind CSS, Framer Motion, Docker, Google Cloud.
- No exact repository/demo link supplied on the extracted site. Omit unverified actions. Do not claim a currently running deployment solely from the listed cloud technology.

### 8. Original Portfolio Website

- Category: Web / earlier work.
- Card: **An earlier personal portfolio with a chatbot for questions about my work and experience.**
- Detail: **Built a portfolio to present projects and experience, with an interactive chatbot that lets visitors ask questions about me and my work.**
- Stack: ASP.NET, HTML/SASS, JavaScript, C#.
- Existing link: `https://nikhilmohan.azurewebsites.net/`
- Mark as an earlier portfolio. Check this link before displaying a live-site CTA. If unavailable, retain the description and omit the broken CTA; no need to rebuild its chatbot tonight.

Do not add other remembered projects not confirmed in these sources. The new immersive portfolio may be described as the website's design in a brief footer/credits note, but don't invent project metrics for it.

## Experience: exact titles, dates, and copy

### LG Energy Solution

**Software Engineer Intern (Cybersecurity)** · May–August 2026 · Windsor, Ontario.

- **Built a Python invoice reconciliation pipeline that reduced a recurring 6+ hour process to 1.78 seconds**, automating PDF extraction, field validation, and discrepancy detection.
- **Designed and deployed a centralized auditing service** with FastAPI, SQLite, Debian, and Caddy, securing scan uploads with HTTPS/TLS and access controls while retaining findings for return-to-service reviews.
- **Engineered cross-platform security scanners** with Python, PowerShell, and Bash for Windows, macOS, and Linux, combining SHA-256 hashing with auditable reports.

Use the time reduction as a prominent outcome with its process context, not a vague '10,000x' marketing claim. No proprietary screenshots, internal addresses, employer source-code links, or invented customer claims. The three systems may be expanded as work highlights inside this role, not duplicated as personal open-source projects.

### Paraverse Studios

**Software Engineering Intern** · January–April 2026 · Remote / Toronto, Ontario.

- Shipped features for a multiplayer application reaching **7,000+ players**, collaborating across engineering and design on integration and gameplay improvements.
- Built **Node.js and WebSocket backend services** to synchronize real-time player interactions and maintain consistent game state.
- Implemented **authentication, matchmaking, and session-state management** through collaborative Git-based development.

Use the resume title/dates rather than the older site's 'Junior Software Engineer' label. Preserve team attribution and avoid implying sole ownership.

### Code Ninjas

**Code Sensei (Instructor)** · July 2023–August 2025 · Windsor, Ontario.

Use this title/date/location with a short **Coding instruction and mentorship** descriptor. The supplied resume has no accomplishment bullets for this role; do not invent class sizes, teaching outcomes, or technologies here merely to fill space.

## Education

**University of Waterloo** · 2025–Present · Waterloo, Ontario.

Honours Computer Science (Co-op). **GPA: 3.9** as stated in the supplied resume; do not invent the denominator. Coursework: Data Abstraction, Object-Oriented Programming, Discrete Mathematics, Linear Algebra, Calculus I & II, Probability. No unconfirmed graduation year is required.

**Shad 2024** — National enrichment program focused on innovation, teamwork, and rapid prototyping, as described on the existing website.

## Skills

Display clean grouped tags, not animated percentage bars or unsupported proficiency ratings. Use the resume's spelling, normalized for readability:

- **Languages:** Python, C++, C, Java, JavaScript, TypeScript, C#, Bash, PowerShell.
- **Backend & data:** FastAPI, REST APIs, Node.js, Express, WebSockets, PostgreSQL, SQLite, MongoDB, Firebase, .NET.
- **AI & computer vision:** LangGraph, LangChain, TensorFlow, PyTorch, OpenCV, MediaPipe.
- **Infrastructure & tools:** Git/GitHub, Docker, Linux, Debian, Caddy, Azure, GCP, Playwright, Power BI, Claude Code, Codex, Valgrind, GCC, Hugging Face.

Skills are technologies listed in the resume, not claims of equal expertise. Feature relevant technologies beside the projects where supported.

## Resume and Contact apps

Copy the actual supplied resume into the project's static asset path, e.g. `public/resume/Nikhil_Mohan_Resume.pdf`, adapting to the existing framework. The user must supply `Nikhil_Shopify_s27.pdf` to the coding workspace if it isn't already there; this brief embeds its content but cannot embed the binary PDF.

Resume app: short professional summary, **Open PDF** and **Download PDF**, with the verified file path. Test it in a fresh browser request. A native preview is optional; do not make a fragile PDF embed the only way to access it. If the binary is absent, show the complete HTML resume content and a working print/save-as-PDF action; report the missing original asset instead of creating a fake PDF link. Keep completing the rest of the site.

Contact app: email address visible as text, working `mailto:n24mohan@uwaterloo.ca`, Copy Email with a fallback if clipboard access fails, GitHub, and the verified LinkedIn destination. Use a concise invitation to connect. No nonfunctional contact form, email service setup, chatbot, newsletter, or fabricated availability status is needed.

Use safe external-link behaviour and appropriate accessible names. Do not count a platform's bot block as evidence that a user's profile URL is wrong. If validation is blocked, retain source-backed URLs and report that live verification was inconclusive.

## Data architecture and content maintenance

Put profile, projects, experience, education, skills, and external links in a typed data module or equivalent single content source. Include stable project slugs and optional link fields. Null/absent links mean omit the CTA entirely, not render href='#', a disabled 'Coming soon' link, or an invented URL.

Use that source for launcher content, detail pages, simple view, and HTML resume. Keep authoring notes such as 'link not supplied' out of the public interface; report unresolved source details in the development handoff only. Preserve source provenance privately in comments or a small content-sources document.

Keep the eight app metadata items separate from detailed project data. No project card should open an empty modal. Use real screenshots only if available locally or legitimately obtained from the user's existing project assets. For missing visuals, use a restrained icon/technical diagram/abstract cover, not a fake screenshot. Do not let acquiring images delay usable content.

## Accessibility, loading, and performance

Render the introduction, direct content links, and readable content independently of WebGL readiness. Lazy-load large scene/model assets. A slow or failed 3D load must not block Projects, Experience, Resume, or Contact. Handle unavailable WebGL/context loss with the simple view and a concise status message, not a blank page.

Use semantic headings, links, and buttons with visible focus. On entering a modal-like dashboard, manage focus intentionally, make inactive background controls inert, and provide a consistent close/Return action. Avoid conflicting escape handlers: Escape should close the current nested detail or return one level according to the documented navigation model, not unpredictably reset everything.

Respect reduced motion by skipping camera flights and disabling auto-driving/animated noise as configured; keep intentional navigation working. Ensure adequate text contrast and practical touch targets. Do not require audio, panning, or discovering a tiny in-world button to reach content.

Suspend unnecessary 3D work while full-screen content is opaque. Preserve previous pause preference when returning. A shared music player can continue if the user chose to play it; never restart/unmute it on app changes. Keep audio controls independent from dragging and browser autoplay restrictions correctly handled.

Set a useful page title and description, e.g. 'Nikhil Mohan | Software Engineering Portfolio'. Add correct favicon and social metadata using actual available assets. Do not invent an OG image URL. Avoid a framework rewrite solely for SEO; ensure at least a reliable readable DOM content path.

## Tonight's delivery priorities

Treat the deadline as an ordering constraint, not permission to leave fake controls. Follow this sequence and finish each functional slice:

1. Audit current repository and run the baseline build. Identify existing scene/assets and confirm resume availability.
2. Add the complete content data and working readable dashboard sections, project details, links, and resume/contact actions.
3. Implement the eight-icon home and shared section navigation, direct URLs, simple view, and mobile layout.
4. Mount the console screen and implement the camera-to-HTML transition with reliable Return to Car.
5. Integrate look/reset/music/pause controls without conflicts. Preserve current visual work.
6. Run production build and interaction checks, fix blockers, and capture actual desktop/mobile views.
7. Deploy only through the repository's established authorized workflow. Report the exact resulting preview/production status and verify the resulting URL if deployment is performed.

Must finish tonight: populated content, eight app destinations, working console entry/return, readable mobile/simple mode, resume/contact actions, no broken internal navigation, clean production build.

Cut first if time is tight: decorative boot sequence, custom shader transitions, elaborate project imagery, extra hover sounds, live mirrors, new steering-wheel interaction, equalizers, additional cities, authentication, backend forms, AI chatbot. Keep the already working car/city; don't sacrifice core navigation to polish them again.

If a fancy zoom cannot be made reliable promptly, ship a brief camera ease/fade into the complete dashboard rather than a broken cinematic transition. Retain the immersive console entry and all content.

## Verification checklist

- [ ] Desktop launch shows the R34 scene plus immediately usable direct content actions.
- [ ] Eight labelled apps appear in the specified order, with no dummy destinations.
- [ ] In-car Projects/Experience clicks open the intended section in one action.
- [ ] All eight projects have factual summaries/detail content; only source-backed links are shown.
- [ ] Employment dates/titles match the resume; no duplicate player totals or sole-ownership claims.
- [ ] Section switching works inside the dashboard without camera flights.
- [ ] Return restores the saved driver view and prior scene pause state; Reset View remains distinct.
- [ ] Rapid repeated actions and interrupted transitions never leave invisible blocking overlays or disabled controls.
- [ ] Camera dragging does not activate UI; UI scrolling/sliders do not rotate the camera.
- [ ] Direct section/project links, browser Back/Forward, and reload work.
- [ ] Resume opens/downloads the actual file, or the clearly reported HTML/print fallback works.
- [ ] Email, copy-email fallback, GitHub, LinkedIn, and supplied project links are checked appropriately.
- [ ] Music UI controls one shared player and never claims playback after a failed request.
- [ ] Mobile portrait provides complete readable content; optional 3D remains optional.
- [ ] Keyboard, focus restoration, reduced motion, WebGL failure, and slow-model loading are checked.
- [ ] Hidden content/scene controls don't remain in the wrong tab order.
- [ ] Production build/type/lint checks pass, or any preexisting unrelated failures are clearly distinguished.
- [ ] Actual runtime is inspected at desktop and mobile sizes; no console errors or missing assets introduced.
- [ ] Any deployed result is verified; don't describe a local build as a live deployment.

Use meaningful tests for navigation state, interrupted transitions, content-link rendering, and input ownership if the repository supports them. Don't add brittle tests that merely reproduce markup. A successful build alone is not visual verification. If tools cannot inspect the running app, explicitly report remaining manual checks.

## Handoff requirements

Deliver a concise completion report with implemented features, actual preview/deployment URL or local run command, content/model/audio/resume configuration locations, checks performed, and any genuine remaining blockers. Provide screenshots from the running site when available. Do not say 'everything works' if key runtime tests were unavailable. Do not stop to ask permission for routine reversible implementation work already covered by this brief.

The finished result should feel like a personal night-drive portfolio with a useful dashboard, and should let a hurried visitor read the same information just as easily as a conventional portfolio.
