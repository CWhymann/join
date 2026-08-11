export function hexToHue(hex: string): number | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  const red = ((value >> 16) & 255) / 255;
  const green = ((value >> 8) & 255) / 255;
  const blue = (value & 255) / 255;
  return rgbToHue(red, green, blue);
}

function rgbToHue(red: number, green: number, blue: number): number | null {
  const max = Math.max(red, green, blue);
  const span = max - Math.min(red, green, blue);
  if (span === 0) return null;
  const hue = sectorHue(red, green, blue, max, span) * 60;
  return (hue + 360) % 360;
}

function sectorHue(red: number, green: number, blue: number, max: number, span: number): number {
  if (max === red) return ((green - blue) / span) % 6;
  if (max === green) return (blue - red) / span + 2;
  return (red - green) / span + 4;
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const amplitude = s * Math.min(l, 1 - l);
  const channel = (offset: number): number => {
    const k = (offset + hue / 30) % 12;
    return l - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return `#${toHexPart(channel(0))}${toHexPart(channel(8))}${toHexPart(channel(4))}`;
}

function toHexPart(value: number): string {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}
