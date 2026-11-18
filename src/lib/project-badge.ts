// One badge and one demo state per project card, shared by the home page's
// Featured cards and the /projects grid (2026-11-18 UX review: every evidence
// level looked the same, and archived projects showed a grey "Prototype").
// Structural types only, so node:test can import this without the app.

type Status = "live" | "archived" | "wip";
type Evidence = "Live" | "Prototype" | "Internal System" | "Experiment";

export type BadgeVariant = "solid" | "outline" | "dashed" | "dotted" | "archived" | "muted";

export type ProjectBadge = { labelKey: string; variant: BadgeVariant };

const evidenceBadge: Record<Evidence, ProjectBadge> = {
  Live: { labelKey: "evidence_live", variant: "solid" },
  Prototype: { labelKey: "evidence_prototype", variant: "outline" },
  "Internal System": { labelKey: "evidence_internal", variant: "dashed" },
  Experiment: { labelKey: "evidence_experiment", variant: "dotted" },
};

export function projectBadge(project: { status: Status; evidenceLevel?: Evidence }): ProjectBadge {
  if (project.status === "archived") return { labelKey: "status_archived", variant: "archived" };
  if (project.evidenceLevel) return evidenceBadge[project.evidenceLevel];
  return { labelKey: `status_${project.status}`, variant: "muted" };
}

/** Class names per variant. Text is solid #161616 / #595959 (light) so it stays at or above 4.5:1 on every sticky-note tone (oklch 0.89–0.95). */
export const badgeClass: Record<BadgeVariant, string> = {
  solid: "border border-[#161616] bg-[#161616] text-white dark:border-[#ededed] dark:bg-[#ededed] dark:text-[#161616]",
  outline: "border border-[#161616] text-[#161616] dark:border-[#ededed] dark:text-[#ededed]",
  dashed: "border border-dashed border-[#161616] text-[#161616] dark:border-[#ededed] dark:text-[#ededed]",
  dotted: "border border-dotted border-[#161616] text-[#161616] dark:border-[#ededed] dark:text-[#ededed]",
  archived: "border border-[#595959] bg-[#595959] text-white dark:border-[#b4b4b4] dark:bg-[#b4b4b4] dark:text-[#161616]",
  muted: "border border-[#595959] text-[#595959] dark:border-[#b4b4b4] dark:text-[#b4b4b4]",
};

export type DemoState = "demo" | "offline" | "retired" | "none";

/** "demo": link it. "offline": a live project whose host is down. "retired": archived, no demo. "none": no public URL (internal systems). */
export function projectDemoState(project: { url: string; status: Status; demoUnavailable?: boolean }): DemoState {
  if (!project.url) return "none";
  if (!project.demoUnavailable) return "demo";
  return project.status === "archived" ? "retired" : "offline";
}
