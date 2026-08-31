// src/commands/run.js — launch an app
import { getApp } from "../store.js";
import { t } from "../i18n.js";
import { spawnShell } from "../proc.js";
import { info, err } from "../ui.js";

export async function runApp(app) {
  info(t("run.starting", { name: app.name }));
  if (app.port) info(t("run.url", { port: app.port }));
  return spawnShell(app.run, app.dir);
}

export async function runCmd(name) {
  const app = getApp(name);
  if (!app) {
    err(t("run.notFound", { name }));
    process.exitCode = 1;
    return;
  }
  const code = await runApp(app);
  if (code !== 0) {
    info(t("run.exited", { name: app.name, code }));
    process.exitCode = code;
  }
}
