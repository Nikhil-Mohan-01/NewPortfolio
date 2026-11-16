import { DRIVER_LOOK } from "./driver-look/config";

export function bindIntentionalClick(
  button: HTMLButtonElement,
  activate: () => void,
  signal: AbortSignal,
) {
  const options = { signal };
  let down: { id: number; x: number; y: number; moved: boolean } | undefined;
  let allowedClick: number | undefined;
  const movedTooFar = (event: PointerEvent) =>
    !!down &&
    Math.hypot(event.clientX - down.x, event.clientY - down.y) >
      DRIVER_LOOK.dragThresholdPixels;
  button.addEventListener(
    "pointerdown",
    (event) => {
      if (down || !event.isPrimary || event.button !== 0) return;
      allowedClick = undefined;
      down = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
      button.setPointerCapture(event.pointerId);
    },
    options,
  );
  button.addEventListener(
    "pointermove",
    (event) => {
      if (down?.id === event.pointerId && movedTooFar(event)) down.moved = true;
    },
    options,
  );
  button.addEventListener(
    "pointerup",
    (event) => {
      if (down?.id !== event.pointerId) return;
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      if (!down.moved && !movedTooFar(event) && button.contains(hit))
        allowedClick = event.pointerId;
      down = undefined;
    },
    options,
  );
  for (const type of ["lostpointercapture", "pointercancel"] as const) {
    button.addEventListener(
      type,
      (event) => {
        if (down?.id === event.pointerId) down = undefined;
      },
      options,
    );
  }
  const cancel = () => {
    const id = down?.id;
    down = undefined;
    allowedClick = undefined;
    if (id !== undefined && button.hasPointerCapture(id))
      button.releasePointerCapture(id);
  };
  window.addEventListener("blur", cancel, options);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) cancel();
    },
    options,
  );
  button.addEventListener(
    "click",
    (event) => {
      const intentional =
        event.detail === 0 ||
        (allowedClick !== undefined &&
          (!("pointerId" in event) || allowedClick === event.pointerId));
      allowedClick = undefined;
      if (intentional) activate();
      else event.preventDefault();
    },
    options,
  );
}
