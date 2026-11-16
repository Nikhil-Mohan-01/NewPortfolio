import { createDashboard } from "./dashboard/view";
import { readRoute, type DashboardRoute } from "./dashboard/routes";
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
const progressMeter =
  document.querySelector<HTMLProgressElement>("#route-progress")!;
const startButton = cockpit.querySelector<HTMLButtonElement>("[data-start]")!;
const drive = createScrollDrive(track, (progress) => {
  progressMeter.value = 100 * progress;
  startButton.hidden = progress < 0.999;
});
startButton.addEventListener("click", () => drive.go(0), options);

function showDashboard(route: DashboardRoute, moveFocus: boolean) {
  phase = "dashboard";
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
  if (!readRoute(location.hash)) history.replaceState(null, "", "#/home");
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
          location.hash = `#/${app}`;
        },
        failure: failScene,
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
        scene.setInteraction(phase === "cockpit");
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
  loadScene();
  if (restoreFocus) {
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
    settleCockpit(moveFocus && phase !== "cockpit");
    return;
  }
  if (phase === "entering") return;
  if (phase === "exiting") scene?.restoreDriver();
  const skipFlight =
    location.hash === "#/simple" || opener?.hasAttribute("data-direct-link");
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

if (
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

window.addEventListener("hashchange", () => sync(), options);
window.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;
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
    history.scrollRestoration = originalScrollRestoration;
    scene?.dispose();
  });
}
