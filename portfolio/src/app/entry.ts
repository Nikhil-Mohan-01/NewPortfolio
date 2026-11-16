import { createDashboard } from "./dashboard/view";
import { readRoute } from "./dashboard/routes";
import { createMusicControls } from "./music/controls";
import "./style.css";

const cockpit = document.querySelector<HTMLElement>("#cockpit")!;
const dashboard = document.querySelector<HTMLElement>("#dashboard")!;
const view = createDashboard(dashboard);
const music = createMusicControls();
const listeners = new AbortController();
const options = { signal: listeners.signal };
let sceneLoad: Promise<unknown> | undefined;
let sceneUnavailable = false;
let opener: HTMLElement | undefined;

function render(moveFocus = true) {
  const route = readRoute(location.hash);
  if (route || sceneUnavailable) {
    cockpit.hidden = true;
    cockpit.inert = true;
    dashboard.hidden = false;
    // Hold the single player and controls in memory when switching apps.
    music.panel.remove();
    view.show(
      route ?? { id: "home" },
      sceneUnavailable ? "unavailable" : sceneLoad ? "return" : "explore",
      sceneUnavailable
        ? "The 3D drive is unavailable. You can still browse the full portfolio here."
        : "",
    );
    dashboard.querySelector("[data-music-slot]")?.append(music.panel);
    if (moveFocus) view.focus();
    return;
  }
  const returning = !dashboard.hidden;
  dashboard.hidden = true;
  cockpit.hidden = false;
  cockpit.inert = false;
  document.querySelector("#street")?.prepend(music.panel);
  if (!sceneLoad) {
    sceneLoad = import("./main").catch(() => {
      sceneUnavailable = true;
      if (!readRoute(location.hash)) history.replaceState(null, "", "#/home");
      render();
    });
  } else {
    // Resize the single scene after it returns from display:none.
    window.dispatchEvent(new Event("resize"));
  }
  if (returning && moveFocus) {
    const restore =
      opener?.isConnected && opener.getClientRects().length
        ? opener
        : cockpit.querySelector<HTMLElement>("[data-open-dashboard]");
    restore?.focus({ preventScroll: true });
  }
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

window.addEventListener("hashchange", () => render(), options);
dashboard.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;
    const route = readRoute(location.hash);
    if (!route) return;
    event.preventDefault();
    location.hash =
      route.id === "projects" && route.project
        ? "#/projects"
        : route.id === "home" && sceneLoad && !sceneUnavailable
          ? "#/car"
          : "#/home";
  },
  options,
);

render(false);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    listeners.abort();
    music.dispose();
  });
}
