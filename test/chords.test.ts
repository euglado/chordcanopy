import assert from "node:assert/strict";
import { test } from "node:test";
import { InputError, render, suffixes, transpose } from "../src/chords.ts";

test("transposes roots and slash basses in both directions", () => {
  assert.equal(transpose("C Am F G7/B", 2, "sharps").result, "D Bm G A7/C#");
  assert.equal(transpose("C Am F G7/B", -2, "flats").result, "Bb Gm Eb F7/A");
  assert.equal(transpose("B# Cb E# Fb", 0, "sharps").result, "C B F E");
  assert.equal(
    transpose("  C\nAm\tF G7/B  ", 0, "sharps").source,
    "C Am F G7/B",
  );
});
const sharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
test("all 12 roots, 12 basses, suffixes and signed shifts preserve pitch intervals", () => {
  for (let root = 0; root < 12; root++)
    for (let bass = 0; bass < 12; bass++)
      for (let shift = -11; shift <= 11; shift++)
        for (const suffix of suffixes)
          for (const spelling of ["sharps", "flats"] as const) {
            const result = transpose(
              `${sharp[root]}${suffix}/${flat[bass]}`,
              shift,
              spelling,
            ).result;
            const output = spelling === "sharps" ? sharp : flat;
            assert.equal(
              result,
              `${output[(root + shift + 12) % 12]}${suffix}/${output[(bass + shift + 12) % 12]}`,
            );
          }
});
test("every supported suffix is retained", () => {
  for (const suffix of suffixes)
    assert.equal(transpose(`C${suffix}`, 1, "flats").result, `Db${suffix}`);
});
for (const input of [
  "",
  " ",
  "c",
  "H",
  "C##",
  "Cbb",
  "Cmaj",
  "C-7",
  "Cm7b5",
  "C/G/B",
  "C/",
  "C|G",
  "C,G",
  "C♯",
  "C♭",
  "C @everyone",
  "C\u200b",
  "C\u202e",
  "<@123>",
  "C`",
  "C https://example.com",
  "C😀",
  "C\0",
  "C\vG",
  "C\fG",
])
  test(`rejects invalid chord input ${JSON.stringify(input)}`, () => {
    assert.throws(() => transpose(input, 1, "sharps"), InputError);
  });
test("enforces exact input limits", () => {
  assert.equal(
    transpose(Array(24).fill("C").join(" "), 11, "sharps").count,
    24,
  );
  assert.throws(
    () => transpose(Array(25).fill("C").join(" "), 1, "sharps"),
    InputError,
  );
  assert.throws(() => transpose("C".repeat(401), 1, "sharps"), InputError);
  for (const shift of [-12, 12, 0.5, NaN, Infinity])
    assert.throws(() => transpose("C", shift, "sharps"), InputError);
  assert.throws(() => transpose("C", 1, "other" as "sharps"), InputError);
});
test("renders bounded bilingual plain text without mentions", () => {
  const plan = transpose(Array(24).fill("Cmaj9/G#").join(" "), 11, "flats");
  for (const lang of ["tr", "en"] as const) {
    const output = render(plan, lang);
    assert.ok(output.length < 1500);
    assert.ok(!output.includes("@"));
    assert.ok(output.includes("+11"));
  }
});
