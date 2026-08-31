// src/cli.js — command router
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { t } from "./i18n.js";
import { err } from "./ui.js";
import { panel } from "./panel.js";
import { runCmd } from "./commands/run.js";
import { newCmd } from "./commands/new.js";
import { installCmd } from "./commands/install.js";
import { removeCmd } from "./commands/remove.js";
import { listCmd } from "./commands/list.js";
import { adoptCmd } from "./commands/adopt.js";
import { registerCmd } from "./commands/register.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function version() {
  const pkg = JSON.parse(
    readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  );
  console.log(pkg.version);
}

export async function main(argv) {
  const [cmd, arg] = argv;
  try {
    switch (cmd) {
      case undefined:
        await panel();
        break;
      case "run":
        await runCmd(arg);
        break;
      case "new":
        await newCmd(arg);
        break;
      case "install":
        await installCmd(arg);
        break;
      case "remove":
      case "rm":
        await removeCmd(arg);
        break;
      case "adopt":
        await adoptCmd(arg);
        break;
      case "register":
      case "reg":
        await registerCmd(arg);
        break;
      case "list":
      case "ls":
        listCmd();
        break;
      case "help":
      case "--help":
      case "-h":
        console.log(t("cli.usage"));
        break;
      case "--version":
      case "-v":
        version();
        break;
      default:
        err(t("cli.unknown", { cmd }));
        console.log(t("cli.usage"));
        process.exitCode = 1;
    }
  } catch (e) {
    // Ctrl-C in an interactive prompt: exit cleanly
    if (e?.name === "ExitPromptError") {
      console.log("");
      return;
    }
    throw e;
  }
}
