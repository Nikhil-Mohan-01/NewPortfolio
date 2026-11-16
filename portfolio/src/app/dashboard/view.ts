import { apps, pixelIcon } from "./apps";
import {
  education,
  experience,
  profile,
  projects,
  skills,
  type Project,
} from "./content";
import { NIGHT_MUSIC } from "../music/config";
import type { DashboardRoute } from "./routes";
import "./style.css";

const external = (label: string, url: string, style = "os-action") =>
  `<a class="${style}" href="${url}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`;

const tags = (items: readonly string[]) =>
  `<ul class="os-tags">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

export function createDashboard(root: HTMLElement) {
  return {
    show(
      route: DashboardRoute,
      car: "return" | "explore" | "unavailable",
      notice = "",
    ) {
      const app = apps.find(({ id }) => id === route.id);
      const project = route.id === "projects" ? route.project : undefined;
      const title =
        project?.name ??
        app?.label ??
        (route.id === "missing" ? "Page not found" : profile.name);
      root.innerHTML = `
        <header class="os-header">
          <div class="os-header-inner">
            <a href="#/home" class="os-brand" aria-label="Nikhil OS home">
              <span class="os-mark" aria-hidden="true"><i></i></span><span>NIKHIL<span class="os-brand-accent"> OS</span></span>
            </a>
            <nav class="os-header-actions" aria-label="Dashboard navigation">
              <a href="#/home">Home</a>
              ${project ? '<a href="#/projects">Back to Projects</a>' : ""}
              ${car === "unavailable" ? "" : `<a class="os-drive" href="#/car" data-return-car><span aria-hidden="true">↖</span> ${car === "return" ? "Return to Car" : "Explore the Car"}</a>`}
            </nav>
          </div>
        </header>
        ${
          app
            ? `<nav class="os-tabs" aria-label="Portfolio sections">
          ${apps.map(({ id, label }) => `<a href="#/${id}" ${id === route.id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
        </nav>`
            : ""
        }
        <main class="os-content ${route.id === "home" ? "os-home" : ""}">
          ${notice ? `<p class="os-notice" role="status">${notice}</p>` : ""}
          ${renderRoute(route, title)}
        </main>
        <footer class="os-footer">
          <span>Nikhil Mohan</span>
          ${external("R34 model by Ddiaz Design", "https://sketchfab.com/3d-models/2002-nissan-skyline-r34-gt-r-bb7b67852aee412eacc9c97270886a50", "os-credit")}
          ${external("CC BY-NC-SA 4.0", "https://creativecommons.org/licenses/by-nc-sa/4.0/", "os-credit")}
        </footer>
      `;
      root
        .querySelector<HTMLButtonElement>("[data-copy-email]")
        ?.addEventListener("click", copyEmail);
      root
        .querySelector<HTMLButtonElement>("[data-print-resume]")
        ?.addEventListener("click", () => window.print());
      root.scrollTop = 0;
    },
    focus() {
      root.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    },
  };
}

function renderRoute(route: DashboardRoute, title: string) {
  if (route.id === "home")
    return `
    <section class="os-hero">
      <div class="os-hero-main">
        <span class="os-eyebrow"><i></i> Waterloo · Computer Science</span>
        <h1 tabindex="-1">Nikhil <strong>Mohan</strong></h1>
        <p>${profile.headline}</p>
        <div class="os-actions"><a class="os-action is-accent" href="#/projects">View projects <span aria-hidden="true">→</span></a><a class="os-action" href="#/contact">Get in touch <span aria-hidden="true">↗</span></a></div>
      </div>
      <aside class="os-hero-profile">
        <span class="os-profile-label">ABOUT ME</span>
        <p>${profile.intro}</p>
        <a href="#/about">More about me <span aria-hidden="true">→</span></a>
      </aside>
    </section>
    <section class="os-launcher" aria-labelledby="launcher-label">
      <h2 id="launcher-label">Dashboard</h2>
      <div class="os-apps">${apps
        .map(
          (app) => `
        <a class="os-app" href="#/${app.id}" style="--app-color:${app.color}">
          ${pixelIcon(app)}<span>${app.label}</span><b aria-hidden="true">↗</b>
        </a>`,
        )
        .join("")}
      </div>
    </section>`;

  const project = route.id === "projects" ? route.project : undefined;
  const header = `<header class="os-section-heading">
    ${project ? `<p class="os-eyebrow">${project.category}${project.date ? ` · ${project.date}` : ""}</p>` : ""}
    <h1 tabindex="-1">${title}</h1>
  </header>`;
  switch (route.id) {
    case "projects":
      return header + (project ? renderProject(project) : renderProjects());
    case "experience":
      return header + renderExperience();
    case "about":
      return (
        header +
        `<div class="os-prose"><p class="os-lead">${profile.headline}</p><p>${profile.intro}</p>
        <p>I’m interested in AI workflows, developer tools, and the craft of building interactive experiences.</p>
        <div class="os-actions"><a class="os-action is-accent" href="#/experience">See my experience <span aria-hidden="true">→</span></a><a class="os-action" href="#/contact">Contact</a></div></div>`
      );
    case "resume":
      return header + renderResume();
    case "skills":
      return (
        header +
        `<div class="os-skills">${skills.map(({ group, items }) => `<section class="os-panel"><h2>${group}</h2>${tags(items)}</section>`).join("")}</div>`
      );
    case "education":
      return header + renderEducation();
    case "contact":
      return (
        header +
        `<div class="os-prose"><p class="os-lead">${profile.contact}</p>
        <p><a data-email href="mailto:${profile.email}">${profile.email}</a></p>
        <div class="os-actions">
          <a class="os-action is-accent" href="mailto:${profile.email}">Send an email <span aria-hidden="true">↗</span></a>
          <button class="os-action" type="button" data-copy-email>Copy email</button>
          ${external("GitHub", profile.github)}${external("LinkedIn", profile.linkedin)}
        </div><p role="status" data-copy-status></p></div>`
      );
    case "music":
      return (
        header +
        `<div class="os-prose"><p class="os-lead">${NIGHT_MUSIC.creditTitle}</p><p>Playback carries between the dashboard and the car.</p>
        <div data-music-slot></div></div>`
      );
    default:
      return (
        header +
        `<p>Choose an app from <a href="#/home">dashboard home</a>.</p>`
      );
  }
}

