import {
  BoxGeometry,
  CanvasTexture,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Vector2,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import { experience, type Role } from "../dashboard/content";
import { DRIVER_LOOK } from "../driver-look/config";
import { DRIVE_ROUTE } from "./config";

const artwork = { width: 960, height: 452 };
const button = { x: 45, y: 336, width: 245, height: 78 };
const accents = ["#91b8ec", "#bfaee6", "#85c9b2"];

function panelTexture(role: Role, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = artwork.width;
  canvas.height = artwork.height;
  const context = canvas.getContext("2d")!;
  const accent = accents[index];

  context.fillStyle = "#252e41";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const backdrop = context.createLinearGradient(
    0,
    0,
    canvas.width,
    canvas.height,
  );
  backdrop.addColorStop(0, "#162438");
  backdrop.addColorStop(1, "#101728");
  context.fillStyle = backdrop;
  context.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
  context.fillStyle = accent;
  context.fillRect(8, 8, 9, canvas.height - 16);

  context.font = "700 63px system-ui";
  context.fillStyle = "#d3daea";
  context.fillText(role.company, 45, 89, artwork.width - 90);
  context.font = "650 39px system-ui";
  context.fillStyle = accent;
  context.fillText(role.title, 45, 146, artwork.width - 90);
  context.font = "600 34px system-ui";
  context.fillStyle = "#bac6da";
  context.fillText(role.dates, 45, 192);
  context.font = "700 47px system-ui";
  context.fillStyle = "#d3daea";
  wrap(context, role.headline, 45, 257, artwork.width - 90, 53);

  context.beginPath();
  context.roundRect(button.x, button.y, button.width, button.height, 14);
  context.fillStyle = accent;
  context.fill();
  context.font = "750 36px system-ui";
  context.fillStyle = "#10182a";
  context.fillText("Read More →", button.x + 15, button.y + 51);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
) {
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > width) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = next;
    }
  }
  context.fillText(line, x, y);
}

export function mountStreetPanels(
  root: Object3D,
  street: Object3D,
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
  reduced: MediaQueryList,
  readMore: (index: number) => void,
) {
  const { panel, stops } = DRIVE_ROUTE;
  const group = new Group();
  group.name = "Experience timeline";
  group.visible = false;
  root.add(group);
  const geometry = new PlaneGeometry(panel.width, panel.height);
  const legHeight = panel.y - panel.height / 2;
  const legGeometry = new BoxGeometry(0.057, legHeight, 0.085);
  const legMaterial = new MeshStandardMaterial({
    color: 0x253044,
    roughness: 0.72,
  });
  const surfaces = experience.map((role, index) => {
    const frame = new Group();
    frame.position.set(panel.x, panel.y, -stops[index] - panel.ahead);
    frame.rotation.y = MathUtils.degToRad(panel.yawDegrees);
    group.add(frame);

    const surface = new Mesh(
      geometry,
      new MeshBasicMaterial({
        map: panelTexture(role, index),
        transparent: true,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    surface.name = role.company;
    frame.add(surface);
    for (const side of [-1, 1]) {
      const leg = new Mesh(legGeometry, legMaterial);
      leg.position.set(
        side * panel.width * 0.35,
        -(panel.height + legHeight) / 2,
        -0.055,
      );
      frame.add(leg);
    }
    return surface;
  });

  const pointer = new Vector2();
  const ray = new Raycaster();
  const blockers: Mesh[] = [];
  let car: Object3D | undefined;
  let active = false;
  let interactive = false;
  let opacity = 0;
  let gesture:
    | { pointerId: number; index: number; x: number; y: number; moved: boolean }
    | undefined;
  const lifetime = new AbortController();
  const options = { signal: lifetime.signal };

  function hit(event: PointerEvent) {
    if (!active || !interactive || opacity < 0.66) return -1;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    );
    ray.setFromCamera(pointer, camera);
    ray.far = camera.far;
    const hit = ray.intersectObjects(surfaces, false)[0];
    if (!hit?.uv) return -1;
    const x = hit.uv.x * artwork.width;
    const y = (1 - hit.uv.y) * artwork.height;
    if (
      x < button.x ||
      x > button.x + button.width ||
      y < button.y ||
      y > button.y + button.height
    )
      return -1;
    blockers.length = 0;
    function addOpaque(node: Object3D) {
      if (
        node instanceof Mesh &&
        (Array.isArray(node.material)
          ? node.material.every((material) => !material.transparent)
          : !node.material.transparent)
      )
        blockers.push(node);
    }
    car?.traverseVisible(addOpaque);
    street.traverseVisible(addOpaque);
    ray.far = hit.distance - 0.003;
    return ray.intersectObjects(blockers, false).length
      ? -1
      : surfaces.indexOf(hit.object as (typeof surfaces)[number]);
  }

  function clearGesture() {
    const id = gesture?.pointerId;
    gesture = undefined;
    if (id !== undefined && canvas.hasPointerCapture(id))
      canvas.releasePointerCapture(id);
  }

  canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isPrimary || event.button !== 0 || gesture) return;
      const index = hit(event);
      if (index < 0) return;
      gesture = {
        index,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
      canvas.setPointerCapture(event.pointerId);
    },
    options,
  );
  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (gesture?.pointerId !== event.pointerId) return;
      if (
        Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) >
        DRIVER_LOOK.dragThresholdPixels
      )
        gesture.moved = true;
    },
    options,
  );
  canvas.addEventListener(
    "pointerup",
    (event) => {
      if (gesture?.pointerId !== event.pointerId) return;
      const { index, moved, x, y } = gesture;
      clearGesture();
      if (
        !moved &&
        Math.hypot(event.clientX - x, event.clientY - y) <=
          DRIVER_LOOK.dragThresholdPixels &&
        hit(event) === index
      )
        readMore(index);
    },
    options,
  );
  for (const eventType of ["pointercancel", "lostpointercapture"] as const) {
    canvas.addEventListener(
      eventType,
      (event) => {
        if (gesture?.pointerId === event.pointerId) clearGesture();
      },
      options,
    );
  }
  window.addEventListener("blur", clearGesture, options);

  return {
    ownsPointer(event: PointerEvent) {
      return gesture?.pointerId === event.pointerId;
    },
    setCar(model: Object3D) {
      car = model;
    },
    setActive(next: boolean) {
      active = next;
    },
    setInteraction(next: boolean) {
      interactive = next;
      if (!next) clearGesture();
    },
    update(distance: number, seconds: number) {
      group.position.z = distance;
      const next = active ? 1 : 0;
      if (opacity !== next) {
        opacity = reduced.matches
          ? next
          : MathUtils.clamp(
              opacity +
                (Math.min(seconds, 0.05) / panel.fadeSeconds) *
                  (active ? 1 : -1),
              0,
              1,
            );
        for (const surface of surfaces) surface.material.opacity = opacity;
      }
      group.visible = opacity > 0;
    },
    dispose() {
      lifetime.abort();
      clearGesture();
      for (const surface of surfaces) {
        surface.material.map?.dispose();
        surface.material.dispose();
      }
      geometry.dispose();
      legGeometry.dispose();
      legMaterial.dispose();
      group.removeFromParent();
    },
  };
}
