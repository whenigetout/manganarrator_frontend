import { existsSync } from "node:fs";
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

console.log(`[contracts] Building @manganarrator/contracts from ${contractsRoot}`);
execFileSync("npx", ["tsc", "-p", "tsconfig.json"], {
  cwd: contractsRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

console.log("[contracts] Installing local @manganarrator/contracts package");
execFileSync("npm", ["install", "--no-audit", "--no-fund", "../manganarrator_contracts/ts/mn_contracts"], {
  cwd: frontendRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});