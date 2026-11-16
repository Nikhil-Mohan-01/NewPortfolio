import { apps, type AppId } from "./apps";
import { projects, type Project } from "./content";

export type DashboardRoute =
  { id: "home" } | { id: AppId; project?: Project } | { id: "missing" };

export const STREET_EXPERIENCE = "#/experience/street";

export function readRoute(hash: string): DashboardRoute | undefined {
  if (!hash || hash === "#/car" || hash === STREET_EXPERIENCE) return undefined;
  if (hash === "#/home" || hash === "#/simple") return { id: "home" };
  const app = apps.find(({ id }) => hash === `#/${id}`);
  if (app) return { id: app.id };
  const project = projects.find(({ slug }) => hash === `#/projects/${slug}`);
  return project ? { id: "projects", project } : { id: "missing" };
}
