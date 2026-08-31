// src/commands/remove.js — remove an installed app
import { confirm } from "@inquirer/prompts";
import { existsSync, rmSync } from "node:fs";
import { t } from "../i18n.js";
import { appDir, isValidName } from "../store.js";
import { info, ok, err } from "../ui.js";

export async function removeCmd(name, { yes = false } = {}) {
  const dir = isValidName(name || "") ? appDir(name) : null;
  if (!dir || !existsSync(dir)) {
    err(t("remove.notFound", { name }));
    process.exitCode = 1;
    return;
  }

  if (!yes) {
    const confirmed = await confirm({
      message: t("remove.confirm", { name, dir }),
      default: false,
    });
    if (!confirmed) {
      info(t("common.cancelled"));
      return;
    }
  }

  // rmSync on a symlink deletes the link, not the target.
  rmSync(dir, { recursive: true, force: true });
  ok(t("remove.done", { name }));
}
