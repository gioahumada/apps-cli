// src/i18n.js — locale loading and t(key, params)
// Detection: APPS_LANG > LC_ALL/LC_MESSAGES/LANG. "es" prefix → Spanish, else English.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function detectLang() {
  const forced = process.env.APPS_LANG;
  if (forced) return forced.toLowerCase().startsWith("es") ? "es" : "en";
  const locale =
    process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || "";
  return locale.toLowerCase().startsWith("es") ? "es" : "en";
}

function load(lang) {
  return JSON.parse(
    readFileSync(path.join(__dirname, "locales", `${lang}.json`), "utf8")
  );
}

export const lang = detectLang();
// English as base: if a key is missing in the active locale, falls back to English
const messages = { ...load("en"), ...(lang === "es" ? load("es") : {}) };

export function t(key, params = {}) {
  let msg = messages[key];
  if (msg === undefined) return key;
  for (const [k, v] of Object.entries(params)) {
    msg = msg.replaceAll(`{${k}}`, String(v));
  }
  return msg;
}
