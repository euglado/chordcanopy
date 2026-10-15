export type Language = "tr" | "en";
export type Spelling = "sharps" | "flats";
export const suffixes = [
  "",
  "m",
  "maj7",
  "m7",
  "7",
  "6",
  "m6",
  "9",
  "m9",
  "maj9",
  "11",
  "13",
  "sus2",
  "sus4",
  "dim",
  "dim7",
  "aug",
  "add9",
  "5",
] as const;
const pitches: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const names = {
  sharps: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  flats: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
};
export class InputError extends Error {}
function note(value: string): number {
  const base = pitches[value[0] ?? ""];
  if (base === undefined || !/^[A-G][#b]?$/.test(value))
    throw new InputError("note");
  return (base + (value[1] === "#" ? 1 : value[1] === "b" ? -1 : 0) + 12) % 12;
}
export interface Plan {
  source: string;
  result: string;
  shift: number;
  spelling: Spelling;
  count: number;
}
export function transpose(
  input: string,
  shift: number,
  spelling: Spelling,
): Plan {
  if (
    typeof input !== "string" ||
    input.length > 400 ||
    !Number.isInteger(shift) ||
    shift < -11 ||
    shift > 11 ||
    !(spelling === "sharps" || spelling === "flats")
  )
    throw new InputError("bounds");
  const trimmed = input.trim();
  if (!trimmed || !/^[A-Ga-z0-9#b/ \t\r\n]+$/.test(trimmed))
    throw new InputError("characters");
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 24) throw new InputError("count");
  const transposed = tokens.map((token) => {
    const match = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(token);
    if (!match || !suffixes.some((suffix) => suffix === match[2]))
      throw new InputError("chord");
    const root = names[spelling][(note(match[1] ?? "") + shift + 12) % 12];
    const bass = match[3]
      ? `/${names[spelling][(note(match[3]) + shift + 12) % 12]}`
      : "";
    return `${root}${match[2]}${bass}`;
  });
  return {
    source: tokens.join(" "),
    result: transposed.join(" "),
    shift,
    spelling,
    count: tokens.length,
  };
}
export function render(plan: Plan, language: Language): string {
  const shift = plan.shift > 0 ? `+${plan.shift}` : `${plan.shift}`;
  return language === "tr"
    ? `ChordCanopy — akor transpozisyonu\nGirdi: ${plan.source}\nSonuç: ${plan.result}\nKaydırma: ${shift} yarım ses | Yazım: ${plan.spelling === "sharps" ? "diyez" : "bemol"}\nYalnızca akor sembolleri; tonaliteye uygun enharmonik yazım ve çalınabilirlik değerlendirilmez.`
    : `ChordCanopy — chord transposition\nInput: ${plan.source}\nResult: ${plan.result}\nShift: ${shift} semitones | Spelling: ${plan.spelling}\nChord symbols only; key-aware enharmonic spelling and playability are not evaluated.`;
}
