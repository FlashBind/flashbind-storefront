import {describe, expect, it} from 'vitest';
import {renderToString} from 'react-dom/server';
import {createRoutesStub} from 'react-router';
import {DualChoicePage} from './app/components/DualChoicePage';
import {solidBackgroundColor} from './app/utils/logoImage';

/** RGBA pixels: `paint(x, y)` returns [r, g, b, a]. */
function image(width: number, height: number, paint: (x: number, y: number) => number[]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data.set(paint(x, y), (y * width + x) * 4);
  }
  return data;
}

describe('logo background detection', () => {
  const diamond = (bg: number[]) => (x: number, y: number) =>
    Math.abs(x - 20) + Math.abs(y - 20) < 15 ? [70, 120, 200, 255] : bg;

  it('finds a solid black background around the logo', () => {
    expect(solidBackgroundColor(image(40, 40, diamond([0, 0, 0, 255])), 40, 40)).toBe('#000000');
  });

  it('ignores transparent and white backgrounds', () => {
    expect(solidBackgroundColor(image(40, 40, diamond([0, 0, 0, 0])), 40, 40)).toBeNull();
    expect(solidBackgroundColor(image(40, 40, diamond([255, 255, 255, 255])), 40, 40)).toBeNull();
  });

  it('ignores busy edges (a photo, or artwork touching the border)', () => {
    const stripes = image(40, 40, (x) => (x % 4 < 2 ? [0, 0, 0, 255] : [240, 200, 20, 255]));
    expect(solidBackgroundColor(stripes, 40, 40)).toBeNull();
  });

  it('tolerates JPEG noise in a dark background', () => {
    const noisy = image(40, 40, (x, y) => ((x * 7 + y * 3) % 5 === 0 ? [14, 10, 12, 255] : [2, 2, 2, 255]));
    expect(solidBackgroundColor(noisy, 40, 40)).toMatch(/^#0[0-9a-f]0[0-9a-f]0[0-9a-f]$/);
  });
});

describe('Dual Choice page design', () => {
  function render(props: Partial<Parameters<typeof DualChoicePage>[0]> = {}, actionData?: unknown) {
    const Stub = createRoutesStub([
      {
        id: 'page',
        path: '/p/:tagId',
        Component: () => (
          <DualChoicePage
            tagId="T1"
            businessName="UAB Stasmila"
            displayName="Stasmila"
            logo="data:image/png;base64,AAAA"
            locationLabel=""
            language="lt"
            initiallyShowForm={false}
            sent={false}
            {...props}
          />
        ),
      },
    ]);
    return renderToString(
      <Stub initialEntries={['/p/T1']} hydrationData={actionData ? {actionData: {page: actionData}} : undefined} />,
    );
  }

  it('shows the display name, with the headline on its own line', () => {
    const html = render();
    expect(html).toContain('Ačiū, kad apsilankėte!');
    expect(html).toMatch(/<span class="mt-1 block font-serif italic[^"]*">Stasmila<\/span>/);
    expect(html).not.toContain('UAB Stasmila');
  });

  it('keeps the legal name in the privacy note and the contact consent', () => {
    const html = render({initiallyShowForm: true});
    expect(html).toContain('Sutinku, kad UAB Stasmila su manimi susisiektų');
    expect(html).toContain('UAB Stasmila jūsų žinutę gauna per FlashBind');
  });

  it('fills the logo tile with a solid logo background, and pads transparent logos on white', () => {
    expect(render({logoBackground: '#000000'})).toMatch(/style="background-color:#000000" class="h-28 w-28 rounded-\[2rem\]\s+flex/);
    expect(render({logoBackground: null})).toContain('h-28 w-28 rounded-[2rem] bg-white p-3');
  });

  it('keeps the logo nearly as large on the form and thank-you screens', () => {
    expect(render({initiallyShowForm: true})).toContain('h-24 w-24');
    expect(render({sent: true})).toContain('h-24 w-24');
  });

  it('shows the consent error next to the checkbox and keeps the typed text', () => {
    const values = {message: 'Labai skanu', contactName: 'Jonas', contactEmail: '', contactPhone: ''};
    const html = render({initiallyShowForm: true}, {error: 'consent_required', values});
    const consentBox = html.indexOf('id="field-consent"');
    const error = html.indexOf('pažymėkite langelį');
    const message = html.indexOf('id="field-message"');
    expect(consentBox).toBeGreaterThan(-1);
    expect(error).toBeGreaterThan(consentBox);
    expect(error).toBeGreaterThan(message);
    expect(html).toContain('outline-red-500');
    expect(html).toContain('Labai skanu</textarea>');
    expect(html).toContain('value="Jonas"');
  });

  it('shows our own FlashBind mark in the footer, served from our domain', () => {
    const html = render();
    expect(html).toContain('src="/favicon.svg"');
    expect(html).toMatch(/Veikia su.*FlashBind<\/span>/s);
    expect(html).not.toMatch(/src="https?:\/\//);
  });

  it('puts both options in one equal-height grid', () => {
    expect(render()).toContain('class="grid auto-rows-fr gap-3.5"');
  });

  it('shows a server error above the send button', () => {
    const html = render({initiallyShowForm: true}, {error: 'rate_limited'});
    expect(html.indexOf('Ką tik išsiųsta per daug')).toBeGreaterThan(html.indexOf('id="field-consent"'));
    expect(html.indexOf('Ką tik išsiųsta per daug')).toBeLessThan(html.indexOf('type="submit"'));
  });
});
