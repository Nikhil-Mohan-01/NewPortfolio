import { experience } from "../dashboard/content";
import { renderRoleDetails } from "../dashboard/view";
import { DRIVE_ROUTE } from "./config";
import "./style.css";

export function mountExperience(
  cockpit: HTMLElement,
  navigate: (action: number | "previous" | "next") => void,
  setReading: (reading: boolean) => void,
  viewStop: (index: number) => void,
) {
  const events = new AbortController();
  const options = { signal: events.signal };
  const navigation = document.createElement("section");
  navigation.className = "experience-route";
  navigation.hidden = true;
  navigation.setAttribute("aria-labelledby", "experience-route-title");
  navigation.innerHTML = `
    <header class="experience-route-header">
      <a href="#/experience" aria-label="Read the full experience list">List view</a>
      <h2 id="experience-route-title">Experience</h2>
      <p>Scroll to explore my experience.</p>
    </header>
    <div class="experience-navigation" aria-label="Stop navigation">
      <button type="button" data-previous aria-label="Previous Stop">← <span>Previous</span></button>
      <button type="button" data-next aria-label="Next Stop"><span>Next</span> →</button>
      <button type="button" data-restart>Start Over</button>
      <button type="button" data-view-stop>View Stop</button>
    </div>
    <ol class="experience-stops">
      ${experience.map((role, index) => `<li><button type="button" data-stop="${index}">${role.company}</button><button type="button" data-read="${index}" aria-label="Read More about ${role.company}">Read More</button></li>`).join("")}
    </ol>`;
  const dialog = document.createElement("dialog");
  dialog.className = "experience-detail";
  dialog.setAttribute("aria-labelledby", "experience-employer");
  dialog.innerHTML = `<form method="dialog"><button class="detail-close" autofocus>Close <span aria-hidden="true">×</span></button></form><div class="experience-detail-content"></div>`;
  cockpit.after(dialog);
  cockpit.append(navigation);

  const content = dialog.querySelector<HTMLElement>(
    ".experience-detail-content",
  )!;
  const stopButtons = Array.from(
    navigation.querySelectorAll<HTMLButtonElement>("[data-stop]"),
  );
  const readButtons = Array.from(
    navigation.querySelectorAll<HTMLButtonElement>("[data-read]"),
  );
  const previous =
    navigation.querySelector<HTMLButtonElement>("[data-previous]")!;
  const next = navigation.querySelector<HTMLButtonElement>("[data-next]")!;
  let opener: HTMLElement | undefined;
  let selected: number | undefined;

  function open(index: number, trigger = readButtons[index]) {
    const role = experience[index];
    if (!role || navigation.hidden || dialog.open) return;
    opener = trigger;
    content.innerHTML = `<h2 id="experience-employer">${role.company}</h2>
      <p class="experience-role">${role.title}</p>
      <p class="experience-meta">${role.dates} · ${role.location}</p>
      ${renderRoleDetails(role)}`;
    setReading(true);
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  function releaseDialog(restoreFocus: boolean) {
    if (!opener) return;
    const trigger = opener;
    opener = undefined;
    setReading(false);
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  dialog.addEventListener("close", () => releaseDialog(true), options);
  previous.addEventListener(
    "click",
    () => {
      if (previous.getAttribute("aria-disabled") !== "true")
        navigate("previous");
    },
    options,
  );
  next.addEventListener(
    "click",
    () => {
      if (next.getAttribute("aria-disabled") !== "true") navigate("next");
    },
    options,
  );
  navigation
    .querySelector("[data-restart]")!
    .addEventListener("click", () => navigate(0), options);
  navigation
    .querySelector("[data-view-stop]")!
    .addEventListener("click", () => viewStop(selected ?? 0), options);
  stopButtons.forEach((button, index) => {
    button.addEventListener("click", () => navigate(index), options);
  });
  readButtons.forEach((button, index) => {
    button.addEventListener("click", () => open(index, button), options);
  });

  return {
    get reading() {
      return dialog.open;
    },
    setActive(active: boolean) {
      navigation.hidden = !active;
      cockpit.classList.toggle("is-exploring-experience", active);
    },
    focus() {
      stopButtons[selected ?? 0].focus({ preventScroll: true });
    },
    update(distance: number, intendedDistance: number) {
      const { stops } = DRIVE_ROUTE;
      const index = stops.reduce(
        (closest, stop, i) =>
          Math.abs(stop - distance) < Math.abs(stops[closest] - distance)
            ? i
            : closest,
        0,
      );
      if (index !== selected) {
        if (selected !== undefined)
          stopButtons[selected].removeAttribute("aria-current");
        stopButtons[index].setAttribute("aria-current", "step");
        selected = index;
      }
      previous.setAttribute(
        "aria-disabled",
        String(intendedDistance <= stops[0] + 0.12),
      );
      next.setAttribute(
        "aria-disabled",
        String(intendedDistance >= stops[stops.length - 1] - 0.12),
      );
    },
    open,
    closeForNavigation() {
      if (!dialog.open) return;
      dialog.close();
      releaseDialog(false);
    },
    dispose() {
      events.abort();
      dialog.remove();
      navigation.remove();
    },
  };
}
