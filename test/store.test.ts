import assert from "node:assert/strict";
import { test } from "node:test";
import { transpose } from "../src/chords.ts";
import { DraftStore, Gate } from "../src/store.ts";

const binding = {
  user: "user",
  guild: "guild",
  channel: "channel",
  message: "message",
};
const draft = {
  ...binding,
  plan: transpose("C", 2, "sharps"),
  language: "en" as const,
};
test("drafts bind all four identifiers and can only be consumed once", () => {
  const store = new DraftStore(() => 0);
  const id = store.add(draft);
  for (const key of ["user", "guild", "channel", "message"] as const)
    assert.equal(store.take(id, { ...binding, [key]: "other" }), undefined);
  assert.equal(store.drafts.size, 1);
  assert.ok(store.take(id, binding));
  assert.equal(store.take(id, binding), undefined);
});
test("expiry is inclusive and expired capacity is reclaimed", () => {
  let now = 0;
  const store = new DraftStore(() => now);
  const id = store.add(draft);
  now = 299999;
  assert.equal(store.drafts.size, 1);
  now = 300000;
  assert.equal(store.take(id, binding), undefined);
  for (let n = 0; n < 100; n++) store.add(draft);
  assert.throws(() => store.add(draft));
  now += 300000;
  assert.ok(store.add(draft));
  assert.equal(store.drafts.size, 1);
});
test("gate enforces in-flight locks, cooldowns and distinct-key limits", () => {
  let now = 0;
  const gate = new Gate(5000, () => now);
  assert.ok(gate.enter("a"));
  assert.equal(gate.enter("a"), false);
  now = 5000;
  assert.equal(gate.enter("a"), false);
  gate.leave("a");
  assert.ok(gate.enter("a"));
  gate.leave("a");
  for (let n = 0; n < 99; n++) assert.ok(gate.enter(`in${n}`));
  assert.ok(gate.enter("last"));
  assert.equal(gate.enter("overflow"), false);
});
test("gate bounds idle cooldown records and pruning releases capacity", () => {
  let now = 0;
  const gate = new Gate(60_000, () => now);
  for (let n = 0; n < 1000; n++) {
    assert.ok(gate.enter(`${n}`));
    gate.leave(`${n}`);
  }
  assert.equal(gate.enter("overflow"), false);
  now = 60_000;
  assert.ok(gate.enter("new"));
  assert.equal(gate.times.size, 1);
});
