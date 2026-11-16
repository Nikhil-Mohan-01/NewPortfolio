import {
  Matrix4,
  Mesh,
  Raycaster,
  Vector3,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import { bindIntentionalClick } from "../intentional-click";
import { DRIVER_LOOK } from "./config";

export function mountResetControls(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  camera: PerspectiveCamera,
  car: Object3D,
  reset: () => void,
) {
  const listeners = new AbortController();
  const hint = document.createElement("p");
  hint.id = "driver-look-hint";
  hint.className = "driver-look-hint";
  const mouseHint = document.createElement("span");
  mouseHint.className = "driver-look-mouse-hint";
  mouseHint.textContent = "Hold left click and drag to look around.";
  const touchHint = document.createElement("span");
  touchHint.className = "driver-look-touch-hint";
  touchHint.textContent = "Drag to look around.";
  const keyboardHint = document.createElement("span");
  keyboardHint.className = "driver-look-sr";
  keyboardHint.textContent =
    " Use the arrow keys when the driver view has focus.";
  hint.append(mouseHint, touchHint, keyboardHint);

  const consoleButton = createResetButton(
    "driver-look-console",
    "Reset View on centre console",
  );
  consoleButton.hidden = true;
  const fallback = createResetButton("driver-look-fallback", "Reset View");
  container.append(hint, consoleButton, fallback);
  for (const button of [consoleButton, fallback]) {
    bindIntentionalClick(button, reset, listeners.signal);
  }

  const anchor = DRIVER_LOOK.console;
  const center = new Vector3(...anchor.position).addScaledVector(
    new Vector3(...anchor.outward).normalize(),
    anchor.standoff,
  );
  const outside = center
    .clone()
    .add(new Vector3(...anchor.outward).multiplyScalar(anchor.standoff));
  const across = new Vector3(...anchor.horizontal)
    .normalize()
    .multiplyScalar(anchor.halfWidth);
  const left = center.clone().sub(across);
  const right = center.clone().add(across);
  car.updateWorldMatrix(true, true);
  for (const point of [center, left, right, outside]) car.localToWorld(point);
  outside.sub(center).normalize();

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
  const direction = new Vector3();
  const ndc = new Vector3();
  const leftNdc = new Vector3();
  const rightNdc = new Vector3();
  let width = 0;
  let height = 0;
  let clear = false;
  const lastWorld = new Matrix4();
  const lastProjection = new Matrix4();
  let projectionDirty = true;

  function update() {
    camera.updateWorldMatrix(true, false);
    if (
      !projectionDirty &&
      lastWorld.equals(camera.matrixWorld) &&
      lastProjection.equals(camera.projectionMatrix)
    )
      return;
    projectionDirty = false;
    lastWorld.copy(camera.matrixWorld);
    lastProjection.copy(camera.projectionMatrix);
    nextEye.setFromMatrixPosition(camera.matrixWorld);
    if (!nextEye.equals(eye)) {
      eye.copy(nextEye);
      // In the stationary cabin, visibility along each anchor ray only changes if the eye moves.
      clear =
        direction.subVectors(eye, center).dot(outside) > 0 &&
        [center, left, right].every((point) => {
          direction.subVectors(point, eye);
          ray.far = direction.length() - 0.002;
          ray.set(eye, direction.normalize());
          return ray.intersectObjects(blockers, false).length === 0;
        });
    }
    ndc.copy(center).project(camera);
    leftNdc.copy(left).project(camera);
    rightNdc.copy(right).project(camera);
    const x = ((ndc.x + 1) * width) / 2;
    const y = ((1 - ndc.y) * height) / 2;
    const dx = ((rightNdc.x - leftNdc.x) * width) / 2;
    const dy = ((leftNdc.y - rightNdc.y) * height) / 2;
    const targetWidth = Math.max(
      anchor.minWidthPixels,
      Math.min(anchor.maxWidthPixels, Math.hypot(dx, dy)),
    );
    const angle = Math.atan2(dy, dx);
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    const marginX = (targetWidth * cos + anchor.hitHeightPixels * sin) / 2;
    const marginY = (targetWidth * sin + anchor.hitHeightPixels * cos) / 2;
    const visible =
      clear &&
      ndc.z > -1 &&
      ndc.z < 1 &&
      x >= marginX &&
      x <= width - marginX &&
      y >= marginY &&
      y <= height - marginY;
    if (!visible && document.activeElement === consoleButton)
      fallback.focus({ preventScroll: true });
    consoleButton.hidden = !visible;
    if (visible) {
      consoleButton.style.width = `${targetWidth}px`;
      consoleButton.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad)`;
    }
  }

  return {
    update,
    resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      projectionDirty = true;
      update();
    },
    dispose() {
      listeners.abort();
      hint.remove();
      consoleButton.remove();
      fallback.remove();
    },
  };
}

function createResetButton(className: string, label: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `driver-look-reset ${className}`;
  button.setAttribute("aria-label", label);

  const plate = document.createElement("span");
  plate.className = "driver-look-plate";
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.className = "driver-look-icon";
  icon.textContent = "↺";
  plate.append(icon, "Reset View");
  button.append(plate);
  return button;
}
