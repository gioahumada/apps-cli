// src/commands/new.js — scaffold an app from templates
import { input, confirm } from "@inquirer/prompts";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { t } from "../i18n.js";
import { appDir, ensureHome, isValidName, readManifest } from "../store.js";
import { spawnShell } from "../proc.js";
import { maybeOpenAI } from "../ai.js";
import { info, ok, err, selectEsc } from "../ui.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "..", "..", "templates");
export const TEMPLATES = ["script", "node", "web"];

// Extensions where {{name}} placeholders are replaced; everything else is copied raw.
const TEXT_EXT = /\.(json|js|mjs|ts|md|html|css|sh|zsh|bash|txt|gitignore)$/i;

function copyTemplate(srcDir, dest, vars) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyTemplate(srcPath, destPath, vars);
      continue;
    }
    if (TEXT_EXT.test(entry)) {
      let content = readFileSync(srcPath, "utf8");
      for (const [k, v] of Object.entries(vars)) {
        content = content.replaceAll(`{{${k}}}`, v);
      }
      writeFileSync(destPath, content);
      if (/\.(sh|zsh|bash)$/i.test(entry)) chmodSync(destPath, 0o755);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// AGENTS.md: instructions for AI agents (claude, codex, pi, opencode...)
function agentsMd(app) {
  return `# ${app.name}

App managed by apps-cli. You are working inside the app's own folder.

## Commands
- Run: \`${app.run}\`${app.setup ? `\n- Setup: \`${app.setup}\`` : ""}${app.port ? `\n- Dev URL: http://localhost:${app.port}` : ""}

## Rules
- Prefer the Node.js standard library over new dependencies.
- No speculative abstractions; keep diffs minimal.
- Comments and commit messages in English.
`;
}

export async function newCmd(nameArg, { openAI = true } = {}) {
  ensureHome();

  let name = nameArg;
  if (name && !isValidName(name)) {
    err(t("new.nameInvalid"));
    process.exitCode = 1;
    return;
  }
  while (!name) {
    name = await input({
      message: t("new.namePrompt"),
      validate: (v) => isValidName(v.trim()) || t("new.nameInvalid"),
    });
    name = name.trim();
  }

  const dest = appDir(name);
  if (existsSync(dest)) {
    err(t("new.exists", { name }));
    process.exitCode = 1;
    return;
  }

  const template = await selectEsc({
    loop: false,
    message: t("new.templatePrompt"),
    choices: TEMPLATES.map((tp) => ({ name: t(`new.template.${tp}`), value: tp })),
  });
  if (template === "back") {
    info(t("common.cancelled"));
    return;
  }

  const withAgents = await confirm({ message: t("new.agentsPrompt"), default: true });

  info(t("new.creating", { name, template }));
  copyTemplate(path.join(TEMPLATES_DIR, template), dest, { name });

  const app = readManifest(dest);
  if (withAgents && app) {
    writeFileSync(path.join(dest, "AGENTS.md"), agentsMd(app));
  }

  if (app?.setup) {
    info(t("new.setupRunning", { setup: app.setup }));
    const code = await spawnShell(app.setup, dest);
    if (code !== 0) {
      process.exitCode = code;
      return;
    }
  }

  ok(t("new.done", { name, dir: dest }));
  if (openAI) await maybeOpenAI(name);
}
