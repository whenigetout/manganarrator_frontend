/**
 * sync-contracts.mjs
 *
 * Builds the local TypeScript contracts package and copies its compiled output
 * directly into node_modules/@manganarrator/contracts (no symlink).
 *
 * Turbopack (Next.js 16+) cannot resolve packages symlinked outside the project
 * root, so we copy instead of using `npm install file:../...` which creates a symlink.
 */

import { existsSync, cpSync, rmSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(scriptDir, "..");
const workspaceRoot = resolve(frontendRoot, "..");
const contractsRoot = resolve(workspaceRoot, "manganarrator_contracts", "ts", "mn_contracts");

if (!existsSync(contractsRoot)) {
  console.log(`[contracts] Skipping sync; not found: ${contractsRoot}`);
  process.exit(0);
}

// 1. Build the TS contracts
console.log(`[contracts] Building @manganarrator/contracts from ${contractsRoot}`);
execFileSync("npx", ["tsc", "-p", "tsconfig.json"], {
  cwd: contractsRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

// 2. Copy compiled output into node_modules directly (no symlink)
const destDir = resolve(frontendRoot, "node_modules", "@manganarrator", "contracts");
console.log(`[contracts] Copying compiled contracts to ${destDir}`);

// Clear and recreate dest
if (existsSync(destDir)) {
  rmSync(destDir, { recursive: true, force: true });
}
mkdirSync(destDir, { recursive: true });

// Copy dist/
cpSync(resolve(contractsRoot, "dist"), resolve(destDir, "dist"), { recursive: true });

// Copy package.json
copyFileSync(resolve(contractsRoot, "package.json"), resolve(destDir, "package.json"));

console.log("[contracts] @manganarrator/contracts is up to date.");