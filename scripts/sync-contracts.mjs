/**
 * sync-contracts.mjs
 *
 * Installs the latest @manganarrator/contracts package from GitHub before
 * starting the frontend dev server.
 */

import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(scriptDir, "..");

console.log("[contracts] Installing @manganarrator/contracts from GitHub...");
execFileSync(
  "npm",
  [
    "install",
    "--no-audit",
    "--no-fund",
    "github:whenigetout/manganarrator_contracts#main",
  ],
  {
    cwd: frontendRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);
console.log("[contracts] @manganarrator/contracts is up to date.");