import { PermissionFlagsBits as P, type REST, Routes } from "discord.js";
import type {
  APIGuild,
  APIGuildMember,
  APIRole,
  APITextChannel,
} from "discord-api-types/v10";
export const minimum = P.ViewChannel | P.SendMessages;
function fail(): never {
  throw new Error("access");
}
function bits(value: unknown): bigint {
  if (typeof value !== "string" || !/^\d{1,30}$/.test(value)) return fail();
  return BigInt(value);
}
function effective(
  guild: APIGuild,
  roles: APIRole[],
  member: APIGuildMember,
  channel: APITextChannel,
): bigint {
  if (
    !member.user?.id ||
    !Array.isArray(member.roles) ||
    member.roles.some((id) => !roles.some((role) => role.id === id))
  )
    return fail();
  if (member.user.id === guild.owner_id) return -1n;
  const everyone = roles.find((role) => role.id === guild.id);
  if (!everyone) return fail();
  let permissions = bits(everyone.permissions);
  for (const role of roles)
    if (member.roles.includes(role.id)) permissions |= bits(role.permissions);
  if ((permissions & P.Administrator) !== 0n) return permissions;
  const overwrites = channel.permission_overwrites;
  if (!Array.isArray(overwrites)) return fail();
  for (const overwrite of overwrites) {
    if (!overwrite.id || !(overwrite.type === 0 || overwrite.type === 1))
      return fail();
    bits(overwrite.allow);
    bits(overwrite.deny);
  }
  const base = overwrites.find(
    (overwrite) => overwrite.id === guild.id && overwrite.type === 0,
  );
  if (base) permissions = (permissions & ~bits(base.deny)) | bits(base.allow);
  let allow = 0n;
  let deny = 0n;
  for (const overwrite of overwrites)
    if (overwrite.type === 0 && member.roles.includes(overwrite.id)) {
      allow |= bits(overwrite.allow);
      deny |= bits(overwrite.deny);
    }
  permissions = (permissions & ~deny) | allow;
  const personal = overwrites.find(
    (overwrite) => overwrite.type === 1 && overwrite.id === member.user?.id,
  );
  if (personal)
    permissions = (permissions & ~bits(personal.deny)) | bits(personal.allow);
  return permissions;
}
export async function checkAccess(
  rest: Pick<REST, "get">,
  guildId: string,
  channelId: string,
  userId: string,
  botId: string,
  manager: boolean,
): Promise<void> {
  const [guild, roles, channel, user, bot] = await Promise.all([
    rest.get(Routes.guild(guildId)) as Promise<APIGuild>,
    rest.get(Routes.guildRoles(guildId)) as Promise<APIRole[]>,
    rest.get(Routes.channel(channelId)) as Promise<APITextChannel>,
    rest.get(Routes.guildMember(guildId, userId)) as Promise<APIGuildMember>,
    rest.get(Routes.guildMember(guildId, botId)) as Promise<APIGuildMember>,
  ]);
  if (
    !guild ||
    guild.id !== guildId ||
    !guild.owner_id ||
    !Array.isArray(roles) ||
    roles.some((role) => !role.id || typeof role.permissions !== "string") ||
    !channel ||
    channel.id !== channelId ||
    channel.guild_id !== guildId ||
    channel.type !== 0 ||
    channel.nsfw !== false ||
    channel.rate_limit_per_user !== 0 ||
    !user ||
    user.user?.id !== userId ||
    !bot ||
    bot.user?.id !== botId
  )
    return fail();
  for (const member of [user, bot]) {
    if (member.pending !== false) return fail();
    const timeout = member.communication_disabled_until;
    if (
      timeout != null &&
      (!Number.isFinite(Date.parse(timeout)) ||
        Date.parse(timeout) > Date.now())
    )
      return fail();
  }
  const up = effective(guild, roles, user, channel);
  const bp = effective(guild, roles, bot, channel);
  if ((bp & P.Administrator) !== 0n || (bp & minimum) !== minimum)
    return fail();
  const needed = minimum | (manager ? P.ManageGuild : 0n);
  if ((up & P.Administrator) === 0n && (up & needed) !== needed) return fail();
}
