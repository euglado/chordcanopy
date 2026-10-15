import { existsSync, writeFileSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

function secret() {
  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write("Bot token (hidden / gizli): ");
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    const finish = (error) => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
      value = "";
    };
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          finish(new Error("Cancelled / İptal edildi."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b")
          value = value.slice(0, -1);
        else if (/^[A-Za-z0-9_.-]$/.test(character) && value.length < 201)
          value += character;
      }
    };
    stdin.on("data", onData);
  });
}
async function setup() {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== "function")
    throw new Error("Open a real terminal / Gerçek bir terminal açın.");
  if (existsSync(".env"))
    throw new Error(
      ".env exists; preserved / mevcut dosya korundu. See README for token rotation.",
    );
  const rl = createInterface({ input: stdin, output: stdout });
  let applicationId;
  let guildId;
  try {
    applicationId = (
      await rl.question("Application ID / Uygulama kimliği: ")
    ).trim();
    guildId = (await rl.question("Server ID / Sunucu kimliği: ")).trim();
  } finally {
    rl.close();
  }
  if (!/^\d{17,20}$/.test(applicationId) || !/^\d{17,20}$/.test(guildId))
    throw new Error("Invalid ID / Geçersiz kimlik.");
  const token = await secret();
  if (typeof token !== "string" || !/^[A-Za-z0-9_.-]{40,200}$/.test(token))
    throw new Error("Invalid token format / Geçersiz token biçimi.");
  writeFileSync(
    ".env",
    `DISCORD_TOKEN=${token}\nDISCORD_APPLICATION_ID=${applicationId}\nDISCORD_GUILD_ID=${guildId}\n`,
    { flag: "wx", mode: 0o600 },
  );
  stdout.write(
    `Saved .env privately. Invite with this link / Davet bağlantısı:\nhttps://discord.com/oauth2/authorize?client_id=${applicationId}&scope=bot%20applications.commands&permissions=3072&guild_id=${guildId}&disable_guild_select=true\nThen run register and start / Ardından register ve start çalıştırın.\n`,
  );
}
setup().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Setup failed / Kurulum başarısız.",
  );
  process.exitCode = 1;
});
