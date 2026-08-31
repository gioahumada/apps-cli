// src/commands/install.js — install an app from GitHub (user/repo) or a git URL
import { input } from "@inquirer/prompts";
import { existsSync, rmSync } from "node:fs";
import { t } from "../i18n.js";
import { appDir, ensureHome, isValidName, readManifest } from "../store.js";
import { spawnArgs, spawnShell } from "../proc.js";
import { maybeOpenAI } from "../ai.js";
import { info, ok, err } from "../ui.js";

// "user/repo" → https://github.com/user/repo.git ; git URL or local path → as-is.
export function parseSource(src) {
  const trimmed = String(src || "").trim();
  if (!trimmed) return null;
  const shorthand = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  let url = trimmed;
  let name;
  if (shorthand) {
    url = `https://github.com/${shorthand[1]}/${shorthand[2]}.git`;
    name = shorthand[2];
  } else {
    name = trimmed.replace(/\/+$/, "").split("/").pop().replace(/\.git$/, "");
  }
  if (!isValidName(name)) return null;
  return { url, name };
}

export async function installCmd(srcArg, { openAI = true } = {}) {
  ensureHome();

  const src = srcArg || (await input({ message: t("install.srcPrompt") }));
  const parsed = parseSource(src);
  if (!parsed) {
    err(t("install.srcInvalid"));
    process.exitCode = 1;
    return;
  }

  const dest = appDir(parsed.name);
  if (existsSync(dest)) {
    err(t("install.exists", { name: parsed.name }));
    process.exitCode = 1;
    return;
  }

  info(t("install.cloning", { src: parsed.url }));
  const code = await spawnArgs("git", ["clone", "--depth", "1", parsed.url, dest]);
  if (code !== 0) {
    rmSync(dest, { recursive: true, force: true });
    process.exitCode = code;
    return;
  }

  const app = readManifest(dest);
  if (!app) {
    err(t("install.noManifest"));
    rmSync(dest, { recursive: true, force: true });
    process.exitCode = 1;
    return;
  }

  if (app.setup) {
    info(t("new.setupRunning", { setup: app.setup }));
    const setupCode = await spawnShell(app.setup, dest);
    if (setupCode !== 0) {
      process.exitCode = setupCode;
      return;
    }
  }

  ok(t("install.done", { name: app.name, dir: dest }));
  if (openAI) await maybeOpenAI(app.name);
}
