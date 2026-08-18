import { hexToHue, hslToHex } from './color.utils';

const AVATAR_SATURATION = 65;
const AVATAR_LIGHTNESS = 35;

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function getInitialLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '#';
  return removeDiacritics(trimmed[0].toUpperCase());
}

function removeDiacritics(letter: string): string {
  if (letter === 'ß') return 'S';
  const base = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return base || letter;
}

export function createAvatarColor(usedColors: readonly string[]): string {
  const hues = toHues(usedColors);
  const hue = findLargestGapHue(hues);
  return hslToHex(hue, AVATAR_SATURATION, AVATAR_LIGHTNESS);
}

function toHues(colors: readonly string[]): number[] {
  const hues: number[] = [];
  for (const color of colors) {
    const hue = hexToHue(color);
    if (hue !== null) hues.push(hue);
  }
  return hues;
}

function findLargestGapHue(hues: number[]): number {
  if (hues.length === 0) return 0;
  const sorted = [...hues].sort((a, b) => a - b);
  let bestHue = 0;
  let bestGap = -1;
  for (let i = 0; i < sorted.length; i++) {
    const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 360;
    const gap = next - sorted[i];
    if (gap > bestGap) {
      bestGap = gap;
      bestHue = (sorted[i] + gap / 2) % 360;
    }
  }
  return Math.round(bestHue);
}
