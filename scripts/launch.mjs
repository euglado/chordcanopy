import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const action = process.argv[2];
if (
  !/^24\./.test(process.versions.node) ||
  Number(process.versions.node.split(".")[1]) < 13
) {
  console.error("Install Node.js 24 LTS / Node.js 24 LTS kurun.");
  process.exit(1);
}
if (action === "setup") {
  const installer = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(installer, ["ci", "--ignore-scripts"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(1);
}
const files = {
  setup: ["scripts/setup.mjs"],
  register: ["--env-file=.env", "src/register.ts"],
  start: ["--env-file=.env", "src/main.ts"],
};
if (!Object.hasOwn(files, action ?? "")) {
  console.error("Use setup, register or start.");
  process.exit(1);
}
const result = spawnSync(process.execPath, files[action], {
  cwd: root,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
