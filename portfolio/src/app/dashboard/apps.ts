export const apps = [
  {
    id: "projects",
    label: "Projects",
    color: ["#2fc4ff", "#1268d5"],
    glyph:
      '<path d="M3 8V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8h18"/>',
  },
  {
    id: "experience",
    label: "Experience",
    color: ["#ffb547", "#b75912"],
    glyph:
      '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12l7 2m4 0 7-2m-11 1h4v3h-4z"/>',
  },
  {
    id: "about",
    label: "About",
    color: ["#a597ff", "#5a49ce"],
    glyph:
      '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20v-2a5.5 5.5 0 0 1 5.5-5.5h4a5.5 5.5 0 0 1 5.5 5.5v2z"/>',
  },
  {
    id: "resume",
    label: "Resume",
    color: ["#637f9e", "#32496e"],
    glyph:
      '<path d="M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8 0v5h5M8.5 12h7m-7 4h7"/>',
  },
  {
    id: "skills",
    label: "Skills",
    color: ["#39cfa7", "#087d67"],
    glyph: '<path d="m7.5 7-5 5 5 5m9-10 5 5-5 5M14.5 5l-5 14"/>',
  },
  {
    id: "education",
    label: "Education",
    color: ["#6896ff", "#2944ba"],
    glyph:
      '<path d="M2.5 9.5 12 4l9.5 5.5L12 15zm3.5 2V17c3 2.8 9 2.8 12 0v-5.5m3.5-2v7"/>',
  },
  {
    id: "contact",
    label: "Contact",
    color: ["#ff897a", "#bd3e4a"],
    glyph:
      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  },
  {
    id: "music",
    label: "Music",
    color: ["#fa7abe", "#a62a7c"],
    glyph:
      '<path d="M9 17V6l11-3v12m-11-5 11-3"/><ellipse cx="6" cy="17.5" rx="3" ry="2.5"/><ellipse cx="17" cy="15.5" rx="3" ry="2.5"/>',
  },
] as const;

export type AppId = (typeof apps)[number]["id"];
export type App = (typeof apps)[number];

export function iconDrawing(glyph: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${glyph}</svg>`;
}

export const homeGlyph = iconDrawing(
  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
);

export const dockApps = [apps[1], apps[7]];

export function appIcon(app: App) {
  return `<span class="app-icon" style="--app-light:${app.color[0]};--app-dark:${app.color[1]}">${iconDrawing(app.glyph)}</span>`;
}