function renderProjects() {
  const [featured, catalogue] = [projects.slice(0, 3), projects.slice(3)];
  return `
    <section aria-labelledby="featured-projects"><h2 class="os-subheading" id="featured-projects">Featured</h2>
      <div class="os-featured">${featured
        .map(
          (project, i) => `
        <a class="os-project-card" href="#/projects/${project.slug}">
          <div class="os-cover cover-${i}" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="os-card-copy"><p class="os-eyebrow">${project.category}</p><h3>${project.name} <span aria-hidden="true">↗</span></h3>
          <p>${project.summary}</p>${tags(project.stack.slice(0, 3))}</div>
        </a>`,
        )
        .join("")}</div>
    </section>
    <section aria-labelledby="other-projects" class="os-catalogue"><h2 class="os-subheading" id="other-projects">More projects</h2>
      ${catalogue
        .map(
          (
            project,
          ) => `<a class="os-project-row" href="#/projects/${project.slug}">
        <div><h3>${project.name}</h3><p>${project.summary}</p></div><p class="os-eyebrow">${project.category}</p><span aria-hidden="true">↗</span>
      </a>`,
        )
        .join("")}
    </section>`;
}

function renderProject(project: Project) {
  return `<div class="os-prose os-project-detail">
    <section><h2>Overview</h2><p class="os-lead">${project.summary}</p></section>
    <section><h2>What I built</h2><p>${project.built}</p></section>
    ${project.approach ? `<section><h2>Technical approach</h2><p>${project.approach}</p></section>` : ""}
    ${project.note ? `<p class="os-note">${project.note}</p>` : ""}
    <section><h2>Stack</h2>${tags(project.stack)}</section>
    ${project.link ? `<div class="os-actions">${external(project.link.label, project.link.url, "os-action is-accent")}</div>` : ""}
  </div>`;
}

function renderExperience() {
  return `<div class="os-timeline">${experience
    .map(
      (role, i) => `
    <article class="os-role">
      <div class="os-role-meta"><span>${role.dates}</span><span>${role.location}</span></div>
      <div class="os-panel"><h2>${role.company}</h2><p class="os-role-title">${role.title}</p>
        ${i === 0 ? '<div class="os-result"><strong>6+ hours → 1.78 seconds</strong><span>Recurring invoice reconciliation process</span></div>' : ""}
        ${role.summary ? `<p>${role.summary}</p>` : ""}
        ${role.highlights.length ? `<ul class="os-bullets">${role.highlights.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
      </div>
    </article>`,
    )
    .join("")}</div>`;
}

function renderEducation() {
  return `<div class="os-education"><section class="os-panel">
    <p class="os-eyebrow">${education.dates} · ${education.location}</p>
    <h2>${education.university}</h2><p>${education.degree} · GPA ${education.gpa}</p>
    <h3>Coursework</h3>${tags(education.courses)}
  </section><section class="os-panel"><h2>Shad 2024</h2><p>${education.shad}</p></section></div>`;
}

function renderResume() {
  const pdf = import.meta.env.BASE_URL + profile.resume;
  return `<div class="os-resume"><p class="os-lead">Software engineering experience in security automation and multiplayer systems, with projects spanning AI workflows, developer tools, and computer vision.</p>
    <div class="os-actions">
      ${external("Open PDF", pdf, "os-action is-accent")}
      <a class="os-action" href="${pdf}" download="Nikhil_Mohan_Resume.pdf">Download PDF <span aria-hidden="true">↓</span></a>
      <button class="os-action" type="button" data-print-resume>Print this page</button>
    </div>
    <div class="os-resume-summary">
      <h2>Experience</h2>${renderExperience()}
      <h2>Education</h2>${renderEducation()}
      <h2>Selected projects</h2><ul class="os-bullets">${projects
        .slice(0, 3)
        .map(
          (project) =>
            `<li><strong>${project.name}</strong> · ${project.summary}</li>`,
        )
        .join("")}</ul>
      <h2>Skills</h2>${skills.map(({ group, items }) => `<p><strong>${group}</strong> · ${items.join(", ")}</p>`).join("")}
    </div></div>`;
}

async function copyEmail(event: MouseEvent) {
  const control = event.currentTarget as HTMLButtonElement;
  const content = control.closest("main");
  const status = content?.querySelector<HTMLElement>("[data-copy-status]");
  if (!status) return;
  try {
    await navigator.clipboard.writeText(profile.email);
    status.textContent = "Email copied.";
  } catch {
    const email = content?.querySelector("[data-email]");
    const selection = window.getSelection();
    if (!email || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(email);
    selection.removeAllRanges();
    selection.addRange(range);
    if (copySelection()) {
      status.textContent = "Email copied.";
      selection.removeAllRanges();
    } else {
      status.textContent = "Email selected. Use your device’s copy command.";
    }
  }
}

function copySelection() {
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  }
}
