import { hexToHue, hslToHex } from './color.utils';

const AVATAR_SATURATION = 65;
const AVATAR_LIGHTNESS = 35;

/**
 * Builds the avatar initials from a contact name.
 * @param name - Full contact name.
 * @returns Up to two uppercase initials.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Determines the letter a contact is grouped under.
 * @param name - Full contact name.
 * @returns Uppercase letter without diacritics, or `#` for empty names.
 */
export function getInitialLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '#';
  return removeDiacritics(trimmed[0].toUpperCase());
}

/**
 * Strips diacritics from a single letter.
 * @param letter - Single uppercase letter.
 * @returns Base letter, with `ß` mapped to `S`.
 */
function removeDiacritics(letter: string): string {
  if (letter === 'ß') return 'S';
  const base = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return base || letter;
}

/**
 * Picks an avatar color as far as possible from the ones in use.
 * @param usedColors - Hex colors already assigned to contacts.
 * @returns Hex color placed in the largest free hue gap.
 */
export function createAvatarColor(usedColors: readonly string[]): string {
  const hues = toHues(usedColors);
  const hue = findLargestGapHue(hues);
  return hslToHex(hue, AVATAR_SATURATION, AVATAR_LIGHTNESS);
}

/**
 * Collects the hues of all parsable colors.
 * @param colors - Hex colors, possibly including invalid ones.
 * @returns Hues in degrees, skipping greys and invalid values.
 */
function toHues(colors: readonly string[]): number[] {
  const hues: number[] = [];
  for (const color of colors) {
    const hue = hexToHue(color);
    if (hue !== null) hues.push(hue);
  }
  return hues;
}

/**
 * Reads the hue following the given index, wrapping past the end.
 * @param hues - Hues sorted in ascending order.
 * @param index - Position to look after.
 * @returns Next hue, offset by 360 when it wraps around.
 */
function nextHue(hues: number[], index: number): number {
  return index + 1 < hues.length ? hues[index + 1] : hues[0] + 360;
}

/**
 * Finds the hue centred in the widest gap between the used hues.
 * @param hues - Hues in degrees, in any order.
 * @returns Rounded hue in degrees, or 0 when no hues are given.
 */
function findLargestGapHue(hues: number[]): number {
  if (hues.length === 0) return 0;
  const sorted = [...hues].sort((a, b) => a - b);
  let bestHue = 0;
  let bestGap = -1;
  for (let i = 0; i < sorted.length; i++) {
    const gap = nextHue(sorted, i) - sorted[i];
    if (gap > bestGap) {
      bestGap = gap;
      bestHue = (sorted[i] + gap / 2) % 360;
    }
  }
  return Math.round(bestHue);
}
