// Generates the 1200x630 social share card from content + the hero portrait.
//
// Share cards are landscape; the portrait is 3:4, so simply pointing og:image
// at the photo gets it cropped to ribbons by Twitter, LinkedIn and iMessage.
// This composes a proper card instead: the photo on the right, identity on the
// left, in the site's own palette and typeface.
//
// Everything is read from content/, so re-running after a name or title change
// regenerates a correct card:  yarn og
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const PHOTO_WIDTH = 470;
const PAD = 64;

const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), 'content');
const read = (file) => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8'));

const seo = read('seo.json');
const hero = read('hero.json');

// Palette lifted from globals.css so the card and the site cannot drift.
const INK = '#071A22';
const SURFACE = '#0C2530';
const TEXT = '#E6F4F6';
const MUTED = '#8FB3BC';
const ACCENT = '#22D3EE';
const WARM = '#FF9B5A';

const escape = (value) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// "Name — Role in Place" is the conventional title shape; the half after the
// dash is the useful subtitle. Falls back to the description's first sentence.
//
// A trailing location is dropped: the card already shows it as the eyebrow, and
// repeating it both wastes the line and pushes the role onto two.
function subtitleFrom(title, description, location) {
    const dash = title.split(/\s+[—–-]\s+/);
    const subtitle = dash.length > 1
        ? dash.slice(1).join(' — ')
        : (description.split(/(?<=\.)\s/)[0] ?? '');

    const locality = location.split(',')[0].trim();
    return subtitle
        .replace(new RegExp(`[,\\s]+(in\\s+)?${locality}\\s*$`, 'i'), '')
        .trim();
}

// Rough advance-width estimate for Space Grotesk; good enough to decide where
// to break a line, and far cheaper than shaping the text properly.
function wrap(text, fontSize, maxWidth) {
    const perChar = fontSize * 0.58;
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length * perChar > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) {
        lines.push(line);
    }
    return lines;
}

const textWidth = WIDTH - PHOTO_WIDTH - PAD * 2;
const nameLines = wrap(seo.name, 62, textWidth);
const subtitleLines = wrap(subtitleFrom(seo.title, seo.description, hero.location), 25, textWidth).slice(0, 2);

const nameTop = HEIGHT / 2 - (nameLines.length - 1) * 34 - subtitleLines.length * 20;

const overlay = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blend" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${INK}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="100%" stop-color="${WARM}"/>
    </linearGradient>
  </defs>

  <!-- feathers the photo into the panel instead of butting it up as a hard seam -->
  <rect x="${WIDTH - PHOTO_WIDTH}" y="0" width="150" height="${HEIGHT}" fill="url(#blend)"/>

  <rect x="${PAD}" y="${nameTop - 122}" width="64" height="4" rx="2" fill="url(#rule)"/>

  <text x="${PAD}" y="${nameTop - 74}" font-family="Space Grotesk" font-size="19"
        letter-spacing="3.4" fill="${WARM}">${escape(hero.location.toUpperCase())}</text>

  ${nameLines.map((line, index) => `
  <text x="${PAD}" y="${nameTop + index * 70}" font-family="Space Grotesk" font-size="62"
        font-weight="700" fill="${TEXT}">${escape(line)}</text>`).join('')}

  ${subtitleLines.map((line, index) => `
  <text x="${PAD}" y="${nameTop + nameLines.length * 70 + 12 + index * 38}"
        font-family="Space Grotesk" font-size="25" fill="${MUTED}">${escape(line)}</text>`).join('')}

  <text x="${PAD}" y="${HEIGHT - PAD}" font-family="Space Grotesk" font-size="22"
        fill="${ACCENT}">${escape(seo.url.replace(/^https?:\/\//, ''))}</text>
</svg>`;

const portraitPath = path.join(process.cwd(), 'public', path.basename(hero.image));

const photo = await sharp(portraitPath)
    // `attention` keeps the subject rather than the geometric centre when the
    // aspect ratios differ.
    .resize(PHOTO_WIDTH, HEIGHT, { fit: 'cover', position: sharp.strategy.attention })
    .toBuffer();

const output = path.join(process.cwd(), 'public', 'og.jpg');

await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: SURFACE },
})
    .composite([
        { input: await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: INK } }).png().toBuffer(), top: 0, left: 0 },
        { input: photo, top: 0, left: WIDTH - PHOTO_WIDTH },
        { input: Buffer.from(overlay), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(output);

const { size } = fs.statSync(output);
console.log(`wrote public/og.jpg — ${WIDTH}x${HEIGHT}, ${(size / 1024).toFixed(0)}KB`);
