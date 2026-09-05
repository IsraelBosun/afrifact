/**
 * Every icon the app ships, from one source drawing.
 *
 * Run: `node scripts/make-icons.js`
 *
 * This is a script rather than a one-off because the source will be
 * replaced. `afri_logo.jpg` is 225x225, which is enough for a launcher
 * icon on a real screen and soft in a 512px Play Store listing. When a
 * larger export of the same drawing arrives, drop it in at SOURCE and run
 * this again — the eight outputs and their geometry stay identical, and
 * the only thing that changes is that they stop being upscaled.
 *
 * WHY THE BACKGROUND IS CREAM
 *
 * The mark is warm — orange, rust, olive, black outlines. On the brand
 * green the olive muddies; on near-black the outlines inside the map
 * disappear into the ground. `#FBF3E8` is the app's own surface colour, it
 * leaves the drawing exactly as drawn, and a flat cream square is legible
 * against a home screen of saturated ones. It also makes the keying below
 * nearly free: any light fringe JPEG left around the outlines lands on a
 * light ground.
 */

const path = require('node:path');
const fs = require('node:fs');

const Jimp = require('jimp-compact');

// Resolved from the working directory, the way `reset-project.js` does, so
// `npm run icons` is the supported way in and the guard in main() catches
// anyone who runs it from somewhere else.
const ROOT = process.cwd();
const SOURCE = path.join(ROOT, '..', 'afri_logo.jpg');
const IMAGES = path.join(ROOT, 'assets', 'images');
const STORE = path.join(ROOT, 'assets', 'store');

/** The app's warm off-white. Kept in step with `neutrals.light.surface`. */
const GROUND = '#FBF3E8';

/*
  Where the white stops being the page and starts being the drawing.

  Two thresholds, not one. Above BG_MAX a pixel is background; below it the
  pixel is on the anti-aliased edge and gets partial alpha, which is what
  keeps a 1024px upscale from having a staircase for a coastline. The flood
  fill matters more than either number: it enters only from the border, so
  the light dots *inside* the pattern stay opaque instead of being punched
  out as holes.
*/
const BG_MIN = 210;
const BG_MAX = 250;

const write = (image, file) =>
  new Promise((resolve, reject) => {
    image.write(file, (err) => (err ? reject(err) : resolve(file)));
  });

/**
 * The drawing on transparent, cropped to itself.
 *
 * Upscaled BEFORE the background is removed, deliberately. Keying at 225
 * and enlarging afterwards enlarges the alpha decisions too, and every
 * edge comes out as a visible step. Bicubic first turns each edge into a
 * white-to-colour gradient, and the ramp then reads that gradient as
 * anti-aliasing.
 */
async function loadMark(working = 1024) {
  const image = await Jimp.read(SOURCE);
  image.resize(working, working, Jimp.RESIZE_BICUBIC);

  const { width: w, height: h, data } = image.bitmap;
  const at = (x, y) => (y * w + x) * 4;

  // Flood fill the page from all four edges. A stack, not recursion: a
  // million-pixel fill overflows the call stack on the first run.
  const seen = new Uint8Array(w * h);
  const stack = [];
  const isPage = (x, y) => {
    const i = at(x, y);
    return data[i] > BG_MIN && data[i + 1] > BG_MIN && data[i + 2] > BG_MIN;
  };
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const k = y * w + x;
    if (seen[k] === 1 || !isPage(x, y)) return;
    seen[k] = 1;
    stack.push(k);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (stack.length > 0) {
    const k = stack.pop();
    const x = k % w;
    const y = (k - x) / w;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let k = 0; k < seen.length; k++) {
    if (seen[k] === 0) continue;
    const i = k * 4;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // BG_MIN opaque, BG_MAX clear, linear between.
    const alpha = lum >= BG_MAX ? 0 : Math.round(255 * ((BG_MAX - lum) / (BG_MAX - BG_MIN)));
    data[i + 3] = alpha;
  }

  // Crop to the drawing so every output below can position it by its own
  // bounds rather than by whatever margin the source happened to carry.
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[at(x, y) + 3] < 24) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  image.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
  return image;
}

/**
 * The mark centred on a canvas, at `fill` of its longest side.
 *
 * `fill` is the whole geometry argument. An adaptive foreground has to sit
 * inside the 66% the launcher promises not to crop; a splash is contained
 * by the plugin already, so padding baked into the PNG only shrinks it
 * twice. Same drawing, different room around it.
 */
function place(mark, size, fill, background) {
  const canvas = new Jimp(size, size, background ?? 0x00000000);
  const scale = (size * fill) / Math.max(mark.bitmap.width, mark.bitmap.height);
  const art = mark
    .clone()
    .resize(
      Math.round(mark.bitmap.width * scale),
      Math.round(mark.bitmap.height * scale),
      Jimp.RESIZE_BICUBIC,
    );
  canvas.composite(
    art,
    Math.round((size - art.bitmap.width) / 2),
    Math.round((size - art.bitmap.height) / 2),
  );
  return canvas;
}

