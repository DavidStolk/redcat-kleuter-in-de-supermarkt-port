// The game's own Windows icon (Redcat's head, LOCAL/RCK1.exe), read from the player's CD and used
// as the page's home-screen and tab icon. The release carries no game artwork: until the files
// are imported, the page keeps its neutral fallback (port/public/icons/).
// PE resources: RT_ICON (3) entries are DIBs: BITMAPINFOHEADER, palette, XOR bitmap (bottom-up),
// 1-bit AND mask (1 = transparent); rows padded to 4 bytes.
                                               

/** The largest (then deepest) icon in a Windows program, or null when it has none. */
export function exeIcon(buf             )                   {
  const d = new DataView(buf);
  const u8 = new Uint8Array(buf);
  if (d.getUint16(0, true) !== 0x5a4d) return null; // MZ
  const pe = d.getUint32(0x3c, true);
  if (d.getUint32(pe, true) !== 0x4550) return null; // PE\0\0
  const nsec = d.getUint16(pe + 6, true), optsz = d.getUint16(pe + 20, true), opt = pe + 24;
  const dirs = opt + (d.getUint16(opt, true) === 0x20b ? 112 : 96);
  const resRva = d.getUint32(dirs + 2 * 8, true);
  if (!resRva) return null;
  const secs                                  = [];
  for (let i = 0; i < nsec; i++) {
    const o = opt + optsz + 40 * i;
    secs.push([d.getUint32(o + 12, true), Math.max(d.getUint32(o + 8, true), d.getUint32(o + 16, true)), d.getUint32(o + 20, true)]);
  }
  const off = (rva        )         => {
    for (const [va, sz, raw] of secs) if (rva >= va && rva < va + sz) return rva - va + raw;
    throw new Error('icon: bad rva');
  };
  const base = off(resRva);
  // Resource directory: type -> name -> language -> data entry.
  const entries = (o        )                          => {
    const n = d.getUint16(o + 12, true) + d.getUint16(o + 14, true);
    return Array.from({ length: n }, (_, i) => [d.getUint32(o + 16 + 8 * i, true), d.getUint32(o + 20 + 8 * i, true)]);
  };
  const icons               = [];
  for (const [type, t] of entries(base)) {
    if (type !== 3 || !(t & 0x80000000)) continue;
    for (const [, n] of entries(base + (t & 0x7fffffff))) {
      const leaves = n & 0x80000000 ? entries(base + (n & 0x7fffffff)).map(([, l]) => l) : [n];
      for (const l of leaves) {
        const rva = d.getUint32(base + l, true), size = d.getUint32(base + l + 4, true);
        icons.push(u8.subarray(off(rva), off(rva) + size));
      }
    }
  }
  let best                   = null, bestKey = -1;
  for (const b of icons) {
    const img = decodeDib(b);
    if (!img) continue;
    const key = img.w * 1000 + (new DataView(b.buffer, b.byteOffset).getUint16(14, true));
    if (key > bestKey) { best = img; bestKey = key; }
  }
  return best;
}

/** An icon DIB (1/4/8/24/32-bit) with its AND mask, as RGBA; null for PNG-compressed icons. */
function decodeDib(b            )                   {
  const d = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const hdr = d.getUint32(0, true);
  if (hdr !== 40) return null;
  const w = d.getInt32(4, true), h = d.getInt32(8, true) / 2, bpp = d.getUint16(14, true);
  if (w <= 0 || h <= 0 || ![1, 4, 8, 24, 32].includes(bpp)) return null;
  const nPal = bpp <= 8 ? (d.getUint32(32, true) || 1 << bpp) : 0;
  const pal = hdr;
  const xor = pal + 4 * nPal, xorStride = ((w * bpp + 31) >> 5) * 4;
  const and = xor + xorStride * h, andStride = ((w + 31) >> 5) * 4;
  if (and + andStride * h > b.length) return null;
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const row = xor + (h - 1 - y) * xorStride, mrow = and + (h - 1 - y) * andStride; // bottom-up
    for (let x = 0; x < w; x++) {
      let r        , g        , bl        , a = 255;
      if (bpp <= 8) {
        const bit = x * bpp;
        const idx = (b[row + (bit >> 3)] >> (8 - bpp - (bit & 7))) & ((1 << bpp) - 1);
        const p = pal + 4 * idx;
        [bl, g, r] = [b[p], b[p + 1], b[p + 2]];
      } else {
        const p = row + x * (bpp / 8);
        [bl, g, r] = [b[p], b[p + 1], b[p + 2]];
        if (bpp === 32) a = b[p + 3];
      }
      if (bpp !== 32 && (b[mrow + (x >> 3)] >> (7 - (x & 7))) & 1) a = 0;
      const o = (y * w + x) * 4;
      rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = bl; rgba[o + 3] = a;
    }
  }
  return { w, h, rgba };
}

/** Background of the scaled icon: the blue of the logo film (Dxs3.avi), so the home screen
 * shows no black corners (iOS fills transparency with black). */
const BG = '#7f93c8';

/** The icon scaled up by a whole factor (sharp pixels, as the original 32x32 icon) and centred
 * on a `size` square. */
export function iconPng(img           , size        )         {
  const scale = Math.max(1, Math.floor(size * 0.875 / Math.max(img.w, img.h)));
  const src = document.createElement('canvas');
  src.width = img.w; src.height = img.h;
  src.getContext('2d') .putImageData(new ImageData(img.rgba, img.w, img.h), 0, 0);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const cx = c.getContext('2d') ;
  cx.fillStyle = BG;
  cx.fillRect(0, 0, size, size);
  cx.imageSmoothingEnabled = false;
  cx.drawImage(src, Math.floor((size - img.w * scale) / 2), Math.floor((size - img.h * scale) / 2), img.w * scale, img.h * scale);
  return c.toDataURL('image/png');
}

/** Points the page's icons (apple-touch-icon, tab icon, web app manifest) at the game's icon. */
export function useGameIcon(img           )       {
  const set = (rel        , href        , sizes         )       => {
    for (const l of document.querySelectorAll(`link[rel="${rel}"]`)) l.remove();
    const l = document.createElement('link');
    l.rel = rel; l.href = href;
    if (sizes) l.setAttribute('sizes', sizes);
    document.head.appendChild(l);
  };
  set('apple-touch-icon', iconPng(img, 180), '180x180');
  set('icon', iconPng(img, 64), '64x64');
  const link = document.querySelector                 ('link[rel="manifest"]');
  if (link) {
    void fetch(link.href).then((r) => r.json()).then((m) => {
      // A manifest from a blob URL needs absolute URLs.
      const here = new URL('./', location.href).href;
      m.start_url = here; m.scope = here;
      m.icons = [192, 512].map((s) => ({ src: iconPng(img, s), sizes: `${s}x${s}`, type: 'image/png' }));
      link.href = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: 'application/manifest+json' }));
    }).catch(() => {});
  }
}
