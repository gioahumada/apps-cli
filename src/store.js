// src/store.js — APPS_HOME, scan and validation of app.json
// The directory IS the registry: ~/apps/<name>/app.json = one app.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export const APPS_HOME = process.env.APPS_HOME || path.join(homedir(), "apps");

export const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i;

export function ensureHome() {
  mkdirSync(APPS_HOME, { recursive: true });
}

export function appDir(name) {
  return path.join(APPS_HOME, name);
}

export function isValidName(name) {
  return NAME_RE.test(name) && !name.includes("..");
}

// Reads and validates a directory's manifest. Returns null if not an app.
export function readManifest(dir) {
  const file = path.join(dir, "app.json");
  if (!existsSync(file)) return null;
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
  if (!data || typeof data.run !== "string" || !data.run.trim()) return null;
  const name = typeof data.name === "string" && data.name ? data.name : path.basename(dir);
  if (!isValidName(name)) return null;
  return {
    name,
    description: typeof data.description === "string" ? data.description : "",
    version: typeof data.version === "string" ? data.version : "",
    author: typeof data.author === "string" ? data.author : "",
    run: data.run,
    setup: typeof data.setup === "string" && data.setup ? data.setup : null,
    port: Number.isInteger(data.port) ? data.port : null,
    dir,
  };
}

// Lists all installed apps (directories with a valid app.json).
export function listApps() {
  ensureHome();
  const apps = [];
  for (const entry of readdirSync(APPS_HOME, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    if (entry.name.startsWith(".")) continue;
    const app = readManifest(path.join(APPS_HOME, entry.name));
    if (app) apps.push(app);
  }
  return apps.sort((a, b) => a.name.localeCompare(b.name));
}

export function getApp(name) {
  if (!isValidName(name)) return null;
  return readManifest(appDir(name));
}

// Merges fields into the existing app.json (preserves unknown keys).
export function updateManifest(dir, patch) {
  const file = path.join(dir, "app.json");
  const data = JSON.parse(readFileSync(file, "utf8"));
  Object.assign(data, patch);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

// Renames the directory and the manifest's name.
// ponytail: if the app was adopted, the original symlink breaks; recreate it by hand.
export function renameApp(app, newName) {
  const dest = appDir(newName);
  renameSync(app.dir, dest);
  updateManifest(dest, { name: newName });
  return readManifest(dest);
}