/**
 * The same shape as one flat colour.
 *
 * Android 13 themed icons tint this layer and use only its alpha, so the
 * pattern inside the map is not just lost, it is noise — a filled
 * continent is the recognisable thing at 48dp.
 *
 * The alpha is stretched rather than snapped. Snapping every non-clear
 * pixel to solid also promotes the JPEG's edge noise, and the coastline
 * came out crawling with white specks; this drops everything under a
 * quarter alpha and keeps a real ramp above it, so the outline stays
 * smooth.
 */
function silhouette(mark) {
  const flat = mark.clone();
  const { data } = flat.bitmap;
  const LO = 64;
  const HI = 192;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    const a = data[i + 3];
    data[i + 3] = a <= LO ? 0 : a >= HI ? 255 : Math.round((255 * (a - LO)) / (HI - LO));
  }
  return flat;
}

/**
 * Clear the canvas outside a rounded square.
 *
 * Only the splash needs this. It is the one asset shown against both
 * neutrals, and the drawing has black outlines that vanish into
 * `#0E100F` — on the dark splash the map fell apart into loose coloured
 * stripes. Carrying its own cream tile fixes that, and on the light splash
 * the tile is the same cream as the ground behind it, so it disappears and
 * the mark reads bare. One asset, right on both.
 */
function roundCorners(image, radius) {
  const { width: w, height: h, data } = image.bitmap;
  const corners = [
    [radius, radius],
    [w - radius, radius],
    [radius, h - radius],
    [w - radius, h - radius],
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inX = x >= radius && x <= w - radius;
      const inY = y >= radius && y <= h - radius;
      if (inX || inY) continue;
      const [cx, cy] = corners[(y < h / 2 ? 0 : 2) + (x < w / 2 ? 0 : 1)];
      const d = Math.hypot(x - cx, y - cy);
      if (d <= radius - 1) continue;
      const i = (y * w + x) * 4;
      // One pixel of feathering, so the corner is a curve and not a stair.
      data[i + 3] = d >= radius ? 0 : Math.round(data[i + 3] * (radius - d));
    }
  }
  return image;
}

async function main() {
  if (!fs.existsSync(path.join(ROOT, 'app.json'))) {
    throw new Error('Run this from the afrifacts/ directory: `npm run icons`.');
  }
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`No source drawing at ${SOURCE}`);
  }
  fs.mkdirSync(STORE, { recursive: true });

  const ground = Jimp.cssColorToHex(GROUND);
  const mark = await loadMark(1024);

  const outputs = [
    // Opaque and full-bleed: iOS rejects transparency in the app icon, and
    // both platforms mask the corners themselves.
    [path.join(IMAGES, 'icon.png'), place(mark, 1024, 0.84, ground)],

    // 0.62, under the 66% the adaptive mask guarantees. The launcher also
    // parallaxes this layer, so art near the edge gets clipped in motion
    // even when it survives standing still.
    [path.join(IMAGES, 'android-icon-foreground.png'), place(mark, 1024, 0.64, 0x00000000)],
    [path.join(IMAGES, 'android-icon-background.png'), new Jimp(1024, 1024, ground)],
    [path.join(IMAGES, 'android-icon-monochrome.png'), place(silhouette(mark), 1024, 0.64, 0x00000000)],

    // A cream tile with rounded corners, not a bare transparent mark — see
    // roundCorners(). app.json already contains this to 200px, so the fill
    // stays high: padding baked in here would shrink it a second time.
    [path.join(IMAGES, 'splash-icon.png'), roundCorners(place(mark, 1024, 0.82, ground), 232)],

    [path.join(IMAGES, 'favicon.png'), place(mark, 48, 0.86, ground)],

    /*
      The in-app mark. Cream ground rather than transparent because it is
      rendered over category colour on share cards, where the black
      outlines in the drawing would vanish. Logo.tsx rounds the corners.

      256, and this is the only output here that ships inside the JS
      bundle — the rest are read by the build. Its biggest real render is
      96px (32dp in the top bar at 3x, and 30 scaled 3x on a captured
      share card), so 512 was a quarter of a megabyte to serve a quarter
      of the pixels.
    */
    [path.join(IMAGES, 'logo-mark.png'), place(mark, 256, 0.88, ground)],

    /*
      The bare map, no tile behind it.

      For the country pill in the top bar, which shows a flag emoji for a
      country and this for "Africa · all". It cannot be `logo-mark.png`:
      that carries the cream tile, and a second cream tile 200px from the
      wordmark's one would read as the logo accidentally drawn twice
      rather than as a state. 128 covers a ~20px pill at 4x.
    */
    [path.join(IMAGES, 'map-mark.png'), place(mark, 128, 0.98, 0x00000000)],

    // Play Store listing icon. 512x512, opaque, no transparency allowed.
    [path.join(STORE, 'play-icon.png'), place(mark, 512, 0.84, ground)],
  ];

  for (const [file, image] of outputs) {
    await write(image, file);
    console.log(`${path.relative(ROOT, file)}  ${image.bitmap.width}x${image.bitmap.height}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
