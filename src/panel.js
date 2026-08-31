// src/panel.js — main TUI: app list + actions
import { input, Separator } from "@inquirer/prompts";
import { existsSync } from "node:fs";
import { t } from "./i18n.js";
import { appDir, getApp, isValidName, listApps, readManifest, renameApp, updateManifest } from "./store.js";
import { banner, pc, info, ok, err, warn, blank, selectEsc } from "./ui.js";
import { spawnShell } from "./proc.js";
import { runApp } from "./commands/run.js";
import { newCmd } from "./commands/new.js";
import { installCmd } from "./commands/install.js";
import { openWithAI } from "./ai.js";
import { removeCmd } from "./commands/remove.js";
import { adoptCmd } from "./commands/adopt.js";
import { registerCmd } from "./commands/register.js";

function showInfo(app) {
  blank();
  const row = (label, value) =>
    value && console.log(`  ${pc.dim(label + ":")}  ${value}`);
  row(t("info.name"), pc.bold(app.name));
  row(t("info.description"), app.description);
  row(t("info.version"), app.version);
  row(t("info.author"), app.author);
  row(t("info.run"), app.run);
  row(t("info.setup"), app.setup);
  row(t("info.port"), app.port);
  row(t("info.dir"), app.dir);
  blank();
}

// Edits a manifest field and returns the updated app (null if invalid).
async function editField(app, field, msgKey) {
  const raw = (await input({
    message: t(msgKey),
    default: String(app[field] ?? ""),
  })).trim();
  if (field === "run" && !raw) {
    err(t("options.runEmpty"));
    return null;
  }
  let value = raw || null;
  if (field === "port" && value !== null) {
    value = Number.parseInt(raw, 10);
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      err(t("options.portInvalid"));
      return null;
    }
  }
  updateManifest(app.dir, { [field]: value });
  ok(t("options.saved"));
  return readManifest(app.dir);
}

async function optionsMenu(app) {
  const action = await selectEsc({
    loop: false,
    message: t("options.title", { name: app.name }),
    choices: [
      { name: t("options.rename"), value: "rename" },
      { name: t("options.desc"), value: "desc" },
      { name: t("options.run"), value: "run" },
      { name: t("options.setup"), value: "setup" },
      { name: t("options.port"), value: "port" },
      new Separator(),
      { name: t("options.terminal"), value: "terminal" },
      { name: t("options.ai"), value: "ai" },
      { name: t("options.remove"), value: "remove" },
      { name: t("options.back"), value: "back" },
    ],
  });

  if (action === "back") return;
  if (action === "remove") {
    await removeCmd(app.name);
    return;
  }
  if (action === "terminal") {
    info(t("options.terminalHint", { dir: app.dir }));
    await spawnShell(process.env.SHELL || "/bin/sh", app.dir);
    return;
  }
  if (action === "ai") {
    await openWithAI(app.name);
    return;
  }
  if (action === "rename") {
    const name = (await input({
      message: t("options.renamePrompt"),
      default: app.name,
      validate: (v) => isValidName(v.trim()) || t("new.nameInvalid"),
    })).trim();
    if (name === app.name) return;
    if (existsSync(appDir(name))) {
      err(t("options.exists", { name }));
      return;
    }
    renameApp(app, name);
    ok(t("options.renamed", { name }));
    return;
  }
  const field = { desc: "description", run: "run", setup: "setup", port: "port" }[action];
  await editField(app, field, `options.${action}Prompt`);
}

async function newMenu() {
  const src = await selectEsc({
    loop: false,
    message: t("panel.newTitle"),
    choices: [
      { name: t("panel.src.template"), value: "template" },
      { name: t("panel.install"), value: "github" },
      { name: t("panel.adopt"), value: "adopt" },
      { name: t("panel.register"), value: "register" },
      new Separator(),
      { name: t("action.back"), value: "back" },
    ],
  });
  if (src === "template") await newCmd();
  else if (src === "github") await installCmd();
  else if (src === "adopt") await adoptCmd();
  else if (src === "register") await registerCmd();
}

export async function panel() {
  for (;;) {
    if (process.stdout.isTTY) console.clear();
    banner(t("app.tagline"));

    const apps = listApps();
    if (apps.length === 0) warn(t("panel.empty"));

    const choice = await selectEsc({
      loop: false,
      message: t("panel.placeholder"),
      pageSize: 15,
      choices: [
        ...apps.map((a) => ({
          name: `▣ ${pc.bold(a.name)}${a.description ? pc.dim(` — ${a.description}`) : ""}`,
          value: `app:${a.name}`,
        })),
        new Separator(),
        { name: t("panel.new"), value: "cmd:new" },
        { name: t("panel.exit"), value: "cmd:exit" },
      ],
    });

    if (choice === "cmd:exit" || choice === "back") return;
    if (choice === "cmd:new") {
      await newMenu();
      blank();
      continue;
    }

    const app = getApp(choice.slice(4));
    if (!app) continue;

    const action = await selectEsc({
      loop: false,
      message: t("panel.appAction", { name: app.name }),
      choices: [
        { name: t("action.launch"), value: "launch" },
        { name: t("action.info"), value: "info" },
        { name: t("action.options"), value: "options" },
        { name: t("action.back"), value: "back" },
      ],
    });

    if (action === "launch") {
      await runApp(app);
      blank();
    } else if (action === "info") {
      showInfo(app);
    } else if (action === "options") {
      await optionsMenu(app);
      blank();
    }
  }
}
