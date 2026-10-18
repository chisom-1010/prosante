import { randomInt } from "node:crypto";

// No 0/O, 1/l/I: temporary passwords get read off an email and typed by hand.
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const ALL = UPPER + LOWER + DIGITS;

const pick = (chars: string) => chars[randomInt(chars.length)];

/**
 * Cryptographically random temporary password (default 12 chars) that always
 * contains an uppercase letter, a lowercase letter and a digit.
 */
export function generateTempPassword(length = 12): string {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS)];
  while (chars.length < length) chars.push(pick(ALL));

  // Fisher–Yates shuffle so the guaranteed characters aren't always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
