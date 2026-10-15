export interface Config {
  token: string;
  applicationId: string;
  guildId: string;
}
export function config(env: NodeJS.ProcessEnv = process.env): Config {
  const token = env.DISCORD_TOKEN ?? "";
  const applicationId = env.DISCORD_APPLICATION_ID ?? "";
  const guildId = env.DISCORD_GUILD_ID ?? "";
  if (
    !/^[A-Za-z0-9_.-]{40,200}$/.test(token) ||
    !/^\d{17,20}$/.test(applicationId) ||
    !/^\d{17,20}$/.test(guildId)
  )
    throw new Error(
      "Run the setup helper / Kurulum yardımcısını çalıştırın. Check token and IDs privately.",
    );
  return { token, applicationId, guildId };
}
