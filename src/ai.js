// src/ai.js — after create/install, offer to open the app with an AI agent
import { accessSync, constants } from "node:fs";
import path from "node:path";
import { t } from "./i18n.js";
import { appDir } from "./store.js";
import { spawnShell } from "./proc.js";
import { info, warn, selectEsc } from "./ui.js";

// Known AI CLIs (binary: display name)
const KNOWN_AI = [
  ["claude", "Claude Code"],
  ["codex", "Codex (OpenAI)"],
  ["gemini", "Gemini CLI"],
  ["kimi", "Kimi"],
  ["qwen", "Qwen Code"],
  ["opencode", "OpenCode"],
  ["pi", "Pi"],
  ["aider", "Aider"],
  ["amp", "Amp"],
  ["cursor-agent", "Cursor Agent"],
  ["copilot", "GitHub Copilot"],
];

export function isOnPath(bin) {
  const exts = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    for (const ext of exts) {
      try {
        accessSync(path.join(dir, bin + ext), constants.X_OK);
        return true;
      } catch {}
    }
  }
  return false;
}

// Installed CLIs; APPS_AI (if on PATH) goes first as default.
export function installedAI() {
  const found = KNOWN_AI.filter(([bin]) => isOnPath(bin));
  const forced = process.env.APPS_AI;
  if (forced && isOnPath(forced) && !found.some(([bin]) => bin === forced)) {
    found.unshift([forced, forced]);
  }
  return found;
}

// Installed-CLI picker; null = skip / none installed.
export async function pickAI(name) {
  const installed = installedAI();
  if (installed.length === 0) {
    warn(t("ai.noneFound"));
    return null;
  }
  const forced = process.env.APPS_AI;
  const picked = await selectEsc({
    loop: false,
    message: t("ai.askOpen", { name }),
    default: forced && installed.some(([bin]) => bin === forced) ? forced : installed[0][0],
    choices: [
      ...installed.map(([bin, label]) => ({ name: label, value: bin })),
      { name: t("ai.skip"), value: null },
    ],
  });
  return picked === "back" ? null : picked;
}

// Pick a CLI and open it in the app's directory.
export async function openWithAI(name) {
  const ai = await pickAI(name);
  if (!ai) return;
  info(t("ai.opening", { ai, dir: appDir(name) }));
  const code = await spawnShell(ai, appDir(name));
  if (code === 127) warn(t("ai.notFound", { ai }));
}

export async function maybeOpenAI(name) {
  // no TTY (scripts, tests): can't ask, skip
  if (!process.stdout.isTTY) return;
  await openWithAI(name);
}
