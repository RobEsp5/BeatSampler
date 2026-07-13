/**
 * Computer-keyboard layout for the 16-Pad bank, mirroring the physical MPC
 * arrangement: Pad 1 is bottom-left, so the keyboard's bottom row (ZXCV)
 * plays Pads 1-4 and the number row (1234) plays Pads 13-16.
 */

const rows = ["zxcv", "asdf", "qwer", "1234"];
const keys = rows.join("").split("");

/** The key that triggers the Pad at `padIndex`, for display on the Pad. */
export function keyForPad(padIndex: number): string {
  return keys[padIndex] ?? "";
}

/** The Pad index a pressed key triggers, or null if the key is unmapped. */
export function padForKey(key: string): number | null {
  const index = keys.indexOf(key.toLowerCase());
  return index === -1 ? null : index;
}
