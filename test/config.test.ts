import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { command } from "../src/command.ts";
import { config } from "../src/config.ts";

test("config rejects empty values and validates IDs without echoing values", () => {
  assert.throws(() => config({}));
  assert.throws(() => config({ DISCORD_TOKEN: "unsafe" }));
  const valid = {
    DISCORD_TOKEN: "x".repeat(50),
    DISCORD_APPLICATION_ID: "11111111111111111",
    DISCORD_GUILD_ID: "22222222222222222",
  };
  assert.equal(config(valid).guildId, valid.DISCORD_GUILD_ID);
  for (const key of Object.keys(valid))
    assert.throws(() => config({ ...valid, [key]: "bad\nvalue" }));
});
test("guild command has bounded inputs and no bulk registration fields", () => {
  const json = command.toJSON();
  assert.equal(json.name, "chordcanopy");
  assert.equal(json.options?.length, 4);
  assert.equal(json.contexts, undefined);
  assert.equal(json.integration_types, undefined);
});
for (const file of ["src/main.ts", "src/register.ts", "scripts/setup.mjs"])
  test(`unconfigured ${file} exits safely without writes or network`, () => {
    const parent = resolve(tmpdir());
    const directory = mkdtempSync(join(parent, "chordcanopy-smoke-"));
    assert.ok(
      resolve(directory).startsWith(`${parent}${sep}chordcanopy-smoke-`),
    );
    const root = fileURLToPath(new URL("../", import.meta.url));
    const env = { ...process.env };
    delete env.DISCORD_TOKEN;
    delete env.DISCORD_APPLICATION_ID;
    delete env.DISCORD_GUILD_ID;
    try {
      const result = spawnSync(process.execPath, [resolve(root, file)], {
        cwd: directory,
        env,
        encoding: "utf8",
        timeout: 5000,
      });
      assert.equal(result.status, 1);
      assert.deepEqual(readdirSync(directory), []);
      assert.ok(!result.stdout.includes("x".repeat(50)));
    } finally {
      if (resolve(directory).startsWith(`${parent}${sep}chordcanopy-smoke-`))
        rmSync(directory, { recursive: true, force: true });
    }
  });
