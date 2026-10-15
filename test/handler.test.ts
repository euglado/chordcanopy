import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { createHandler } from "../src/handler.ts";
import { botId, channelId, fixture, guildId, userId } from "./fixtures.ts";

function interaction(button?: string) {
  const replies: Record<string, unknown>[] = [];
  const i = {
    id: "88888888888888888",
    guildId,
    channelId,
    user: { id: userId },
    locale: "en-US",
    commandName: "chordcanopy",
    customId: button ?? "",
    message: { id: "99999999999999999", flags: { has: () => true } },
    deferred: false,
    replied: false,
    inGuild: () => true,
    isChatInputCommand: () => !button,
    isButton: () => Boolean(button),
    options: {
      getString: (name: string): string | null =>
        name === "chords" ? "C Am F G7/B" : null,
      getInteger: () => 2,
    },
    reply: async (value: Record<string, unknown>) => {
      i.replied = true;
      replies.push(value);
    },
    deferReply: async (value: Record<string, unknown>) => {
      i.deferred = true;
      replies.push(value);
    },
    deferUpdate: async () => {
      i.deferred = true;
    },
    editReply: async (value: Record<string, unknown>) => {
      replies.push(value);
      return { id: i.message.id };
    },
  };
  return {
    i,
    replies,
    cast: i as unknown as ChatInputCommandInteraction | ButtonInteraction,
  };
}
async function preview() {
  const f = fixture();
  const handler = createHandler(f.rest, guildId, botId);
  const command = interaction();
  await handler.handle(command.cast);
  const id = [...handler.drafts.drafts.keys()][0];
  assert.ok(id);
  return { f, handler, command, id };
}
test("preview is ephemeral, public post occurs only after explicit share", async () => {
  const { f, handler, command, id } = await preview();
  assert.equal(command.replies[0]?.flags, MessageFlags.Ephemeral);
  assert.equal(f.posts.length, 0);
  const button = interaction(`cc:share:${id}`);
  await handler.handle(button.cast);
  assert.equal(f.posts.length, 1);
  assert.equal(handler.drafts.drafts.size, 0);
  const post = f.posts[0]?.options as {
    body: {
      content: string;
      allowed_mentions: { parse: unknown[] };
      nonce: string;
      enforce_nonce: boolean;
      flags: number;
    };
  };
  assert.ok(post.body.content.includes("D Bm G A7/C#"));
  assert.deepEqual(post.body.allowed_mentions.parse, []);
  assert.equal(post.body.enforce_nonce, true);
  assert.equal(post.body.flags, MessageFlags.SuppressEmbeds);
  await handler.handle(button.cast);
  assert.equal(f.posts.length, 1);
});
test("discard never sends public content", async () => {
  const { f, handler, id } = await preview();
  await handler.handle(interaction(`cc:discard:${id}`).cast);
  assert.equal(f.posts.length, 0);
  assert.equal(handler.drafts.drafts.size, 0);
});
test("parallel shares produce a single post", async () => {
  const { f, handler, id } = await preview();
  await Promise.all([
    handler.handle(interaction(`cc:share:${id}`).cast),
    handler.handle(interaction(`cc:share:${id}`).cast),
  ]);
  assert.equal(f.posts.length, 1);
});
test("fresh permission loss blocks sharing and consumes the draft", async () => {
  const { f, handler, id } = await preview();
  f.data[`/guilds/${guildId}/members/${userId}`] = {
    user: { id: userId },
    roles: [],
    pending: false,
  };
  await handler.handle(interaction(`cc:share:${id}`).cast);
  assert.equal(f.posts.length, 0);
  assert.equal(handler.drafts.drafts.size, 0);
});
for (const field of ["user", "guildId", "channelId", "message"] as const)
  test(`preview cannot move across ${field}`, async () => {
    const { f, handler, id } = await preview();
    const button = interaction(`cc:share:${id}`);
    if (field === "user") button.i.user.id = "other";
    else if (field === "message") button.i.message.id = "other";
    else button.i[field] = "other";
    await handler.handle(button.cast);
    assert.equal(f.posts.length, 0);
    assert.equal(handler.drafts.drafts.size, 1);
  });
test("public message cannot act as a private confirmation", async () => {
  const { f, handler, id } = await preview();
  const button = interaction(`cc:share:${id}`);
  button.i.message.flags.has = () => false;
  await handler.handle(button.cast);
  assert.equal(f.posts.length, 0);
  assert.equal(handler.drafts.drafts.size, 1);
});
test("expiry during awaited access checks prevents sending", async () => {
  const f = fixture();
  let now = 0;
  const handler = createHandler(f.rest, guildId, botId, () => now);
  await handler.handle(interaction().cast);
  const id = [...handler.drafts.drafts.keys()][0];
  const get = f.rest.get.bind(f.rest);
  f.rest.get = async (route, options) => {
    now = 300000;
    return get(route, options);
  };
  await handler.handle(interaction(`cc:share:${id}`).cast);
  assert.equal(f.posts.length, 0);
  assert.equal(handler.drafts.drafts.size, 0);
});
test("uncertain network failure is not retried and consumes the draft", async () => {
  const { f, handler, id } = await preview();
  let calls = 0;
  f.rest.post = async () => {
    calls++;
    throw new Error("private network detail");
  };
  const button = interaction(`cc:share:${id}`);
  await handler.handle(button.cast);
  await handler.handle(button.cast);
  assert.equal(calls, 1);
  assert.ok(
    button.replies.some((reply) =>
      String(reply.content).includes("post may exist"),
    ),
  );
  assert.ok(!JSON.stringify(button.replies).includes("private network detail"));
});
test("private request cooldown prevents a second draft", async () => {
  const { handler } = await preview();
  const second = interaction();
  await handler.handle(second.cast);
  assert.equal(handler.drafts.drafts.size, 1);
  assert.ok(
    second.replies.some((reply) =>
      String(reply.content).includes("Request limit"),
    ),
  );
});
test("channel cooldown applies across organizers", async () => {
  const { f, handler, id } = await preview();
  await handler.handle(interaction(`cc:share:${id}`).cast);
  const other = "77777777777777777";
  f.data[`/guilds/${guildId}/members/${other}`] = {
    user: { id: other },
    roles: ["55555555555555555"],
    pending: false,
  };
  const command = interaction();
  command.i.user.id = other;
  await handler.handle(command.cast);
  const secondId = [...handler.drafts.drafts.keys()][0];
  assert.ok(secondId);
  const button = interaction(`cc:share:${secondId}`);
  button.i.user.id = other;
  await handler.handle(button.cast);
  assert.equal(f.posts.length, 1);
});
test("invalid input fails before REST requests", async () => {
  const f = fixture();
  f.rest.get = async () => {
    throw new Error("must not call");
  };
  const handler = createHandler(f.rest, guildId, botId);
  const command = interaction();
  command.i.options.getString = () => "@everyone";
  await handler.handle(command.cast);
  assert.equal(handler.drafts.drafts.size, 0);
  assert.ok(
    command.replies.some((reply) =>
      String(reply.content).includes("Invalid input"),
    ),
  );
});
