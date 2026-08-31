// src/commands/register.js — register a command/binary already installed on the PC
import { input } from "@inquirer/prompts";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { t } from "../i18n.js";
import { appDir, ensureHome, isValidName } from "../store.js";
import { isOnPath } from "../ai.js";
import { info, ok, err, warn } from "../ui.js";

export async function registerCmd(nameArg) {
  ensureHome();

  let name = nameArg?.trim();
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

  const run = (await input({ message: t("register.runPrompt"), default: name })).trim();
  if (!run) {
    err(t("options.runEmpty"));
    process.exitCode = 1;
    return;
  }
  const description = (await input({ message: t("adopt.descPrompt"), default: "" })).trim();

  mkdirSync(dest, { recursive: true });
  writeFileSync(
    appDir(name) + "/app.json",
    JSON.stringify({ name, description, run }, null, 2) + "\n"
  );

  // soft warning: the binary may come from a shell alias we can't see
  if (!isOnPath(run.split(" ")[0])) warn(t("register.notOnPath", { cmd: run.split(" ")[0] }));
  ok(t("register.done", { name, run }));
  info(t("register.hint", { name }));
}
