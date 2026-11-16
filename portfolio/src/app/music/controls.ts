import { bindIntentionalClick } from "../intentional-click";
import { NIGHT_MUSIC } from "./config";
import { createNightMusic } from "./player";
import "./style.css";

export function createMusicControls() {
  const lifetime = new AbortController();
  const panel = document.createElement("section");
  panel.className = "night-music";
  panel.setAttribute("aria-label", "Background music");
  panel.innerHTML = `
    <div class="night-music-controls">
      <button type="button" data-play>Play music</button>
      <button type="button" aria-label="Mute music" aria-pressed="false">Mute</button>
      <input type="range" aria-label="Music volume" min="0" max="100" step="1">
      <a aria-label="Music credit">Credit</a>
    </div>
    <p class="night-music-status" role="status"></p>
  `;

  const play = panel.querySelector<HTMLButtonElement>("[data-play]")!;
  const mute = panel.querySelector<HTMLButtonElement>("[aria-pressed]")!;
  const slider = panel.querySelector<HTMLInputElement>("input")!;
  const credit = panel.querySelector<HTMLAnchorElement>("a")!;
  const status = panel.querySelector<HTMLElement>("[role=status]")!;

  slider.value = String(NIGHT_MUSIC.initialVolume * 100);
  credit.href = NIGHT_MUSIC.creditUrl;
  credit.title = NIGHT_MUSIC.creditTitle;
  credit.target = "_blank";
  credit.rel = "noopener noreferrer";

  const player = createNightMusic((state) => {
    play.textContent = {
      paused: "Play music",
      loading: "Cancel loading",
      playing: "Pause music",
      error: "Retry music",
    }[state];
    status.textContent =
      state === "error"
        ? "Music unavailable. Select Retry music to try again."
        : "";
  });

  bindIntentionalClick(play, player.togglePlayback, lifetime.signal);
  bindIntentionalClick(
    mute,
    () => {
      const next = mute.getAttribute("aria-pressed") !== "true";
      mute.setAttribute("aria-pressed", String(next));
      player.setMuted(next);
    },
    lifetime.signal,
  );
  slider.addEventListener(
    "input",
    () => player.setVolume(slider.valueAsNumber / 100),
    { signal: lifetime.signal },
  );

  return {
    panel,
    dispose() {
      lifetime.abort();
      player.dispose();
      panel.remove();
    },
  };
}
