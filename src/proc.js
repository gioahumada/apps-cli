// src/proc.js — process spawning with inherited stdio and signal forwarding
import { spawn } from "node:child_process";

// Runs a command via shell (for user-defined `run`/`setup`).
export function spawnShell(cmd, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, { shell: true, stdio: "inherit", cwd });
    const onInt = () => child.kill("SIGINT");
    const onTerm = () => child.kill("SIGTERM");
    process.on("SIGINT", onInt);
    process.on("SIGTERM", onTerm);
    child.on("close", (code) => {
      process.off("SIGINT", onInt);
      process.off("SIGTERM", onTerm);
      resolve(code ?? 0);
    });
    child.on("error", () => {
      process.off("SIGINT", onInt);
      process.off("SIGTERM", onTerm);
      resolve(1);
    });
  });
}

// Runs a binary with args, no shell (for git, etc.).
export function spawnArgs(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}
