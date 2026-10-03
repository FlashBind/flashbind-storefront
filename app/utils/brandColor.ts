/**
 * Brand colour of a business (business_entitlements.brand_color), used on its
 * Dual Choice pages. Stored as lowercase #rrggbb.
 */

export const DEFAULT_BRAND_COLOR = '#0f172a';
const DARK_INK = '#0f172a';
const LIGHT_INK = '#ffffff';

/** Returns a lowercase #rrggbb colour, or null when the value isn't one. */
export function normalizeBrandColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const color = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : null;
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Text colour (white or near-black) that reads best on the brand colour. */
export function inkOnBrandColor(color: string): string {
  const brand = normalizeBrandColor(color) ?? DEFAULT_BRAND_COLOR;
  return contrastRatio(brand, LIGHT_INK) >= contrastRatio(brand, DARK_INK) ? LIGHT_INK : DARK_INK;
}

/** The brand colour when it's readable as text on white, otherwise near-black. */
export function brandTextOnWhite(color: string): string {
  const brand = normalizeBrandColor(color) ?? DEFAULT_BRAND_COLOR;
  return contrastRatio(brand, LIGHT_INK) >= 4.5 ? brand : DARK_INK;
}

/** The brand colour mixed with white: amount 0 = white, 1 = the brand colour. */
export function tintBrandColor(color: string, amount: number): string {
  const brand = normalizeBrandColor(color) ?? DEFAULT_BRAND_COLOR;
  const mix = Math.min(1, Math.max(0, amount));
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(brand.slice(start, start + 2), 16);
    return Math.round(255 + (value - 255) * mix).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}
