import { MathUtils, Quaternion, Vector3, type Camera } from "three";
import { DRIVER_LOOK } from "./config";

interface Angles {
  yaw: number;
  pitch: number;
}

interface Gesture {
  id: number;
  x: number;
  y: number;
  dragging: boolean;
}

export function createDriverLook(
  camera: Camera,
  canvas: HTMLCanvasElement,
  reducedMotion: MediaQueryList,
  ownsPointer?: (event: PointerEvent) => boolean,
) {
  const base = camera.quaternion.clone();
  const parentRotation = new Quaternion();
  const up = new Vector3();
  const yawRotation = new Quaternion();
  const pitchRotation = new Quaternion();
  const right = new Vector3(1, 0, 0);
  const forward = new Vector3(0, 0, -1).applyQuaternion(base);
  const aimDirection = new Vector3();
  const current: Angles = { yaw: 0, pitch: 0 };
  const target: Angles = { yaw: 0, pitch: 0 };
  const abort = new AbortController();
  const options = { signal: abort.signal };
  let enabled = true;
  let gesture: Gesture | undefined;
  let suppressClickFor: number | undefined;
  let resetStart: Angles | undefined;
  let resetElapsed = 0;
  let guiding = false;

  function apply() {
    up.set(0, 1, 0);
    if (camera.parent) {
      camera.parent.getWorldQuaternion(parentRotation);
      up.applyQuaternion(parentRotation.invert());
    }
    yawRotation.setFromAxisAngle(up, -MathUtils.degToRad(current.yaw));
    pitchRotation.setFromAxisAngle(right, MathUtils.degToRad(current.pitch));
    camera.quaternion.copy(yawRotation).multiply(base).multiply(pitchRotation);
  }

  function endGesture() {
    if (!gesture) return;
    const { id, dragging } = gesture;
    gesture = undefined;
    if (dragging) suppressClickFor = id;
    canvas.classList.remove("is-looking");
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }

  function cancelGuidance() {
    if (!resetStart && !guiding) return;
    resetStart = undefined;
    guiding = false;
    Object.assign(target, current);
  }

  function adjust(yaw: number, pitch: number) {
    target.yaw = MathUtils.clamp(
      target.yaw + yaw,
      -DRIVER_LOOK.yawLimitDegrees,
      DRIVER_LOOK.yawLimitDegrees,
    );
    target.pitch = MathUtils.clamp(
      target.pitch + pitch,
      -DRIVER_LOOK.pitchLimitDegrees,
      DRIVER_LOOK.pitchLimitDegrees,
    );
    if (reducedMotion.matches) {
      Object.assign(current, target);
      apply();
    }
  }

  canvas.addEventListener(
    "pointerdown",
    (event) => {
      suppressClickFor = undefined;
      if (
        !enabled ||
        event.pointerType === "touch" ||
        event.target !== canvas ||
        ownsPointer?.(event) ||
        gesture ||
        !event.isPrimary ||
        event.button !== 0
      )
        return;
      gesture = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        dragging: false,
      };
      canvas.setPointerCapture(event.pointerId);
    },
    options,
  );

  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (gesture?.id !== event.pointerId) return;
      if (!(event.buttons & 1)) {
        endGesture();
        return;
      }
      let dx = event.clientX - gesture.x;
      let dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        const distance = Math.hypot(dx, dy);
        if (distance <= DRIVER_LOOK.dragThresholdPixels) return;
        const excess = 1 - DRIVER_LOOK.dragThresholdPixels / distance;
        dx *= excess;
        dy *= excess;
        gesture.dragging = true;
        cancelGuidance();
        canvas.classList.add("is-looking");
      }
      gesture.x = event.clientX;
      gesture.y = event.clientY;
      adjust(
        dx * DRIVER_LOOK.sensitivityDegreesPerPixel,
        -dy * DRIVER_LOOK.sensitivityDegreesPerPixel,
      );
    },
    options,
  );

  for (const eventType of [
    "pointerup",
    "pointercancel",
    "lostpointercapture",
  ] as const) {
    canvas.addEventListener(
      eventType,
      (event) => {
        if (gesture?.id === event.pointerId) endGesture();
      },
      options,
    );
  }
  canvas.addEventListener(
    "click",
    (event) => {
      if (
        event.detail === 0 ||
        suppressClickFor === undefined ||
        ("pointerId" in event && event.pointerId !== suppressClickFor)
      )
        return;
      suppressClickFor = undefined;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { ...options, capture: true },
  );
  window.addEventListener("blur", endGesture, options);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) endGesture();
    },
    options,
  );

  canvas.addEventListener(
    "keydown",
    (event) => {
      if (
        !enabled ||
        event.target !== canvas ||
        document.activeElement !== canvas ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const step = DRIVER_LOOK.keyboardStepDegrees;
      const keys: Record<string, Angles> = {
        ArrowLeft: { yaw: -step, pitch: 0 },
        ArrowRight: { yaw: step, pitch: 0 },
        ArrowUp: { yaw: 0, pitch: step },
        ArrowDown: { yaw: 0, pitch: -step },
      };
      const offset = keys[event.key];
      if (!offset || !event.key.startsWith("Arrow")) return;
      event.preventDefault();
      cancelGuidance();
      adjust(offset.yaw, offset.pitch);
    },
    options,
  );

  canvas.tabIndex = 0;
  canvas.classList.add("driver-look-surface");
  canvas.setAttribute("aria-label", "Driver view");
  canvas.setAttribute("aria-describedby", "driver-look-hint");

  function finishReset() {
    resetStart = undefined;
    current.yaw = current.pitch = 0;
    camera.quaternion.copy(base);
  }

  return {
    setEnabled(next: boolean) {
      if (enabled === next) return;
      enabled = next;
      if (!enabled) {
        endGesture();
        cancelGuidance();
        Object.assign(target, current);
      }
    },
    aim(point: Vector3) {
      if (!enabled) return;
      endGesture();
      cancelGuidance();
      aimDirection.copy(point).sub(camera.position).normalize();
      const azimuth = (v: Vector3) => Math.atan2(v.x, -v.z);
      const yaw = MathUtils.radToDeg(azimuth(aimDirection) - azimuth(forward));
      const pitch = MathUtils.radToDeg(
        Math.asin(aimDirection.y) - Math.asin(forward.y),
      );
      guiding = !reducedMotion.matches;
      adjust(
        MathUtils.euclideanModulo(yaw + 180, 360) - 180 - target.yaw,
        pitch - target.pitch,
      );
    },
    reset() {
      if (!enabled) return;
      guiding = false;
      endGesture();
      target.yaw = target.pitch = 0;
      if (reducedMotion.matches) {
        finishReset();
      } else if (!resetStart && (current.yaw !== 0 || current.pitch !== 0)) {
        resetStart = { ...current };
        resetElapsed = 0;
      }
    },
    update(delta: number) {
      if (!enabled) return;
      const dt = MathUtils.clamp(delta, 0, 0.05);
      if (resetStart) {
        resetElapsed += dt;
        const progress = resetElapsed / DRIVER_LOOK.resetSeconds;
        if (reducedMotion.matches || progress >= 1) {
          finishReset();
          return;
        }
        const remaining = (1 - progress) ** 2 * (1 + 2 * progress);
        current.yaw = resetStart.yaw * remaining;
        current.pitch = resetStart.pitch * remaining;
        apply();
      } else if (current.yaw !== target.yaw || current.pitch !== target.pitch) {
        const alpha = reducedMotion.matches
          ? 1
          : 1 - Math.exp(-dt / DRIVER_LOOK.smoothingSeconds);
        current.yaw = approach(current.yaw, target.yaw, alpha);
        current.pitch = approach(current.pitch, target.pitch, alpha);
        if (current.yaw === target.yaw && current.pitch === target.pitch)
          guiding = false;
        apply();
      }
    },
    dispose() {
      abort.abort();
      endGesture();
      canvas.classList.remove("driver-look-surface");
      canvas.removeAttribute("tabindex");
      canvas.removeAttribute("aria-label");
      canvas.removeAttribute("aria-describedby");
    },
  };
}

function approach(current: number, target: number, alpha: number) {
  const next = MathUtils.lerp(current, target, alpha);
  return Math.abs(next - target) < 0.001 ? target : next;
}
