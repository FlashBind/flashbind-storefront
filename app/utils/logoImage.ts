/**
 * Prepares a business logo in the browser before upload (Dual Choice page).
 *
 * - Keeps transparency: a logo with transparent pixels is saved as PNG (a
 *   JPEG would turn them black); others as JPEG.
 * - Detects a solid background (e.g. a logo on a black square), so the page
 *   can fill the logo tile with that colour edge to edge instead of showing a
 *   small dark square inside white padding.
 */

export type PreparedLogo = {dataUrl: string; background: string | null};

/** Border width, in pixels, sampled to detect a solid background. */
const BORDER = 2;
/** Share of border pixels that must match the average colour. */
const SOLID_SHARE = 0.92;
/** Max RGB distance from the average colour that still counts as "the same". */
const COLOR_TOLERANCE = 48;
/** Backgrounds lighter than this already blend into the white tile. */
const LIGHT_LUMINANCE = 0.8;

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, '0');
}

function luminance(r: number, g: number, b: number) {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * The logo's solid, opaque, non-light background colour as #rrggbb, or null
 * (transparent, light or busy edges). `data` is RGBA, row by row.
 */
export function solidBackgroundColor(data: ArrayLike<number>, width: number, height: number): string | null {
  if (width < 8 || height < 8) return null;
  const pixels: Array<[number, number, number]> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const onBorder = x < BORDER || y < BORDER || x >= width - BORDER || y >= height - BORDER;
      if (!onBorder) continue;
      const i = (y * width + x) * 4;
      if (data[i + 3] < 250) return null; // transparent edge: not a solid background
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  const avg = [0, 1, 2].map((c) => pixels.reduce((sum, p) => sum + p[c], 0) / pixels.length) as [number, number, number];
  const close = pixels.filter((p) => Math.hypot(p[0] - avg[0], p[1] - avg[1], p[2] - avg[2]) <= COLOR_TOLERANCE).length;
  if (close / pixels.length < SOLID_SHARE) return null;
  if (luminance(...avg) > LIGHT_LUMINANCE) return null;
  return `#${avg.map(toHex).join('')}`;
}

function hasTransparency(data: ArrayLike<number>) {
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

/** Returns null if the file can't be decoded as an image. */
export async function prepareLogo(file: File, maxDimension = 400, quality = 0.9): Promise<PreparedLogo | null> {
  try {
    // A data: URL, not a blob: URL -- the site's CSP img-src allows data: only.
    const sourceUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = sourceUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataUrl = hasTransparency(data) ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
    return {dataUrl, background: solidBackgroundColor(data, canvas.width, canvas.height)};
  } catch {
    return null;
  }
}
