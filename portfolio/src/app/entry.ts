import { createDashboard } from "./dashboard/view";
import {
  readRoute,
  STREET_EXPERIENCE,
  type DashboardRoute,
} from "./dashboard/routes";
import { DRIVE_ROUTE } from "./drive/config";
import { mountExperience } from "./drive/experience";
import { createScrollDrive } from "./drive/scroll";
import type { DriveScene } from "./main";
import { createMusicControls } from "./music/controls";
import "./style.css";

type Phase = "cockpit" | "entering" | "dashboard" | "exiting";

const track = document.querySelector<HTMLElement>("#drive-track")!;
const cockpit = document.querySelector<HTMLElement>("#cockpit")!;
const street = document.querySelector<HTMLElement>("#street")!;
const dashboard = document.querySelector<HTMLElement>("#dashboard")!;
const veil = cockpit.querySelector<HTMLElement>(".drive-veil")!;
const view = createDashboard(dashboard);
const music = createMusicControls();
const listeners = new AbortController();
const options = { signal: listeners.signal };
const originalScrollRestoration = history.scrollRestoration;
history.scrollRestoration = "manual";
let phase: Phase = "cockpit";
let scene: DriveScene | undefined;
let loading = false;
let sceneUnavailable = false;
let opener: HTMLElement | undefined;
let shownHash: string | undefined;
let experienceActive = false;
const experiencePositionKey = "nikhil-portfolio.experience-position";
let experienceDistance: number | undefined;
try {
  const stored = sessionStorage.getItem(experiencePositionKey);
  if (stored !== null) {
    const distance = Number(stored);
    if (
      Number.isFinite(distance) &&
      distance >= 0 &&
      distance <= DRIVE_ROUTE.length
    )
      experienceDistance = distance;
  }
} catch {
  // The route can still remember its position within the current page.
}
const useReadingByDefault = matchMedia(
  "(max-width: 680px), (pointer: coarse), (prefers-reduced-motion: reduce)",
);
const progressMeter =
  document.querySelector<HTMLProgressElement>("#route-progress")!;
const startButton = cockpit.querySelector<HTMLButtonElement>("[data-start]")!;
const drive = createScrollDrive(track, (progress) => {
  progressMeter.value = 100 * progress;
  startButton.hidden = progress < 0.999;
});
startButton.addEventListener("click", () => drive.go(0), options);
const timeline = mountExperience(
  cockpit,
  navigateExperience,
  (reading) => {
    if (phase !== "cockpit") return;
    drive.lock(reading);
    scene?.setInteraction(!reading);
  },
  (index) => {
    navigateExperience(index);
    scene?.viewStop();
  },
);
let lastRouteDistance = -1;
let lastIntendedDistance = -1;

function updateTimeline() {
  if (!experienceActive) return;
  const distance = drive.distance;
  const intent = drive.intendedDistance;
  if (distance === lastRouteDistance && intent === lastIntendedDistance) return;
  lastRouteDistance = distance;
  lastIntendedDistance = intent;
  timeline.update(distance, intent);
}

function navigateExperience(action: number | "previous" | "next") {
  const { stops } = DRIVE_ROUTE;
  const position = drive.intendedDistance;
  const index =
    typeof action === "number"
      ? action
      : action === "next"
        ? stops.findIndex((stop) => stop > position + 0.12)
        : stops.reduce(
            (previous, stop, i) => (stop < position - 0.12 ? i : previous),
            -1,
          );
  if (index >= 0) {
    drive.go(stops[index]);
    updateTimeline();
  }
}

function rememberExperience() {
  experienceDistance = drive.distance;
  try {
    sessionStorage.setItem(experiencePositionKey, String(experienceDistance));
  } catch {
    // Storage may be unavailable in this browser.
  }
}

function setExperience(enabled: boolean) {
  if (enabled === experienceActive) return;
  experienceActive = enabled;
  timeline.setActive(enabled);
  scene?.setExperience(enabled);
  if (enabled) {
    drive.go(experienceDistance ?? DRIVE_ROUTE.stops[0], !!scene);
    updateTimeline();
    timeline.focus();
  } else {
    rememberExperience();
    timeline.closeForNavigation();
  }
}

function showDashboard(route: DashboardRoute, moveFocus: boolean) {
  phase = "dashboard";
  setExperience(false);
  drive.lock(true);
  scene?.setInteraction(false);
  scene?.setActive(false);
  cockpit.inert = true;
  cockpit.hidden = true;
  dashboard.hidden = false;
  music.panel.remove();
  view.show(
    route,
    sceneUnavailable ? "unavailable" : scene ? "return" : "explore",
    sceneUnavailable
      ? "The 3D drive is unavailable. You can still browse the full portfolio here."
      : "",
  );
  dashboard.querySelector("[data-music-slot]")?.append(music.panel);
  shownHash = location.hash;
  if (moveFocus) view.focus();
}

function failScene() {
  if (sceneUnavailable || listeners.signal.aborted) return;
  sceneUnavailable = true;
  scene?.dispose();
  scene = undefined;
  if (!readRoute(location.hash))
    history.replaceState(
      null,
      "",
      location.hash === STREET_EXPERIENCE ? "#/experience" : "#/home",
    );
  showDashboard(readRoute(location.hash) ?? { id: "home" }, true);
}

