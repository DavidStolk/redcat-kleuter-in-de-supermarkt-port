// Director 6 inks used by the game, on RGBA pixel buffers (decomp/notes/runtime.md, "Sprites and
// inks"; inks in use: decomp/formats/score.md). Pure functions: stage.ts caches the results.
export const INK_COPY = 0;
export const INK_MATTE = 8;
export const INK_BACKGND_TRANS = 36;

                                                    

/** 1-bit bitmap colouring: black (index 1) -> foreground, white (index 0) -> background colour. */
export function colorize1bit(px                   , fore     , back     )       {
  for (let i = 0; i < px.length; i += 4) {
    const c = px[i] === 0 && px[i + 1] === 0 && px[i + 2] === 0 ? fore : back;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
  }
}

/** backgndTrans: every pixel of the background colour becomes transparent. */
export function backgndTrans(px                   , back     )       {
  for (let i = 0; i < px.length; i += 4) {
    if (px[i] === back[0] && px[i + 1] === back[1] && px[i + 2] === back[2]) px[i + 3] = 0;
  }
}

/** Matte mask (1 = part of the sprite): white pixels reached by a flood fill from the bitmap's
 * edges are outside (ScummVM castmember/bitmap.cpp createMatte). TODO(faithful): 4-connected
 * fill assumed. */
export function matteMask(px                   , w        , h        )             {
  const mask = new Uint8Array(w * h).fill(1);
  const white = (p        )          => px[p * 4] === 255 && px[p * 4 + 1] === 255 && px[p * 4 + 2] === 255;
  const stack           = [];
  const seed = (p        )       => { if (mask[p] && white(p)) { mask[p] = 0; stack.push(p); } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop() ;
    const x = p % w, y = (p - x) / w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (y > 0) seed(p - w);
    if (y < h - 1) seed(p + w);
  }
  return mask;
}

export function applyMask(px                   , mask            )       {
  for (let p = 0; p < mask.length; p++) if (!mask[p]) px[p * 4 + 3] = 0;
}

/** Forces full opacity (32-bit `MIDX_*` bitmaps: the alpha byte is padding). */
export function opaque(px                   )       {
  for (let i = 3; i < px.length; i += 4) px[i] = 255;
}
