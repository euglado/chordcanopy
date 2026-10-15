import { SlashCommandBuilder } from "discord.js";
export const command = new SlashCommandBuilder()
  .setName("chordcanopy")
  .setDescription(
    "Privately transpose chord symbols, then optionally share a preview",
  )
  .addStringOption((option) =>
    option
      .setName("chords")
      .setDescription("1–24 symbols separated by spaces, e.g. C Am F G7/B")
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(400),
  )
  .addIntegerOption((option) =>
    option
      .setName("semitones")
      .setDescription("Shift from -11 to +11 semitones")
      .setMinValue(-11)
      .setMaxValue(11)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("spelling")
      .setDescription("Choose output accidentals")
      .addChoices(
        { name: "Sharps / Diyez", value: "sharps" },
        { name: "Flats / Bemol", value: "flats" },
      ),
  )
  .addStringOption((option) =>
    option
      .setName("language")
      .setDescription("Result language / Sonuç dili")
      .addChoices(
        { name: "Türkçe", value: "tr" },
        { name: "English", value: "en" },
      ),
  );
