import { DRIVE_ROUTE } from "./config";

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function createScrollDrive(
  track: HTMLElement,
  report: (progress: number) => void,
) {
  const lifetime = new AbortController();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const options = { signal: lifetime.signal, passive: true };
  const root = document.documentElement;
  let target = 0;
  let rendered = 0;
  let locked = true;
  let savedOffset = 0;
  let expectedOffset: number | undefined;
  let navigation: { from: number; to: number; elapsed: number } | undefined;

  track.style.setProperty("--drive-scroll", `${DRIVE_ROUTE.scrollPixels}px`);
  const range = () =>
    Math.max(
      1,
      (document.scrollingElement ?? root).scrollHeight - window.innerHeight,
    );

  function put(progress: number) {
    const top = Math.round(progress * range());
    expectedOffset = top;
    window.scrollTo({ top, behavior: "instant" });
    target = clamp(window.scrollY / range());
  }

  function cancelNavigation() {
    navigation = undefined;
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) cancelNavigation();
    },
    options,
  );
  window.addEventListener("touchstart", cancelNavigation, options);
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        !event.defaultPrevented &&
        !event.ctrlKey &&
        !event.metaKey &&
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      ) {
        cancelNavigation();
      }
    },
    options,
  );
  window.addEventListener(
    "scroll",
    () => {
      if (locked) return;
      const offset = window.scrollY;
      if (expectedOffset !== undefined) {
        const matches = Math.abs(offset - expectedOffset) <= 0.5;
        expectedOffset = undefined;
        if (matches) return;
      }
      cancelNavigation();
      target = clamp(offset / range());
    },
    options,
  );
  window.addEventListener(
    "resize",
    () => {
      if (!locked) put(target);
    },
    options,
  );

  return {
    get distance() {
      return rendered * DRIVE_ROUTE.length;
    },
    get intendedDistance() {
      return (navigation?.to ?? target) * DRIVE_ROUTE.length;
    },
    lock(next: boolean) {
      if (locked === next && root.classList.contains("drive-locked") === next)
        return;
      locked = next;
      if (next) {
        cancelNavigation();
        savedOffset = track.hidden ? 0 : clamp(window.scrollY / range());
        target = rendered;
        root.classList.add("drive-locked");
      } else {
        root.classList.remove("drive-locked");
        put(savedOffset);
        target = rendered;
      }
    },
    go(distance: number, animate = true) {
      if (locked) return;
      const to = clamp(distance / DRIVE_ROUTE.length);
      if (animate && !motion.matches)
        navigation = { from: target, to, elapsed: 0 };
      else {
        cancelNavigation();
        put(to);
        rendered = target;
        report(rendered);
      }
    },
    update(seconds: number) {
      if (locked) return;
      const dt = Math.max(0, Math.min(seconds, 0.05));
      if (navigation) {
        navigation.elapsed += dt;
        const t = motion.matches
          ? 1
          : Math.min(1, navigation.elapsed / DRIVE_ROUTE.guidanceSeconds);
        put(
          navigation.from +
            (navigation.to - navigation.from) * (t * t * (3 - 2 * t)),
        );
        if (t === 1) navigation = undefined;
      }
      const difference = target - rendered;
      if (!difference) return;
      rendered =
        motion.matches || Math.abs(difference) < 0.00006
          ? target
          : rendered +
            difference * (1 - Math.exp(-dt / DRIVE_ROUTE.smoothingSeconds));
      report(rendered);
    },
    dispose() {
      lifetime.abort();
      root.classList.remove("drive-locked");
    },
  };
}

export type ScrollDrive = ReturnType<typeof createScrollDrive>;
