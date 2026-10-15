import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  type REST,
  Routes,
} from "discord.js";
import { checkAccess } from "./access.ts";
import {
  InputError,
  type Language,
  render,
  type Spelling,
  transpose,
} from "./chords.ts";
import { DraftStore, Gate } from "./store.ts";

const noMentions = { parse: [] as never[], repliedUser: false };
const text = {
  tr: {
    invalid:
      "Girdi geçersiz. 1–24 akoru boşlukla ayırın (C Am F G7/B); kaydırma -11…+11. Desteklenen ekler için README'ye bakın.",
    unavailable:
      "İşlem yapılamadı. Sunucuda normal, yaş kısıtsız ve yavaş modsuz metin kanalı kullanın; izinleri, zaman aşımını ve kurulum ayarlarını kontrol edin. Biraz sonra yeni önizleme açın.",
    expired:
      "Bu önizleme süresi dolmuş, kullanılmış veya size ait değil. Yeni komut kullanın.",
    discarded: "Önizleme silindi; paylaşılmadı.",
    shared: "Akor planı bu kanalda paylaşıldı.",
    uncertain:
      "Paylaşım doğrulanamadı. Yeniden denemeden önce kanalı kontrol edin; gönderilmiş olabilir.",
    busy: "İstek sınırı dolu. Özel sonuçlar için 5 saniye, kanal paylaşımları için 60 saniye bekleyin.",
    preview:
      "Özel önizleme · 5 dakika geçerli. Paylaşım girdiyi ve sonucu bu kanala görünür yapar; Sunucuyu Yönet izni gerekir.",
    share: "Bu kanala paylaş",
    discard: "Vazgeç",
  },
  en: {
    invalid:
      "Invalid input. Separate 1–24 chords with spaces (C Am F G7/B); shift -11…+11. See README for supported suffixes.",
    unavailable:
      "Cannot continue. Use an ordinary, non-age-restricted text channel without slowmode; check permissions, timeouts and setup. Open a new preview later.",
    expired:
      "This preview expired, was used or belongs elsewhere. Run a new command.",
    discarded: "Preview discarded; nothing shared.",
    shared: "Chord plan shared in this channel.",
    uncertain:
      "Sharing could not be confirmed. Check the channel before retrying; the post may exist.",
    busy: "Request limit reached. Wait 5 seconds for private results or 60 seconds for channel shares.",
    preview:
      "Private preview · valid 5 minutes. Sharing makes input and result visible in this channel; Manage Server required.",
    share: "Share in this channel",
    discard: "Discard",
  },
};
export function createHandler(
  rest: Pick<REST, "get" | "post">,
  guildId: string,
  botId: string,
  now: () => number = Date.now,
) {
  const drafts = new DraftStore(now);
  const forms = new Gate(5000, now);
  const shares = new Gate(60_000, now);
  async function handle(
    i: ChatInputCommandInteraction | ButtonInteraction,
  ): Promise<void> {
    let language: Language = i.locale.startsWith("tr") ? "tr" : "en";
    let sent = false;
    try {
      if (!i.inGuild() || i.guildId !== guildId || !i.channelId) {
        await i.reply({
          content: text[language].unavailable,
          flags: MessageFlags.Ephemeral,
          allowedMentions: noMentions,
        });
        return;
      }
      if (i.isChatInputCommand()) {
        if (i.commandName !== "chordcanopy") return;
        language =
          i.options.getString("language") === "tr"
            ? "tr"
            : i.options.getString("language") === "en"
              ? "en"
              : language;
        await i.deferReply({ flags: MessageFlags.Ephemeral });
        const key = `${i.guildId}:${i.user.id}`;
        if (!forms.enter(key)) {
          await i.editReply({ content: text[language].busy });
          return;
        }
        try {
          const spelling = (i.options.getString("spelling") ??
            "sharps") as Spelling;
          const plan = transpose(
            i.options.getString("chords", true),
            i.options.getInteger("semitones", true),
            spelling,
          );
          await checkAccess(
            rest,
            guildId,
            i.channelId,
            i.user.id,
            botId,
            false,
          );
          const message = await i.editReply({
            content: `${render(plan, language)}\n\n${text[language].preview}`,
            allowedMentions: noMentions,
            components: [],
          });
          const id = drafts.add({
            user: i.user.id,
            guild: guildId,
            channel: i.channelId,
            message: message.id,
            plan,
            language,
          });
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`cc:share:${id}`)
              .setLabel(text[language].share)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`cc:discard:${id}`)
              .setLabel(text[language].discard)
              .setStyle(ButtonStyle.Secondary),
          );
          await i.editReply({ components: [row], allowedMentions: noMentions });
        } finally {
          forms.leave(key);
        }
      } else if (i.isButton()) {
        const match = /^cc:(share|discard):([a-f0-9-]{36})$/.exec(i.customId);
        if (!match) return;
        if (!i.message.flags.has(MessageFlags.Ephemeral)) {
          await i.reply({
            content: text[language].expired,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await i.deferUpdate();
        const draft = drafts.take(match[2] ?? "", {
          user: i.user.id,
          guild: guildId,
          channel: i.channelId,
          message: i.message.id,
        });
        if (!draft) {
          await i.editReply({
            content: text[language].expired,
            components: [],
            allowedMentions: noMentions,
          });
          return;
        }
        language = draft.language;
        if (match[1] === "discard") {
          await i.editReply({
            content: text[language].discarded,
            components: [],
          });
          return;
        }
        await checkAccess(rest, guildId, i.channelId, i.user.id, botId, true);
        const key = `${guildId}:${i.channelId}`;
        if (!shares.enter(key)) {
          await i.editReply({ content: text[language].busy, components: [] });
          return;
        }
        try {
          if (draft.expires <= now()) {
            await i.editReply({
              content: text[language].expired,
              components: [],
            });
            return;
          }
          sent = true;
          await rest.post(Routes.channelMessages(i.channelId), {
            body: {
              content: render(draft.plan, language),
              allowed_mentions: { parse: [], replied_user: false },
              flags: MessageFlags.SuppressEmbeds,
              nonce: i.id,
              enforce_nonce: true,
            },
          });
          await i.editReply({
            content: text[language].shared,
            components: [],
            allowedMentions: noMentions,
          });
        } finally {
          shares.leave(key);
        }
      }
    } catch (error) {
      const content =
        error instanceof InputError
          ? text[language].invalid
          : sent
            ? text[language].uncertain
            : text[language].unavailable;
      try {
        if (i.deferred || i.replied)
          await i.editReply({
            content,
            components: [],
            allowedMentions: noMentions,
          });
        else
          await i.reply({
            content,
            flags: MessageFlags.Ephemeral,
            allowedMentions: noMentions,
          });
      } catch {
        /* Expired interactions cannot be answered. Never log payloads or tokens. */
      }
    }
  }
  return {
    handle,
    drafts,
    prune: () => {
      drafts.prune();
      forms.prune();
      shares.prune();
    },
  };
}
