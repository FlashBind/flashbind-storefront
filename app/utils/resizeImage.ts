/**
 * Shrinks a user-picked photo in the browser before upload.
 *
 * Phone photos are usually 3-6 MB, which is over the server's 2 MB limit for
 * pet photos. Re-encoding to a JPEG of at most `maxDimension` pixels on the
 * longest side keeps them well under it. Returns null if the file can't be
 * decoded as an image.
 */
export async function resizeImageToDataUrl(
  file: File,
  maxDimension = 1200,
  quality = 0.85,
): Promise<string | null> {
  try {
    // Read as a data: URL rather than a blob: URL -- the site's CSP img-src
    // allows data: images but not blob: ones.
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

    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return null;
  }
}
