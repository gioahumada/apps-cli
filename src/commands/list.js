// src/commands/list.js — plain listing for scripting
import { listApps } from "../store.js";
import { t } from "../i18n.js";
import { pc, info, blank } from "../ui.js";

export function listCmd() {
  const apps = listApps();
  if (apps.length === 0) {
    info(t("panel.empty"));
    return;
  }
  blank();
  for (const app of apps) {
    const desc = app.description ? pc.dim(` — ${app.description}`) : "";
    console.log(`  ${pc.green("▣")} ${pc.bold(app.name)}${desc}`);
  }
  blank();
}