function loadScene() {
  if (loading || scene || sceneUnavailable) return;
  loading = true;
  void import("./main")
    .then(({ mountScene }) => {
      if (listeners.signal.aborted) return;
      return mountScene(street, {
        drive,
        open(app, element) {
          if (phase !== "cockpit") return;
          opener = element;
          location.hash =
            app === "experience" && !useReadingByDefault.matches
              ? STREET_EXPERIENCE
              : `#/${app}`;
        },
        failure: failScene,
        readExperience: (index) => timeline.open(index),
        travel: updateTimeline,
        shade: (opacity) => {
          veil.style.opacity = String(opacity);
        },
      });
    })
    .then((mounted) => {
      if (!mounted) return;
      if (listeners.signal.aborted || sceneUnavailable) mounted.dispose();
      else {
        scene = mounted;
        scene.setActive(phase !== "dashboard");
        scene.setInteraction(phase === "cockpit" && !timeline.reading);
        scene.setExperience(experienceActive);
      }
    })
    .catch(failScene);
}

function revealCockpit() {
  dashboard.hidden = true;
  track.hidden = false;
  cockpit.hidden = false;
  street.prepend(music.panel);
  scene?.setActive(true);
}

function settleCockpit(restoreFocus: boolean) {
  scene?.restoreDriver();
  phase = "cockpit";
  shownHash = undefined;
  revealCockpit();
  cockpit.inert = false;
  drive.lock(false);
  scene?.setInteraction(true);
  const exploring = location.hash === STREET_EXPERIENCE;
  setExperience(exploring);
  loadScene();
  if (restoreFocus && !exploring) {
    const restore =
      opener?.isConnected && opener.getClientRects().length
        ? opener
        : cockpit.querySelector<HTMLElement>("[data-open-dashboard]");
    restore?.focus({ preventScroll: true });
    opener = undefined;
  }
}

function sync(moveFocus = true) {
  const route = readRoute(location.hash);
  if (sceneUnavailable) {
    if (shownHash !== location.hash)
      showDashboard(route ?? { id: "home" }, moveFocus);
    return;
  }
  if (!route) {
    if (phase === "exiting") return;
    if (phase === "dashboard" && scene) {
      cockpit.inert = true;
      phase = "exiting";
      if (scene.exit(() => settleCockpit(true))) {
        revealCockpit();
        return;
      }
    }
    settleCockpit(moveFocus && (phase !== "cockpit" || experienceActive));
    return;
  }
  if (phase === "entering") return;
  if (timeline.reading) timeline.closeForNavigation();
  if (phase === "exiting") scene?.restoreDriver();
  const skipFlight =
    location.hash === "#/simple" || opener?.hasAttribute("data-direct-link");
  if (phase === "cockpit") setExperience(false);
  if (
    phase === "cockpit" &&
    !skipFlight &&
    scene?.enter(() => {
      const latest = readRoute(location.hash);
      if (latest) showDashboard(latest, true);
      else settleCockpit(true);
    })
  ) {
    phase = "entering";
    drive.lock(true);
    cockpit.inert = true;
    scene.setInteraction(false);
    return;
  }
  if (phase !== "dashboard" || shownHash !== location.hash)
    showDashboard(route, moveFocus);
}

if (location.hash === STREET_EXPERIENCE)
  history.replaceState(null, "", "#/experience");
else if (
  !location.hash &&
  matchMedia("(max-width: 680px), (pointer: coarse)").matches
) {
  history.replaceState(null, "", "#/home");
}
cockpit.addEventListener(
  "click",
  (event) => {
    const link = (event.target as HTMLElement).closest<HTMLElement>(
      "a[href^='#/']",
    );
    if (link) opener = link;
  },
  options,
);

dashboard.addEventListener(
  "click",
  (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      sceneUnavailable ||
      location.hash === "#/simple" ||
      useReadingByDefault.matches
    )
      return;
    const link = (event.target as Element).closest(
      '[data-launch-app="experience"]',
    );
    if (!link) return;
    event.preventDefault();
    location.hash = STREET_EXPERIENCE;
  },
  options,
);

window.addEventListener("hashchange", () => sync(), options);
window.addEventListener(
  "pagehide",
  () => {
    if (experienceActive) rememberExperience();
  },
  options,
);
window.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape" || timeline.reading) return;
    const route = readRoute(location.hash);
    if (!route || phase === "cockpit") return;
    if (phase === "entering") {
      event.preventDefault();
      location.hash = "#/car";
    } else if (phase === "dashboard") {
      if (route.id === "home" && (!scene || sceneUnavailable)) return;
      event.preventDefault();
      location.hash =
        route.id === "projects" && route.project
          ? "#/projects"
          : route.id === "home"
            ? "#/car"
            : "#/home";
    }
  },
  options,
);

sync(false);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    listeners.abort();
    music.dispose();
    drive.dispose();
    timeline.dispose();
    history.scrollRestoration = originalScrollRestoration;
    scene?.dispose();
  });
}
