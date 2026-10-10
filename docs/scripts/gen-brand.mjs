// Brand generator for agentspecs.io (phase 7). Run from docs/:
//   node scripts/gen-brand.mjs   (run from docs/)
// Writes public/favicon.svg, public/og.png and
// a 16 px preview PNG in the OS temp folder (path printed). Uses only installed packages: sharp (rasterizing)
// and fontkitten (Astro's font parser) to turn Inter Variable glyphs into SVG paths, so the
// wordmark renders the same everywhere (an <img> SVG cannot use the page's web fonts).
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..'); // docs/
const PREVIEW = join(tmpdir(), 'agentspecs-favicon-16.png'); // visual check only; not committed
const req = createRequire(join(ROOT, 'package.json'));
const sharp = req('sharp');
const { create } = await import(req.resolve('fontkitten'));

const OG_INK = '#f1f1f1'; // mark and wordmark on the dark social image
const PAGE = { light: '#ffffff', dark: '#0d0d0f' };

// ---------- type: Inter Variable glyph outlines at a chosen weight ----------

const INTER = readFileSync(join(ROOT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'));

// fontkitten's getVariation() returns a plain TTF reader that cannot decode WOFF2 glyphs, so
// build the instance by hand: same WOFF2 class with variation coords, then apply gvar deltas.
function interAt(wght) {
  const base = create(INTER);
  const Stream = base.stream.constructor;
  const Font = base.constructor;
  const font = new Font(new Stream(new Uint8Array(INTER)), [wght]);
  Object.defineProperty(font, '_variationProcessor', { value: null, configurable: true, writable: true });
  font._transformGlyfTable();
  delete font._variationProcessor;
  const done = new Set();
  return (ch) => {
    const gid = base.glyphForCodePoint(ch.codePointAt(0)).id;
    if (!done.has(gid)) {
      const g = font._transformedGlyphs[gid];
      if (g.points) {
        const Point = g.points[0].constructor;
        const phantom = [0, 1, 2, 3].map(() => new Point(false, true, 0, 0));
        font._variationProcessor.transformPoints(gid, [...g.points, ...phantom]);
      }
      done.add(gid);
    }
    return font.getGlyph(gid);
  };
}

const round = (d) => d.replace(/-?\d*\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100));

/** Lay out one line of text as an SVG path. Returns { d, width }. No kerning (fontkitten has no GPOS). */
function textPath(str, { wght = 400, size, x = 0, y, tracking = 0 }) {
  const glyph = interAt(wght);
  const s = size / 2048;
  let d = '';
  let pen = x;
  [...str].forEach((ch, i) => {
    const g = glyph(ch);
    if (ch !== ' ') d += g.path.scale(s, -s).translate(pen, y).toSVG();
    pen += g.advanceWidth * s + (i < str.length - 1 ? tracking * size : 0);
  });
  return { d: round(d), width: pen - x };
}

// ---------- mark: a solid pentagon, point up (agentskills.io's mark is a solid hexagon) ----------
// 32-unit grid. A regular pentagon centred in the box; a round-joined stroke in the fill colour
// softens the corners.

const R = 15.2; // circumradius
const CY = 16 + (R - R * Math.cos(Math.PI / 5)) / 2; // centres the height (R + R·cos 36°) in the box
const PENTAGON =
  'M' +
  [0, 1, 2, 3, 4]
    .map((k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      return `${(16 + R * Math.cos(a)).toFixed(2)} ${(CY + R * Math.sin(a)).toFixed(2)}`;
    })
    .join('L') +
  'Z';

/** The mark in one colour. */
const markPath = (color) =>
  `<path fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round" d="${PENTAGON}"/>`;

// ---------- favicon: mark only, black in both colour schemes (as agentskills.io's) ----------

const FAVICON_INK = '#000000';
const FAVICON =
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
  `${markPath(FAVICON_INK)}</svg>\n`;

// ---------- social image: 1200x630 ----------

function og() {
  const W = 1200;
  const H = 630;
  const bg = PAGE.dark;
  const ink = OG_INK;
  const left = 96;
  const markSize = 104;
  const markTop = 112;
  const baseline = markTop + (30 / 32) * markSize;
  const word = textPath('agentspecs', { wght: 600, size: 92, x: left + markSize + 30, y: baseline, tracking: -0.015 });
  const pitch1 = textPath('Task specs that coding agents', { wght: 500, size: 56, x: left, y: 360, tracking: -0.01 });
  const pitch2 = textPath('can follow phase by phase.', { wght: 500, size: 56, x: left, y: 432, tracking: -0.01 });
  const url = textPath('agentspecs.io', { wght: 500, size: 30, x: left, y: 540 });
  const status = textPath('Specification v0.1 (draft)', { wght: 400, size: 30, x: 0, y: 540 });
  const statusX = W - left - status.width;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${bg}"/>` +
    `<g transform="translate(${left} ${markTop}) scale(${markSize / 32})">${markPath(ink)}</g>` +
    `<path fill="${ink}" d="${word.d}"/>` +
    `<path fill="#e2e2e2" d="${pitch1.d}${pitch2.d}"/>` +
    `<rect x="${left}" y="490" width="${W - 2 * left}" height="2" fill="#2e2e30"/>` +
    `<path fill="#a8a8a8" d="${url.d}"/>` +
    `<g transform="translate(${statusX} 0)"><path fill="#a8a8a8" d="${status.d}"/></g>` +
    `</svg>`
  );
}

// ---------- preview: favicon at 16 px (and 32 px) on light and dark, plus 8x enlargements ----------

async function preview() {
  const tile = async (px) =>
    sharp(Buffer.from(FAVICON.replace('width="32" height="32"', `width="${px}" height="${px}"`))).png().toBuffer();
  const comps = [];
  for (const [i, theme] of ['light', 'dark'].entries()) {
    const x0 = i * 330;
    comps.push({ input: { create: { width: 320, height: 200, channels: 4, background: PAGE[theme] } }, left: x0, top: 0 });
    const p16 = await tile(16);
    comps.push({ input: p16, left: x0 + 16, top: 24 });
    comps.push({ input: await tile(32), left: x0 + 16, top: 56 });
    comps.push({ input: await sharp(p16).resize(128, 128, { kernel: 'nearest' }).png().toBuffer(), left: x0 + 72, top: 24 });
    const tab = { light: '#dee1e6', dark: '#35363a' }[theme]; // browser tab strip
    comps.push({ input: { create: { width: 100, height: 28, channels: 4, background: tab } }, left: x0 + 210, top: 24 });
    comps.push({ input: p16, left: x0 + 216, top: 30 });
  }
  await sharp({ create: { width: 650, height: 200, channels: 4, background: '#808080' } })
    .composite(comps)
    .png()
    .toFile(PREVIEW);
}

writeFileSync(join(ROOT, 'public/favicon.svg'), FAVICON);
await sharp(Buffer.from(og())).png({ compressionLevel: 9 }).toFile(join(ROOT, 'public/og.png'));
await preview();
console.log(`brand: wrote favicon.svg, og.png; preview ${PREVIEW}`);
