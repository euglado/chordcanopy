import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { config } from "./config.ts";
import { createHandler } from "./handler.ts";
import { makeRest } from "./rest.ts";

async function main(): Promise<void> {
  const settings = config();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [], repliedUser: false },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 0,
      GuildMemberManager: 0,
    }),
    rest: { retries: 0, rejectOnRateLimit: () => true, timeout: 10_000 },
  });
  const handler = createHandler(
    makeRest(settings.token),
    settings.guildId,
    settings.applicationId,
  );
  const prune = setInterval(handler.prune, 30_000);
  prune.unref();
  client.once(Events.ClientReady, (ready) => {
    if (ready.user.id !== settings.applicationId) {
      console.error(
        "Application ID does not match bot / Uygulama kimliği botla eşleşmiyor.",
      );
      client.destroy();
      process.exitCode = 1;
      return;
    }
    console.log("ChordCanopy ready / hazır. Keep this process running.");
  });
  client.on(Events.InteractionCreate, (interaction) => {
    if (interaction.isChatInputCommand() || interaction.isButton())
      void handler.handle(interaction);
  });
  client.on(Events.Error, () =>
    console.error(
      "Discord connection error / bağlantı hatası. Check connectivity and setup privately.",
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(prune);
      handler.drafts.drafts.clear();
      client.destroy();
    });
  await client.login(settings.token);
}
main().catch(() => {
  console.error(
    "Startup failed / Başlatılamadı. Run setup and check network/token privately.",
  );
  process.exitCode = 1;
});
