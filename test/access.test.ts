import assert from "node:assert/strict";
import { test } from "node:test";
import { PermissionFlagsBits as P } from "discord.js";
import { checkAccess } from "../src/access.ts";
import {
  botId,
  channelId,
  fixture,
  guildId,
  roleId,
  userId,
} from "./fixtures.ts";

test("normal members calculate privately; manager permission is needed to share", async () => {
  const f = fixture();
  await checkAccess(f.rest, guildId, channelId, userId, botId, true);
  f.data[`/guilds/${guildId}/members/${userId}`] = {
    user: { id: userId },
    roles: [],
    pending: false,
  };
  await checkAccess(f.rest, guildId, channelId, userId, botId, false);
  await assert.rejects(
    checkAccess(f.rest, guildId, channelId, userId, botId, true),
  );
});
for (const change of [
  { type: 11 },
  { type: 5 },
  { type: 15 },
  { nsfw: true },
  { rate_limit_per_user: 1 },
  { guild_id: "other" },
  { permission_overwrites: undefined },
  {
    permission_overwrites: [
      { id: guildId, type: 0, deny: P.SendMessages.toString(), allow: "0" },
    ],
  },
  {
    permission_overwrites: [
      { id: userId, type: 1, deny: P.ViewChannel.toString(), allow: "0" },
    ],
  },
  {
    permission_overwrites: [
      { id: botId, type: 1, deny: P.SendMessages.toString(), allow: "0" },
    ],
  },
  {
    permission_overwrites: [
      { id: roleId, type: 0, deny: P.SendMessages.toString(), allow: "0" },
    ],
  },
  {
    permission_overwrites: [{ id: guildId, type: 0, deny: "bad", allow: "0" }],
  },
] as const)
  test(`denies unsafe channel ${JSON.stringify(change)}`, async () => {
    const f = fixture();
    f.data[`/channels/${channelId}`] = {
      ...(f.data[`/channels/${channelId}`] as object),
      ...change,
    };
    await assert.rejects(
      checkAccess(f.rest, guildId, channelId, userId, botId, true),
    );
  });
test("member overwrite takes precedence over a role allow", async () => {
  const f = fixture();
  f.data[`/channels/${channelId}`] = {
    ...(f.data[`/channels/${channelId}`] as object),
    permission_overwrites: [
      { id: roleId, type: 0, allow: P.SendMessages.toString(), deny: "0" },
      { id: userId, type: 1, allow: "0", deny: P.SendMessages.toString() },
    ],
  };
  await assert.rejects(
    checkAccess(f.rest, guildId, channelId, userId, botId, true),
  );
});
for (const who of [userId, botId])
  for (const change of [
    { pending: true },
    { roles: ["unknown"] },
    { communication_disabled_until: "2099-01-01T00:00:00Z" },
    { communication_disabled_until: "invalid" },
    { user: { id: "other" } },
  ])
    test(`denies unsafe member ${who} ${JSON.stringify(change)}`, async () => {
      const f = fixture();
      const key = `/guilds/${guildId}/members/${who}`;
      f.data[key] = { ...(f.data[key] as object), ...change };
      await assert.rejects(
        checkAccess(f.rest, guildId, channelId, userId, botId, true),
      );
    });
test("bot Administrator is rejected even though it bypasses overwrites", async () => {
  const f = fixture();
  f.data[`/guilds/${guildId}/roles`] = [
    { id: guildId, permissions: (P.ViewChannel | P.SendMessages).toString() },
    { id: roleId, permissions: P.Administrator.toString() },
  ];
  f.data[`/guilds/${guildId}/members/${botId}`] = {
    user: { id: botId },
    roles: [roleId],
    pending: false,
  };
  await assert.rejects(
    checkAccess(f.rest, guildId, channelId, userId, botId, true),
  );
});
test("missing everyone role and malformed permissions fail closed", async () => {
  const f = fixture();
  f.data[`/guilds/${guildId}/roles`] = [];
  await assert.rejects(
    checkAccess(f.rest, guildId, channelId, userId, botId, true),
  );
  f.data[`/guilds/${guildId}/roles`] = [{ id: guildId, permissions: "NaN" }];
  await assert.rejects(
    checkAccess(f.rest, guildId, channelId, userId, botId, true),
  );
});
