// src/commands/adopt.js — adopt an existing repo: move to ~/apps + symlink back
import { input } from "@inquirer/prompts";
import {
  existsSync,
  readFileSync,
  renameSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { t } from "../i18n.js";
import { APPS_HOME, appDir, ensureHome, isValidName } from "../store.js";
import { info, ok, err } from "../ui.js";

function defaultRun(src) {
  try {
    const pkg = JSON.parse(readFileSync(path.join(src, "package.json"), "utf8"));
    if (pkg.scripts?.dev) return "npm run dev";
    if (pkg.scripts?.start) return "npm start";
  } catch {}
  return "npm run dev";
}

export async function adoptCmd(pathArg) {
  ensureHome();

  let raw = pathArg;
  if (!raw) {
    raw = await input({ message: t("adopt.pathPrompt"), default: "." });
  }
  // cleanup: drag&drop quotes, spaces, and "~" → home
  raw = raw.trim().replace(/^['"]|['"]$/g, "");
  const src = path.resolve(raw.replace(/^~(?=$|\/)/, homedir()));
  if (!existsSync(src) || !statSync(src).isDirectory()) {
    err(t("adopt.notDir", { path: raw }));
    process.exitCode = 1;
    return;
  }

  const name = path.basename(src);
  if (!isValidName(name)) {
    err(t("new.nameInvalid"));
    process.exitCode = 1;
    return;
  }

  const dest = appDir(name);
  if (existsSync(dest)) {
    err(t("adopt.exists", { name, home: APPS_HOME }));
    process.exitCode = 1;
    return;
  }

  if (existsSync(path.join(src, "app.json"))) {
    info(t("adopt.hasManifest"));
  } else {
    const run = await input({ message: t("adopt.runPrompt"), default: defaultRun(src) });
    const description = await input({ message: t("adopt.descPrompt"), default: "" });
    writeFileSync(
      path.join(src, "app.json"),
      JSON.stringify({ name, description, run: run.trim() }, null, 2) + "\n"
    );
    ok(t("adopt.manifestCreated", { run: run.trim() }));
  }

  try {
    renameSync(src, dest);
    symlinkSync(dest, src, "dir");
  } catch (e) {
    err(e.message);
    process.exitCode = 1;
    return;
  }

  ok(t("adopt.moved", { dest }));
  info(t("adopt.linked", { src }));
}
