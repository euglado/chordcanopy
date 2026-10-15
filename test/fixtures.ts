import { PermissionFlagsBits as P, type REST } from "discord.js";
export const guildId = "11111111111111111",
  channelId = "22222222222222222",
  userId = "33333333333333333",
  botId = "44444444444444444",
  roleId = "55555555555555555";
export function fixture() {
  const data: Record<string, unknown> = {
    [`/guilds/${guildId}`]: { id: guildId, owner_id: "66666666666666666" },
    [`/guilds/${guildId}/roles`]: [
      { id: guildId, permissions: (P.ViewChannel | P.SendMessages).toString() },
      { id: roleId, permissions: P.ManageGuild.toString() },
    ],
    [`/channels/${channelId}`]: {
      id: channelId,
      guild_id: guildId,
      type: 0,
      nsfw: false,
      rate_limit_per_user: 0,
      permission_overwrites: [],
    },
    [`/guilds/${guildId}/members/${userId}`]: {
      user: { id: userId },
      roles: [roleId],
      pending: false,
      communication_disabled_until: null,
    },
    [`/guilds/${guildId}/members/${botId}`]: {
      user: { id: botId },
      roles: [],
      pending: false,
      communication_disabled_until: null,
    },
  };
  const posts: { route: unknown; options: unknown }[] = [];
  const rest = {
    get: async (route: string) => {
      if (!(route in data)) throw new Error("unexpected route");
      return data[route];
    },
    post: async (route: unknown, options: unknown) => {
      posts.push({ route, options });
      return { id: "77777777777777777" };
    },
  } as unknown as Pick<REST, "get" | "post">;
  return { data, posts, rest };
}
