// src/ui.js — ANSI colors + box helpers
import pc from "picocolors";
import { select } from "@inquirer/prompts";
import { emitKeypressEvents } from "node:readline";

export { pc };

export function banner(subtitle = "") {
  console.log("");
  console.log(pc.cyan(pc.bold("  ▄▀▄ █▀█ █▀█ █▀▀")));
  console.log(pc.cyan(pc.bold("  █▀█ █▀▀ █▀▀ ▄▄█")));
  if (subtitle) console.log(`  ${pc.dim(subtitle)}`);
  console.log("");
}

export const ok = (msg) => console.log(`  ${pc.green(pc.bold("✅"))}  ${msg}`);
export const warn = (msg) => console.log(`  ${pc.yellow("⚠️ ")}  ${msg}`);
export const err = (msg) => console.log(`  ${pc.red(pc.bold("✕"))}  ${msg}`);
export const info = (msg) => console.log(`  ${pc.dim(msg)}`);
export const blank = () => console.log("");

// select with ESC as "back": aborts the prompt and returns "back".
let escReady = false;
export async function selectEsc(config) {
  if (!escReady && process.stdin.isTTY) {
    emitKeypressEvents(process.stdin);
    escReady = true;
  }
  const ac = new AbortController();
  const onKey = (_str, key) => {
    if (key?.name === "escape") ac.abort();
  };
  process.stdin.on("keypress", onKey);
  try {
    return await select({ ...config, signal: ac.signal });
  } catch (e) {
    if (ac.signal.aborted) return "back";
    throw e;
  } finally {
    process.stdin.off("keypress", onKey);
  }
}
