import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const lock = JSON.parse(
  readFileSync(resolve(root, "package-lock.json"), "utf8"),
);
const approved = new Set(["MIT", "Apache-2.0", "0BSD", "MIT OR Apache-2.0"]);
let dependencies = 0;
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (!approved.has(pkg.license))
    throw new Error(`Unreviewed license: ${name}`);
  if (!name) continue;
  if (
    !pkg.resolved?.startsWith("https://registry.npmjs.org/") ||
    !/^sha512-[A-Za-z0-9+/]+=*$/.test(pkg.integrity ?? "") ||
    pkg.hasInstallScript
  )
    throw new Error(`Dependency metadata requires review: ${name}`);
  dependencies++;
}
for (const dependencies of [
  lock.packages[""].dependencies,
  lock.packages[""].devDependencies,
])
  for (const version of Object.values(dependencies))
    if (!/^\d+\.\d+\.\d+$/.test(version))
      throw new Error("Dependencies must be exactly pinned");
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /github_pat_[A-Za-z0-9_]{40,}/,
  /[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,}/,
];
let files = 0;
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "coverage"].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (lstatSync(path).isSymbolicLink())
      throw new Error("Unexpected symbolic link");
    if (entry.isDirectory()) {
      scan(path);
      continue;
    }
    if (entry.name.startsWith(".env") && entry.name !== ".env.example")
      throw new Error(
        "Private env file must not enter checks or commits; move it outside the checkout temporarily",
      );
    const content = readFileSync(path, "utf8");
    if (patterns.some((pattern) => pattern.test(content)))
      throw new Error(
        `Potential credential in ${entry.name}; content withheld`,
      );
    files++;
  }
}
scan(root);
console.log(
  `Reviewed ${dependencies} dependency license/registry/SHA-512/no-install-script records; scanned ${files} source files for credential patterns.`,
);
