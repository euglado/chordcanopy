import { Routes } from "discord.js";
import { command } from "./command.ts";
import { config } from "./config.ts";
import { makeRest } from "./rest.ts";

async function register(): Promise<void> {
  const settings = config();
  const rest = makeRest(settings.token);
  const me = (await rest.get(Routes.user("@me"))) as {
    id?: string;
    bot?: boolean;
  };
  if (me.id !== settings.applicationId || me.bot !== true)
    throw new Error("identity");
  await rest.post(
    Routes.applicationGuildCommands(settings.applicationId, settings.guildId),
    { body: command.toJSON() },
  );
  console.log(
    "/chordcanopy registered in the configured server / Seçili sunucuya kaydedildi. Other commands preserved.",
  );
}
register().catch(() => {
  console.error(
    "Registration failed / Kaydedilemedi. Check setup, invite and connection privately. Wait before retrying.",
  );
  process.exitCode = 1;
});
