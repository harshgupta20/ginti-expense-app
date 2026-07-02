/**
 * Generates Ginti's brand assets — app icon, adaptive icon, splash and the
 * monochrome notification icon — from a single procedurally-drawn logo mark
 * ("rising bars + spark"). Pure Node.js, no external deps.
 *
 * Run:  node scripts/generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── PNG encoding (RGBA, colour type 6) ──────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function writePNG(file, rgba, w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy ? rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
              : Buffer.from(rgba.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const out = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, out);
}

// ─── Canvas helpers (Uint8 RGBA, src-over compositing) ───────────────────────
function blank(w, h) { return new Uint8Array(w * h * 4); }
function over(buf, w, x, y, r, g, b, a) {
  if (a <= 0 || x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  if (i < 0 || i + 3 >= buf.length) return;
  const sa = a / 255;
  const da = buf[i + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa <= 0) return;
  buf[i]     = Math.round((r * sa + buf[i]     * da * (1 - sa)) / oa);
  buf[i + 1] = Math.round((g * sa + buf[i + 1] * da * (1 - sa)) / oa);
  buf[i + 2] = Math.round((b * sa + buf[i + 2] * da * (1 - sa)) / oa);
  buf[i + 3] = Math.round(oa * 255);
}
function fillRoundedRect(buf, w, h, x0, y0, x1, y1, rad, color) {
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
      // distance into the rounded corners
      const cx = Math.min(Math.max(x, x0 + rad), x1 - rad);
      const cy = Math.min(Math.max(y, y0 + rad), y1 - rad);
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= rad * rad) over(buf, w, x, y, color[0], color[1], color[2], color[3]);
    }
  }
}
// 4-point concave star (astroid): sqrt(|nx|)+sqrt(|ny|) <= 1
function fillSpark(buf, w, cx, cy, R, color) {
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) {
    for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
      const nx = Math.abs(x - cx) / R, ny = Math.abs(y - cy) / R;
      if (Math.sqrt(nx) + Math.sqrt(ny) <= 1) over(buf, w, x, y, color[0], color[1], color[2], color[3]);
    }
  }
}

// Downsample a super-sampled canvas by averaging SS×SS blocks (premultiplied).
function downsample(src, w, h, ss) {
  const dw = w / ss, dh = h / ss;
  const dst = blank(dw, dh);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      let ar = 0, ag = 0, ab = 0, aa = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const i = ((y * ss + sy) * w + (x * ss + sx)) * 4;
          const a = src[i + 3] / 255;
          ar += src[i] * a; ag += src[i + 1] * a; ab += src[i + 2] * a; aa += a;
        }
      }
      const n = ss * ss, di = (y * dw + x) * 4;
      dst[di]     = aa > 0 ? Math.round(ar / aa) : 0;
      dst[di + 1] = aa > 0 ? Math.round(ag / aa) : 0;
      dst[di + 2] = aa > 0 ? Math.round(ab / aa) : 0;
      dst[di + 3] = Math.round((aa / n) * 255);
    }
  }
  return { buf: dst, w: dw, h: dh };
}

// Bilinear scale of an RGBA bitmap.
function scale(src, sw, sh, dw, dh) {
  const dst = blank(dw, dh);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const gx = (x / dw) * (sw - 1), gy = (y / dh) * (sh - 1);
      const x0 = Math.floor(gx), y0 = Math.floor(gy);
      const x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
      const fx = gx - x0, fy = gy - y0, di = (y * dw + x) * 4;
      for (let c = 0; c < 4; c++) {
        const a = src[(y0 * sw + x0) * 4 + c], b = src[(y0 * sw + x1) * 4 + c];
        const d = src[(y1 * sw + x0) * 4 + c], e = src[(y1 * sw + x1) * 4 + c];
        dst[di + c] = Math.round(a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + d * (1 - fx) * fy + e * fx * fy);
      }
    }
  }
  return dst;
}

function compositeCentered(dst, dw, dh, src, sw, sh, scaleFactor, offsetY = 0) {
  const tw = Math.round(dw * scaleFactor);
  const th = Math.round(tw * (sh / sw));
  const scaled = scale(src, sw, sh, tw, th);
  const ox = Math.round((dw - tw) / 2), oy = Math.round((dh - th) / 2 + offsetY);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const i = (y * tw + x) * 4;
      over(dst, dw, ox + x, oy + y, scaled[i], scaled[i + 1], scaled[i + 2], scaled[i + 3]);
    }
  }
}

// ─── The logo mark: 3 ascending rounded bars + a spark ───────────────────────
const WHITE = [255, 255, 255, 255];
function renderMark(size, ss) {
  const W = size * ss;
  const buf = blank(W, W);
  const u = W / 1024; // design in a 1024 grid
  const barW = 150 * u, gap = 60 * u;
  const groupW = barW * 3 + gap * 2;
  const startX = (W - groupW) / 2;
  const baseline = 745 * u;
  const heights = [240 * u, 385 * u, 530 * u];
  for (let i = 0; i < 3; i++) {
    const x0 = startX + i * (barW + gap);
    const yTop = baseline - heights[i];
    fillRoundedRect(buf, W, W, x0, yTop, x0 + barW, baseline, barW / 2, WHITE);
  }
  // Spark above the tallest (rightmost) bar
  const sparkCx = startX + 2 * (barW + gap) + barW / 2 + 70 * u;
  const sparkCy = baseline - heights[2] - 70 * u;
  fillSpark(buf, W, sparkCx, sparkCy, 95 * u, WHITE);
  fillSpark(buf, W, sparkCx + 150 * u, sparkCy + 60 * u, 42 * u, WHITE); // tiny companion
  return downsample(buf, W, W, ss);
}

// Premium rounded tile: 3-stop diagonal gradient + glossy top-left highlight +
// bottom-right depth vignette. radFrac = 0 gives a full-bleed square (for Android
// adaptive foreground, which the OS masks into its own shape).
function gradientTile(size, _top, _bottom, radFrac) {
  const buf = blank(size, size);
  const rad = size * radFrac;
  const c0 = [83, 74, 226];   // deep indigo  (top-left)
  const c1 = [108, 99, 255];  // brand violet (middle)
  const c2 = [162, 150, 255]; // soft lavender (bottom-right)
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

  const hx = size * 0.30, hy = size * 0.24, hr = size * 0.62; // highlight centre
  const vx = size * 0.86, vy = size * 0.9, vr = size * 0.8;   // vignette centre

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = Math.min(Math.max(x, rad), size - rad);
      const cy = Math.min(Math.max(y, rad), size - rad);
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy > rad * rad) continue;

      const t = (x + y) / (2 * (size - 1)); // diagonal 0..1
      let r, g, b;
      if (t < 0.5) {
        const tt = t / 0.5;
        r = lerp(c0[0], c1[0], tt); g = lerp(c0[1], c1[1], tt); b = lerp(c0[2], c1[2], tt);
      } else {
        const tt = (t - 0.5) / 0.5;
        r = lerp(c1[0], c2[0], tt); g = lerp(c1[1], c2[1], tt); b = lerp(c1[2], c2[2], tt);
      }

      // glossy highlight (additive white, soft falloff)
      const hd = Math.hypot(x - hx, y - hy) / hr;
      const hi = Math.max(0, 1 - hd);
      const glow = hi * hi * 60;
      r += glow; g += glow; b += glow;

      // depth vignette (multiplicative darken toward bottom-right)
      const vd = Math.hypot(x - vx, y - vy) / vr;
      const vig = 1 - Math.max(0, 1 - vd) * 0.22;
      r *= vig; g *= vig; b *= vig;

      const i = (y * size + x) * 4;
      buf[i] = clamp(Math.round(r)); buf[i + 1] = clamp(Math.round(g)); buf[i + 2] = clamp(Math.round(b)); buf[i + 3] = 255;
    }
  }
  return buf;
}

// ─── Build the files ─────────────────────────────────────────────────────────
const ASSETS = path.join(__dirname, '..', 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

const PURPLE_TOP = [124, 116, 255];   // #7C74FF
const PURPLE_BOT = [91, 81, 232];     // #5B51E8
const DARK = [10, 10, 10];            // #0A0A0A

const SS = 4;
const mark = renderMark(1024, SS); // { buf, w, h } white-on-transparent

// 1. icon.png — full gradient tile + white mark (iOS / legacy launcher)
{
  const S = 1024;
  const canvas = gradientTile(S, PURPLE_TOP, PURPLE_BOT, 0.235);
  compositeCentered(canvas, S, S, mark.buf, mark.w, mark.h, 0.58);
  writePNG(path.join(ASSETS, 'icon.png'), canvas, S, S);
  console.log('✓ icon.png (1024×1024)');
}

// 2. adaptive-icon.png — full-bleed premium gradient + mark (Android adaptive
//    foreground). radFrac 0 = square; the OS masks it into the launcher shape.
//    Mark kept inside the ~66% safe zone so masking never clips it.
{
  const S = 1024;
  const canvas = gradientTile(S, PURPLE_TOP, PURPLE_BOT, 0);
  compositeCentered(canvas, S, S, mark.buf, mark.w, mark.h, 0.5);
  writePNG(path.join(ASSETS, 'adaptive-icon.png'), canvas, S, S);
  console.log('✓ adaptive-icon.png (1024×1024)');
}

// 3. notification-icon.png — white silhouette on transparent (Android status bar)
{
  const S = 96;
  const small = scale(mark.buf, mark.w, mark.h, S, S);
  // Force pure white where visible (status bar tints it anyway).
  for (let i = 0; i < small.length; i += 4) {
    if (small[i + 3] > 10) { small[i] = 255; small[i + 1] = 255; small[i + 2] = 255; }
  }
  writePNG(path.join(ASSETS, 'notification-icon.png'), small, S, S);
  console.log('✓ notification-icon.png (96×96)');
}

// 4. splash.png — dark canvas with a centered gradient logo tile
{
  const W = 1284, H = 2778;
  const canvas = blank(W, H);
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = DARK[0]; canvas[i + 1] = DARK[1]; canvas[i + 2] = DARK[2]; canvas[i + 3] = 255;
  }
  const tileSize = 460;
  const tile = gradientTile(tileSize, PURPLE_TOP, PURPLE_BOT, 0.235);
  compositeCentered(tile, tileSize, tileSize, mark.buf, mark.w, mark.h, 0.58);
  // place tile centered
  const ox = Math.round((W - tileSize) / 2), oy = Math.round((H - tileSize) / 2);
  for (let y = 0; y < tileSize; y++)
    for (let x = 0; x < tileSize; x++) {
      const i = (y * tileSize + x) * 4;
      over(canvas, W, ox + x, oy + y, tile[i], tile[i + 1], tile[i + 2], tile[i + 3]);
    }
  writePNG(path.join(ASSETS, 'splash.png'), canvas, W, H);
  console.log('✓ splash.png (1284×2778)');
}

// ─── Google Play store graphics ──────────────────────────────────────────────
const PLAY = path.join(ASSETS, 'play');
fs.mkdirSync(PLAY, { recursive: true });

// 5. play-icon-512.png — Play Console hi-res icon (512×512, full-bleed, no transparent
//    corners; Play applies its own masking/rounding).
{
  const S = 512;
  const canvas = gradientTile(S, PURPLE_TOP, PURPLE_BOT, 0);
  compositeCentered(canvas, S, S, mark.buf, mark.w, mark.h, 0.56);
  writePNG(path.join(PLAY, 'play-icon-512.png'), canvas, S, S);
  console.log('✓ play/play-icon-512.png (512×512)');
}

// 6. feature-graphic-1024x500.png — premium gradient banner with the logo mark.
{
  const W = 1024, H = 500;
  const c0 = [83, 74, 226], c1 = [108, 99, 255], c2 = [162, 150, 255];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
  const canvas = blank(W, H);
  const hx = W * 0.25, hy = H * 0.2, hr = W * 0.6;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = (x / W + y / H) / 2;
      let r, g, b;
      if (t < 0.5) { const tt = t / 0.5; r = lerp(c0[0], c1[0], tt); g = lerp(c0[1], c1[1], tt); b = lerp(c0[2], c1[2], tt); }
      else { const tt = (t - 0.5) / 0.5; r = lerp(c1[0], c2[0], tt); g = lerp(c1[1], c2[1], tt); b = lerp(c1[2], c2[2], tt); }
      const hd = Math.hypot(x - hx, y - hy) / hr, hi = Math.max(0, 1 - hd);
      const glow = hi * hi * 55; r += glow; g += glow; b += glow;
      const i = (y * W + x) * 4;
      canvas[i] = clamp(Math.round(r)); canvas[i + 1] = clamp(Math.round(g)); canvas[i + 2] = clamp(Math.round(b)); canvas[i + 3] = 255;
    }
  }
  // logo mark on the left third
  const mh = 300, mw = Math.round(mh * (mark.w / mark.h));
  const scaled = scale(mark.buf, mark.w, mark.h, mw, mh);
  const ox = Math.round(W * 0.18), oy = Math.round((H - mh) / 2);
  for (let y = 0; y < mh; y++)
    for (let x = 0; x < mw; x++) {
      const i = (y * mw + x) * 4;
      over(canvas, W, ox + x, oy + y, scaled[i], scaled[i + 1], scaled[i + 2], scaled[i + 3]);
    }
  writePNG(path.join(PLAY, 'feature-graphic-1024x500.png'), canvas, W, H);
  console.log('✓ play/feature-graphic-1024x500.png (1024×500)');
}

console.log('\nAll Ginti assets generated in assets/ (+ Play graphics in assets/play/)');
