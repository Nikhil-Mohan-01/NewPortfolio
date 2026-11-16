import {
  Matrix4,
  Mesh,
  Raycaster,
  Vector3,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import {
  appIcon,
  apps,
  dockApps,
  homeGlyph,
  type AppId,
} from "../dashboard/apps";
import { bindIntentionalClick } from "../intentional-click";
import { CONSOLE } from "./config";
import "./style.css";

export type OpenApp = (app: AppId | "home", opener: HTMLElement) => void;

export function mountConsoleScreen(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  camera: PerspectiveCamera,
  car: Object3D,
  open: OpenApp,
) {
  const listeners = new AbortController();
  const screen = document.createElement("div");
  screen.className = "console-screen";
  screen.hidden = true;
  screen.setAttribute("role", "group");
  screen.setAttribute("aria-label", "Centre console dashboard");
  screen.innerHTML = `
    <div class="app-dock" role="group" aria-label="Centre console shortcuts">
      <button class="app-dock-home" type="button" aria-label="Open dashboard home on centre console" data-app="home">${homeGlyph}</button>
      ${dockApps.map((app) => `<button type="button" aria-label="${app.label} shortcut" data-app="${app.id}">${appIcon(app)}</button>`).join("")}
    </div>
    <div class="console-apps">${apps
      .map(
        (app) => `
      <button type="button" data-app="${app.id}">${appIcon(app)}<span>${app.label}</span></button>
    `,
      )
      .join("")}</div>`;
  for (const button of screen.querySelectorAll<HTMLButtonElement>("button")) {
    const app = button.dataset.app as AppId | "home";
    bindIntentionalClick(button, () => open(app, button), listeners.signal);
  }
  container.append(screen);

  const center = new Vector3(...CONSOLE.center);
  const widthAxis = new Vector3(...CONSOLE.right)
    .normalize()
    .multiplyScalar(CONSOLE.halfWidth);
  const heightAxis = new Vector3(...CONSOLE.up)
    .normalize()
    .multiplyScalar(CONSOLE.halfHeight);
  const topLeft = center.clone().sub(widthAxis).add(heightAxis);
  const topRight = center.clone().add(widthAxis).add(heightAxis);
  const bottomLeft = center.clone().sub(widthAxis).sub(heightAxis);
  const bottomRight = center.clone().add(widthAxis).sub(heightAxis);
  const corners = [topLeft, topRight, bottomLeft, bottomRight];
  car.updateWorldMatrix(true, true);
  for (const point of [center, ...corners]) car.localToWorld(point);

  const normal = new Vector3()
    .subVectors(bottomLeft, topLeft)
    .cross(new Vector3().subVectors(topRight, topLeft))
    .normalize();
  const blockers: Mesh[] = [];
  car.traverseVisible((node) => {
    if (
      node instanceof Mesh &&
      !Array.isArray(node.material) &&
      !node.material.transparent
    ) {
      blockers.push(node);
    }
  });
  const eye = new Vector3().setScalar(Infinity);
  const nextEye = new Vector3();
  const ray = new Raycaster();
  const delta = new Vector3();
  const occlusionSamples = [
    center,
    ...corners.map((corner) => center.clone().lerp(corner, 0.72)),
  ];
  const points = corners.map(() => new Vector3());
  const lastCamera = new Matrix4();
  const lastProjection = new Matrix4();
  let width = 0;
  let height = 0;
  let dirty = true;
  let clear = false;

  function update() {
    camera.updateWorldMatrix(true, false);
    if (
      !dirty &&
      lastCamera.equals(camera.matrixWorld) &&
      lastProjection.equals(camera.projectionMatrix)
    )
      return;
    dirty = false;
    lastCamera.copy(camera.matrixWorld);
    lastProjection.copy(camera.projectionMatrix);
    nextEye.setFromMatrixPosition(camera.matrixWorld);
    if (!nextEye.equals(eye)) {
      eye.copy(nextEye);
      clear =
        delta.subVectors(eye, center).dot(normal) > 0 &&
        occlusionSamples.every((point) => {
          delta.subVectors(point, eye);
          ray.far = delta.length() - 0.004;
          ray.set(eye, delta.normalize());
          return !ray.intersectObjects(blockers, false).length;
        });
    }
    let visible = clear && width > 0 && height > 0;
    if (visible) {
      corners.forEach((corner, index) =>
        points[index].copy(corner).project(camera),
      );
      visible = points.every(
        ({ x, y, z }) =>
          Math.abs(x) < 0.99 && Math.abs(y) < 0.99 && z > -1 && z < 1,
      );
    }
    if (visible) {
      const [tl, tr, bl] = points;
      const [px, py] = CONSOLE.pixels;
      const x = ((tl.x + 1) * width) / 2;
      const y = ((1 - tl.y) * height) / 2;
      const a = ((tr.x - tl.x) * width) / (2 * px);
      const b = ((tl.y - tr.y) * height) / (2 * px);
      const c = ((bl.x - tl.x) * width) / (2 * py);
      const d = ((tl.y - bl.y) * height) / (2 * py);
      visible = Math.hypot(a, b) * px >= 105 && a * d - b * c > 0;
      if (visible)
        screen.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})`;
    }
    if (!visible && screen.contains(document.activeElement)) {
      container.parentElement
        ?.querySelector<HTMLElement>("[data-open-dashboard]")
        ?.focus({ preventScroll: true });
    }
    screen.hidden = !visible;
  }

  return {
    center,
    update,
    resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dirty = true;
      update();
    },
    dispose() {
      listeners.abort();
      screen.remove();
    },
  };
}
