// Intel Indeo Video Interactive 4 (IV41) decoder, for the intro video Dxs3.avi
// (decomp/notes/video.md). A TypeScript port of FFmpeg's decoder:
//   libavcodec/indeo4.c, ivi.c, ivi.h, ivi_dsp.c, ivi_dsp.h, indeo4data.h
//   Copyright (c) 2009-2011 Maxim Poliakovski; part of FFmpeg (https://ffmpeg.org).
// Like the original this file is free software under the GNU Lesser General Public License,
// version 2.1 or (at your option) any later version; it comes WITHOUT ANY WARRANTY (see the LGPL).
// Comments name the ported C function. Output is bit-exact with FFmpeg's yuv410p frames
// (port/test/indeo4.test.ts). Bitstream features FFmpeg rejects throw an Error here too; FFmpeg's
// av_assert0 aborts become Errors as well.
//
// C integer semantics kept: band buffers are int16 (Int16Array wraps like the C stores), macroblock
// q_delta / motion vectors are int8 (s8()), transform vectors int32.

/** Decoded picture: yuv410p planes, tightly packed (chroma ceil(w/4) x ceil(h/4)). */
                                                                 

// ivi.h IVI4_FRAMETYPE_*
const FT_INTRA = 0, FT_INTRA1 = 1, FT_INTER = 2, FT_BIDIR = 3, FT_NULL_FIRST = 5, FT_NULL_LAST = 6;
const IVI_VLC_BITS = 13;
const IVI4_PIC_SIZE_ESC = 7;

const s8 = (x        )         => (x << 24) >> 24;
/** ivi.h IVI_TOSIGNED: the sign is in the LSB. */
const toSigned = (v        )         => -((v >> 1) ^ -(v & 1)) | 0;
/** ivi.h ivi_scale_mv */
const scaleMv = (mv        , scale        )         => (mv + (mv > 0 ? 1 : 0) + (scale - 1)) >> scale;
const clipU8 = (x        )         => (x < 0 ? 0 : x > 255 ? 255 : x);

// ---------------------------------------------------------------------------------------------
// get_bits.h (BITSTREAM_READER_LE, checked reader): bits are taken LSB first; reads past the end
// return the bytes after it (FFmpeg packets carry zeroed padding: the frame is copied with 8 zero
// bytes), and the index is clamped to size + 8 bits.

class BitReader {
  buf            ; base        ; idx = 0; size        ; sizePlus8        ;
  constructor(buf            , base        , bytes        ) {
    this.buf = buf; this.base = base; this.size = bytes * 8; this.sizePlus8 = this.size + 8;
  }
  /** 32 bits from the current position (at least 25 valid). */
  peek()         {
    const b = this.base + (this.idx >> 3), d = this.buf;
    return ((d[b] | (d[b + 1] << 8) | (d[b + 2] << 16) | (d[b + 3] << 24)) >>> (this.idx & 7)) >>> 0;
  }
  skip(n        )       { this.idx = Math.min(this.sizePlus8, this.idx + n); }
  get(n        )         { const v = this.peek() & ((1 << n) - 1); this.skip(n); return v >>> 0; }
  get1()         { return this.get(1); }
  show(n        )         { return (this.peek() & ((1 << n) - 1)) >>> 0; }
  left()         { return this.size - this.idx; }
  align()       { this.skip(-this.idx & 7); }
  /** get_vlc2(gb, table, IVI_VLC_BITS, 1): unmatched codes give -1 and consume nothing. */
  vlc(t     )         {
    const e = this.peek() & 0x1fff;
    this.skip(t.len[e]);
    return t.sym[e];
  }
}

// ---------------------------------------------------------------------------------------------
// VLC tables. vlc_init(..., VLC_INIT_OUTPUT_LE) with an LE reader: the codeword's first (MSB) bit
// is the first bit read, so the lookup index is the bit-reversed codeword.

                                                  
                                                       
                                                                                           

/** ivi.c ivi_create_huff_from_desc (+ vlc_init) */
function createHuffFromDesc(cb          )      {
  const bits           = [], codes           = [];
  for (let i = 0; i < cb.numRows; i++) {
    const codesPerRow = 1 << cb.xbits[i];
    const notLastRow = i !== cb.numRows - 1 ? 1 : 0;
    const prefix = ((1 << i) - 1) << (cb.xbits[i] + notLastRow);
    for (let j = 0; j < codesPerRow; j++) {
      if (bits.length >= 256) break; // only 256 codes allowed
      let b = i + cb.xbits[i] + notLastRow;
      if (b > IVI_VLC_BITS) throw new Error('Indeo4: invalid Huffman descriptor');
      codes.push((prefix | j) & 0xffff);
      if (!b) b = 1;
      bits.push(b);
    }
  }
  const size = 1 << IVI_VLC_BITS;
  const t      = { sym: new Int16Array(size).fill(-1), len: new Uint8Array(size) };
  for (let s = 0; s < bits.length; s++) {
    const n = bits[s];
    let r = 0;
    for (let k = 0; k < n; k++) if (codes[s] & (1 << (n - 1 - k))) r |= 1 << k;
    for (let k = 0; k < size >> n; k++) {
      const e = r | (k << n);
      if (t.len[e]) throw new Error('Indeo4: incorrect VLC codes'); // vlc.c build_table
      t.sym[e] = s; t.len[e] = n;
    }
  }
  return t;
}

let staticMbVlc               = null, staticBlkVlc               = null;
/** ivi.c ivi_init_static_vlc */
function initStaticVlc()       {
  if (staticMbVlc) return;
  const d = (rows            )             => rows.map((x) => ({ numRows: x.length, xbits: x }));
  staticMbVlc = d(IVI_MB_HUFF_DESC).map(createHuffFromDesc);
  staticBlkVlc = d(IVI_BLK_HUFF_DESC).map(createHuffFromDesc);
}

/** ivi.c ff_ivi_dec_huff_desc */
function decHuffDesc(gb           , descCoded        , whichTab        , ht         )       {
  const statics = whichTab ? staticBlkVlc  : staticMbVlc ;
  if (!descCoded) { ht.tab = statics[7]; return; }
  ht.tabSel = gb.get(3);
  if (ht.tabSel === 7) {
    const numRows = gb.get(4);
    if (!numRows) throw new Error('Indeo4: empty custom Huffman table');
    const xbits           = [];
    for (let i = 0; i < numRows; i++) xbits.push(gb.get(4));
    const key = xbits.join(',');
    if (key !== ht.custKey || !ht.custTab) { // rebuild only if the custom table changed
      ht.custKey = ''; ht.custTab = createHuffFromDesc({ numRows, xbits }); ht.custKey = key;
    }
    ht.tab = ht.custTab;
  } else ht.tab = statics[ht.tabSel];
}

const newHuffTab = ()          => ({ tabSel: 0, tab: null, custKey: '', custTab: null });

// ---------------------------------------------------------------------------------------------
// ivi_dsp.c: inverse transforms (in: int32 coefficients, out: int16 band buffer at offset o).

                                                                                                            
                                                                                                    

// INV_HAAR8(s1, s5, s3, s7, s2, s4, s6, s8, d1..d8) with IVI_HAAR_BFLY; results in h[0..7] (d1..d8).
const h = new Int32Array(8);
function invHaar8(s1        , s5        , s3        , s7        , s2        , s4        , s6        , s8        )       {
  let t0        , t1 = s1 * 2, t5 = s5 * 2, t2        , t3        , t4        , t6        , t7        , t8        ;
  t0 = (t1 - t5) >> 1; t1 = (t1 + t5) >> 1; t5 = t0;
  t0 = (t1 - s3) >> 1; t1 = (t1 + s3) >> 1; t3 = t0;
  t0 = (t5 - s7) >> 1; t5 = (t5 + s7) >> 1; t7 = t0;
  t0 = (t1 - s2) >> 1; t1 = (t1 + s2) >> 1; t2 = t0;
  t0 = (t3 - s4) >> 1; t3 = (t3 + s4) >> 1; t4 = t0;
  t0 = (t5 - s6) >> 1; t5 = (t5 + s6) >> 1; t6 = t0;
  t0 = (t7 - s8) >> 1; t7 = (t7 + s8) >> 1; t8 = t0;
  h[0] = t1; h[1] = t2; h[2] = t3; h[3] = t4; h[4] = t5; h[5] = t6; h[6] = t7; h[7] = t8;
}
// INV_HAAR4(s1, s3, s5, s7, d1..d4)
function invHaar4(s1        , s3        , s5        , s7        )       {
  let t4 = (s1 - s3) >> 1;
  const t0 = (s1 + s3) >> 1, t1 = t4;
  t4 = (t0 - s5) >> 1; h[0] = (t0 + s5) >> 1; h[1] = t4;
  t4 = (t1 - s7) >> 1; h[2] = (t1 + s7) >> 1; h[3] = t4;
}
// IVI_INV_SLANT8(s1, s4, s8, s5, s2, s6, s3, s7, d1..d8); c = 1: COMPENSATE(x) = (x + 1) >> 1.
function invSlant8(s1        , s4        , s8        , s5        , s2        , s6        , s3        , s7        , c        )       {
  let t0        , t1        , t2        , t3        , t4        , t5        , t6        , t7        , t8        ;
  t0 = s5 + ((s4 * 4 - s5 + 4) >> 3); t5 = s4 + ((-s4 - s5 * 4 + 4) >> 3); t4 = t0; // IVI_SLANT_PART4
  t0 = s1 - t5; t1 = s1 + t5; t5 = t0;
  t0 = s2 - s6; t2 = s2 + s6; t6 = t0;
  t0 = s7 - s3; t7 = s7 + s3; t3 = t0;
  t0 = t4 - s8; t4 = t4 + s8; t8 = t0;
  t0 = t1 - t2; t1 = t1 + t2; t2 = t0;
  t0 = ((t4 + t3 * 2 + 2) >> 2) + t4; t3 = ((t4 * 2 - t3 + 2) >> 2) - t3; t4 = t0; // IVI_IREFLECT
  t0 = t5 - t6; t5 = t5 + t6; t6 = t0;
  t0 = ((t8 + t7 * 2 + 2) >> 2) + t8; t7 = ((t8 * 2 - t7 + 2) >> 2) - t7; t8 = t0;
  t0 = t1 - t4; t1 = t1 + t4; t4 = t0;
  t0 = t2 - t3; t2 = t2 + t3; t3 = t0;
  t0 = t5 - t8; t5 = t5 + t8; t8 = t0;
  t0 = t6 - t7; t6 = t6 + t7; t7 = t0;
  h[0] = (t1 + c) >> c; h[1] = (t2 + c) >> c; h[2] = (t3 + c) >> c; h[3] = (t4 + c) >> c;
  h[4] = (t5 + c) >> c; h[5] = (t6 + c) >> c; h[6] = (t7 + c) >> c; h[7] = (t8 + c) >> c;
}
// IVI_INV_SLANT4(s1, s4, s2, s3, d1..d4)
function invSlant4(s1        , s4        , s2        , s3        , c        )       {
  let t0        , t1        , t2        , t3        , t4        ;
  t0 = s1 - s2; t1 = s1 + s2; t2 = t0;
  t0 = ((s4 + s3 * 2 + 2) >> 2) + s4; t3 = ((s4 * 2 - s3 + 2) >> 2) - s3; t4 = t0;
  t0 = t1 - t4; t1 = t1 + t4; t4 = t0;
  t0 = t2 - t3; t2 = t2 + t3; t3 = t0;
  h[0] = (t1 + c) >> c; h[1] = (t2 + c) >> c; h[2] = (t3 + c) >> c; h[3] = (t4 + c) >> c;
}

const tmp64 = new Int32Array(64);
const zero8 = (out            , o        , n        )       => { for (let x = 0; x < n; x++) out[o + x] = 0; };
const rowsZero = (a            , i        , n        )          => { for (let x = 0; x < n; x++) if (a[i + x]) return false; return true; };

/** ff_ivi_inverse_haar_8x8 */
const inverseHaar8x8               = (inp, out, o, pitch, flags) => {
  const tmp = tmp64;
  for (let i = 0; i < 8; i++) {
    if (flags[i]) {
      const sh = !(i & 4) ? 1 : 0; // pre-scaling
      invHaar8(inp[i] * (1 << sh), inp[i + 8] * (1 << sh), inp[i + 16] * (1 << sh), inp[i + 24] * (1 << sh),
        inp[i + 32], inp[i + 40], inp[i + 48], inp[i + 56]);
      for (let k = 0; k < 8; k++) tmp[i + k * 8] = h[k];
    } else for (let k = 0; k < 8; k++) tmp[i + k * 8] = 0;
  }
  for (let i = 0; i < 8; i++, o += pitch) {
    const s = i * 8;
    if (rowsZero(tmp, s, 8)) zero8(out, o, 8);
    else {
      invHaar8(tmp[s], tmp[s + 1], tmp[s + 2], tmp[s + 3], tmp[s + 4], tmp[s + 5], tmp[s + 6], tmp[s + 7]);
      for (let k = 0; k < 8; k++) out[o + k] = h[k];
    }
  }
};
/** ff_ivi_row_haar8 */
const rowHaar8               = (inp, out, o, pitch) => {
  for (let i = 0; i < 8; i++, o += pitch) {
    const s = i * 8;
    if (rowsZero(inp, s, 8)) zero8(out, o, 8);
    else {
      invHaar8(inp[s], inp[s + 1], inp[s + 2], inp[s + 3], inp[s + 4], inp[s + 5], inp[s + 6], inp[s + 7]);
      for (let k = 0; k < 8; k++) out[o + k] = h[k];
    }
  }
};
/** ff_ivi_col_haar8 */
const colHaar8               = (inp, out, o, pitch, flags) => {
  for (let i = 0; i < 8; i++) {
    if (flags[i]) {
      invHaar8(inp[i], inp[i + 8], inp[i + 16], inp[i + 24], inp[i + 32], inp[i + 40], inp[i + 48], inp[i + 56]);
      for (let k = 0; k < 8; k++) out[o + i + k * pitch] = h[k];
    } else for (let k = 0; k < 8; k++) out[o + i + k * pitch] = 0;
  }
};
/** ff_ivi_inverse_haar_4x4 */
const inverseHaar4x4               = (inp, out, o, pitch, flags) => {
  const tmp = tmp64;
  for (let i = 0; i < 4; i++) {
    if (flags[i]) {
      const sh = !(i & 2) ? 1 : 0;
      invHaar4(inp[i] * (1 << sh), inp[i + 4] * (1 << sh), inp[i + 8], inp[i + 12]);
      for (let k = 0; k < 4; k++) tmp[i + k * 4] = h[k];
    } else for (let k = 0; k < 4; k++) tmp[i + k * 4] = 0;
  }
  for (let i = 0; i < 4; i++, o += pitch) {
    const s = i * 4;
    if (rowsZero(tmp, s, 4)) zero8(out, o, 4);
    else { invHaar4(tmp[s], tmp[s + 1], tmp[s + 2], tmp[s + 3]); for (let k = 0; k < 4; k++) out[o + k] = h[k]; }
  }
};
/** ff_ivi_row_haar4 */
const rowHaar4               = (inp, out, o, pitch) => {
  for (let i = 0; i < 4; i++, o += pitch) {
    const s = i * 4;
    if (rowsZero(inp, s, 4)) zero8(out, o, 4);
    else { invHaar4(inp[s], inp[s + 1], inp[s + 2], inp[s + 3]); for (let k = 0; k < 4; k++) out[o + k] = h[k]; }
  }
};
/** ff_ivi_col_haar4 */
const colHaar4               = (inp, out, o, pitch, flags) => {
  for (let i = 0; i < 4; i++) {
    if (flags[i]) {
      invHaar4(inp[i], inp[i + 4], inp[i + 8], inp[i + 12]);
      for (let k = 0; k < 4; k++) out[o + i + k * pitch] = h[k];
    } else for (let k = 0; k < 4; k++) out[o + i + k * pitch] = 0;
  }
};
/** ff_ivi_dc_haar_2d */
const dcHaar2d              = (dc, out, o, pitch, blk) => {
  const v = dc >> 3;
  for (let y = 0; y < blk; y++, o += pitch) for (let x = 0; x < blk; x++) out[o + x] = v;
};
/** ff_ivi_inverse_slant_8x8 */
const inverseSlant8x8               = (inp, out, o, pitch, flags) => {
  const tmp = tmp64;
  for (let i = 0; i < 8; i++) {
    if (flags[i]) {
      invSlant8(inp[i], inp[i + 8], inp[i + 16], inp[i + 24], inp[i + 32], inp[i + 40], inp[i + 48], inp[i + 56], 0);
      for (let k = 0; k < 8; k++) tmp[i + k * 8] = h[k];
    } else for (let k = 0; k < 8; k++) tmp[i + k * 8] = 0;
  }
  for (let i = 0; i < 8; i++, o += pitch) {
    const s = i * 8;
    if (rowsZero(tmp, s, 8)) zero8(out, o, 8);
    else {
      invSlant8(tmp[s], tmp[s + 1], tmp[s + 2], tmp[s + 3], tmp[s + 4], tmp[s + 5], tmp[s + 6], tmp[s + 7], 1);
      for (let k = 0; k < 8; k++) out[o + k] = h[k];
    }
  }
};
/** ff_ivi_inverse_slant_4x4 */
const inverseSlant4x4               = (inp, out, o, pitch, flags) => {
  const tmp = tmp64;
  for (let i = 0; i < 4; i++) {
    if (flags[i]) {
      invSlant4(inp[i], inp[i + 4], inp[i + 8], inp[i + 12], 0);
      for (let k = 0; k < 4; k++) tmp[i + k * 4] = h[k];
    } else for (let k = 0; k < 4; k++) tmp[i + k * 4] = 0;
  }
  for (let i = 0; i < 4; i++, o += pitch) {
    const s = i * 4;
    if (rowsZero(tmp, s, 4)) zero8(out, o, 4);
    else { invSlant4(tmp[s], tmp[s + 1], tmp[s + 2], tmp[s + 3], 1); for (let k = 0; k < 4; k++) out[o + k] = h[k]; }
  }
};
/** ff_ivi_dc_slant_2d */
const dcSlant2d              = (dc, out, o, pitch, blk) => {
  const v = (dc + 1) >> 1;
  for (let y = 0; y < blk; y++, o += pitch) for (let x = 0; x < blk; x++) out[o + x] = v;
};
/** ff_ivi_row_slant8 */
const rowSlant8               = (inp, out, o, pitch) => {
  for (let i = 0; i < 8; i++, o += pitch) {
    const s = i * 8;
    if (rowsZero(inp, s, 8)) zero8(out, o, 8);
    else {
      invSlant8(inp[s], inp[s + 1], inp[s + 2], inp[s + 3], inp[s + 4], inp[s + 5], inp[s + 6], inp[s + 7], 1);
      for (let k = 0; k < 8; k++) out[o + k] = h[k];
    }
  }
};
/** ff_ivi_dc_row_slant */
const dcRowSlant              = (dc, out, o, pitch, blk) => {
  const v = (dc + 1) >> 1;
  for (let x = 0; x < blk; x++) out[o + x] = v;
  for (let y = 1; y < blk; y++) zero8(out, o + y * pitch, blk);
};
/** ff_ivi_col_slant8 */
const colSlant8               = (inp, out, o, pitch, flags) => {
  for (let i = 0; i < 8; i++) {
    if (flags[i]) {
      invSlant8(inp[i], inp[i + 8], inp[i + 16], inp[i + 24], inp[i + 32], inp[i + 40], inp[i + 48], inp[i + 56], 1);
      for (let k = 0; k < 8; k++) out[o + i + k * pitch] = h[k];
    } else for (let k = 0; k < 8; k++) out[o + i + k * pitch] = 0;
  }
};
/** ff_ivi_dc_col_slant */
const dcColSlant              = (dc, out, o, pitch, blk) => {
  const v = (dc + 1) >> 1;
  for (let y = 0; y < blk; y++, o += pitch) { out[o] = v; for (let x = 1; x < blk; x++) out[o + x] = 0; }
};
/** ff_ivi_row_slant4 */
const rowSlant4               = (inp, out, o, pitch) => {
  for (let i = 0; i < 4; i++, o += pitch) {
    const s = i * 4;
    if (rowsZero(inp, s, 4)) zero8(out, o, 4);
    else { invSlant4(inp[s], inp[s + 1], inp[s + 2], inp[s + 3], 1); for (let k = 0; k < 4; k++) out[o + k] = h[k]; }
  }
};
/** ff_ivi_col_slant4 */
const colSlant4               = (inp, out, o, pitch, flags) => {
  for (let i = 0; i < 4; i++) {
    if (flags[i]) {
      invSlant4(inp[i], inp[i + 4], inp[i + 8], inp[i + 12], 1);
      for (let k = 0; k < 4; k++) out[o + i + k * pitch] = h[k];
    } else for (let k = 0; k < 4; k++) out[o + i + k * pitch] = 0;
  }
};
/** ff_ivi_put_pixels_8x8 */
const putPixels8x8               = (inp, out, o, pitch) => {
  for (let y = 0; y < 8; y++, o += pitch) for (let x = 0; x < 8; x++) out[o + x] = inp[y * 8 + x];
};
/** ff_ivi_put_dc_pixel_8x8 */
const putDcPixel8x8              = (dc, out, o, pitch) => {
  out[o] = dc; zero8(out, o + 1, 7);
  for (let y = 1; y < 8; y++) zero8(out, o + y * pitch, 8);
};

// indeo4.c transforms[18]; null = unsupported (DCT / none), rejected like FFmpeg.
const TRANSFORMS                                                                  = [
  { inv: inverseHaar8x8, dc: dcHaar2d, is2d: 1 },
  { inv: rowHaar8, dc: dcHaar2d, is2d: 0 },
  { inv: colHaar8, dc: dcHaar2d, is2d: 0 },
  { inv: putPixels8x8, dc: putDcPixel8x8, is2d: 1 },
  { inv: inverseSlant8x8, dc: dcSlant2d, is2d: 1 },
  { inv: rowSlant8, dc: dcRowSlant, is2d: 1 },
  { inv: colSlant8, dc: dcColSlant, is2d: 1 },
  null, null, null, // inverse DCT 8x8, 8x1, 1x8
  { inv: inverseHaar4x4, dc: dcHaar2d, is2d: 1 },
  { inv: inverseSlant4x4, dc: dcSlant2d, is2d: 1 },
  null, // no transform 4x4
  { inv: rowHaar4, dc: dcHaar2d, is2d: 0 },
  { inv: colHaar4, dc: dcHaar2d, is2d: 0 },
  { inv: rowSlant4, dc: dcRowSlant, is2d: 0 },
  { inv: colSlant4, dc: dcColSlant, is2d: 0 },
  null, // inverse DCT 4x4
];

// ivi_dsp.c IVI_MC_TEMPLATE: ivi_mc_<size>x<size>_no_delta (put) / _delta (add).
function mcBlock(size        , add         , buf            , bo        , dpitch        ,
  ref            , ro        , pitch        , mcType        )       {
  for (let i = 0; i < size; i++, bo += dpitch, ro += pitch) {
    for (let j = 0; j < size; j++) {
      let v        ;
      switch (mcType) {
        case 0: v = ref[ro + j]; break; // fullpel
        case 1: v = (ref[ro + j] + ref[ro + j + 1]) >> 1; break; // horizontal halfpel
        case 2: v = (ref[ro + j] + ref[ro + pitch + j]) >> 1; break; // vertical halfpel
        case 3: v = (ref[ro + j] + ref[ro + j + 1] + ref[ro + pitch + j] + ref[ro + pitch + j + 1]) >> 2; break;
        default: return; // no case matches: nothing happens
      }
      if (add) buf[bo + j] += v; else buf[bo + j] = v;
    }
  }
}
const mcTmp = new Int16Array(64);
/** IVI_MC_AVG_TEMPLATE: ff_ivi_mc_avg_<size>x<size>_no_delta / _delta */
function mcAvg(size        , add         , buf            , bo        , ref1            , ro1        ,
  ref2            , ro2        , pitch        , mcType        , mcType2        )       {
  const tmp = mcTmp;
  mcBlock(size, false, tmp, 0, size, ref1, ro1, pitch, mcType);
  mcBlock(size, true, tmp, 0, size, ref2, ro2, pitch, mcType2);
  for (let i = 0; i < size; i++, bo += pitch) {
    for (let j = 0; j < size; j++) {
      const v = tmp[i * size + j] >> 1;
      if (add) buf[bo + j] += v; else buf[bo + j] = v;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// ivi.h structures

                                                                                          
                                                                        
                                                                                           
                                                                                             
                
                                                                                 
                                                                                
                                                                                               
                                                                                     
                                                                                                  
                                                                           
                                                                                            
                                                                                                
                                                                                
 
                                                                                  
                                                                                                     
                                                                                 
                                                                                         

const newMb = ()         => ({ xpos: 0, ypos: 0, bufOffs: 0, type: 0, cbp: 0, qDelta: 0, mvX: 0, mvY: 0, bMvX: 0, bMvY: 0 });

function newBand(plane        , bandNum        )       {
  return { plane, bandNum, width: 0, height: 0, aheight: 0, buf: null, refBuf: null, bRefBuf: null,
    bufs: [null, null, null, null], pitch: 0, isEmpty: 0, mbSize: 0, blkSize: 0, isHalfpel: 0,
    inheritMv: 0, inheritQdelta: 0, qdeltaPresent: 0, quantMat: 0, globQuant: 0, scan: null,
    scanSize: 0, blkVlc: newHuffTab(), numCorr: 0, corr: new Uint8Array(122), rvmapSel: 0, rvMap: null,
    numTiles: 0, tiles: [], invTransform: null, transformSize: 0, dcTransform: null, is2dTrans: 0,
    checksum: 0, checksumPresent: 0, bufsize: 0, intraBase: null, interBase: null };
}

const MBS_PER_TILE = (tw        , th        , mb        )         =>
  Math.floor((tw + mb - 1) / mb) * Math.floor((th + mb - 1) / mb);

// ---------------------------------------------------------------------------------------------

export class Indeo4Decoder {
           width        ;          height        ;
           y            ;          u            ;          v            ;

  // IVI45DecContext
          gb = new BitReader(new Uint8Array(8), 0, 0);
          rvmapTabs         ;
          frameNum = 0;         frameType = 0;         prevFrameType = 0;         dataSize = 0;
          isScalable = 0;         picConf            = { picWidth: 0, picHeight: 0, chromaWidth: 0,
    chromaHeight: 0, tileWidth: 0, tileHeight: 0, lumaBands: 0, chromaBands: 0 };
          planes          = [0, 1, 2].map(() => ({ width: 0, height: 0, numBands: 0, bands: [] }));
          dstBuf = 0;         refBuf = 1;         bRefBuf = 3; // buffer 2 is for scalability mode
          mbVlc = newHuffTab();         blkVlc = newHuffTab();
          rvmapSel = 0;         inImf = 0;         inQ = 0;         picGlobQuant = 0;
          unknown1 = 0;         checksum = 0;         hasBFrames = 0;         hasTransp = 0;
          usesTiling = 0;         usesHaar = 0;         usesFullpel = 0;
          bufInvalid = [0, 0, 0, 0];
          pFrame                 = null; // the P frame sent along with an INTRA frame (B-frame mode)
          gotPFrame = 0;

  /** indeo4.c decode_init */
  constructor(width        , height        ) {
    this.width = width; this.height = height;
    const cw = (width + 3) >> 2, ch = (height + 3) >> 2;
    this.y = new Uint8Array(width * height); this.u = new Uint8Array(cw * ch); this.v = new Uint8Array(cw * ch);
    initStaticVlc();
    // copy the rvmap tables so that corrections can be applied to them
    this.rvmapTabs = [];
    for (let i = 0; i < 9; i++) {
      const o = i * 514;
      this.rvmapTabs.push({ eobSym: RVMAP_DATA[o], escSym: RVMAP_DATA[o + 1],
        runtab: Uint8Array.from(RVMAP_DATA.slice(o + 2, o + 258)), valtab: Int8Array.from(RVMAP_DATA.slice(o + 258, o + 514)) });
    }
  }

  /** Decode one AVI video chunk; an empty chunk (or a frame that yields no picture) keeps the
   * previous picture. */
  decode(frame            )       {
    if (!frame.length) return;
    const pic = this.decodeFrame(frame);
    if (pic && pic.y.length === this.y.length && pic.u.length === this.u.length) {
      this.y.set(pic.y); this.u.set(pic.u); this.v.set(pic.v);
    } else if (pic) throw new Error(`Indeo4: picture size differs from ${this.width}x${this.height}`);
  }

  /** yuv410p -> RGBA (w*h*4). TODO(faithful): the colour conversion of Intel's VfW Indeo codec is
   * not decoded; BT.601 + nearest-neighbour chroma assumed. BT.601 limited range (Y 16-235,
   * C 16-240), each chroma sample covering its 4x4 block, alpha 255. */
  toRGBA(out                   )       {
    const w = this.width, hgt = this.height, cw = (w + 3) >> 2;
    for (let yy = 0; yy < hgt; yy++) {
      const crow = (yy >> 2) * cw;
      for (let x = 0; x < w; x++) {
        const c = crow + (x >> 2), Y = 1.164383 * (this.y[yy * w + x] - 16);
        const U = this.u[c] - 128, V = this.v[c] - 128, o = (yy * w + x) * 4;
        out[o] = Y + 1.596027 * V;
        out[o + 1] = Y - 0.391762 * U - 0.812968 * V;
        out[o + 2] = Y + 2.017232 * U;
        out[o + 3] = 255;
      }
    }
  }

  /** ivi.c ff_ivi_decode_frame. Returns the output picture, or null when FFmpeg outputs none. */
          decodeFrame(data            , base = 0, size = data.length - base)                 {
    if (base === 0) { // FFmpeg packets carry zero padding
      const padded = new Uint8Array(data.length + 8); padded.set(data); data = padded;
    }
    this.gb = new BitReader(data, base, size);
    const gb = this.gb;
    this.decodePicHdr();

    if (this.frameType === FT_NULL_LAST) {
      if (this.gotPFrame) { this.gotPFrame = 0; const p = this.pFrame; this.pFrame = null; return p; }
      return null;
    }
    if (!this.planes[0].bands.length) throw new Error('Indeo4: color planes not initialized yet');

    this.switchBuffers();

    const nonNull = this.frameType < FT_NULL_FIRST; // indeo4.c is_nonnull_frame
    if (nonNull) {
      this.bufInvalid[this.dstBuf] = 1;
      for (let p = 0; p < 3; p++)
        for (let b = 0; b < this.planes[p].numBands; b++) this.decodeBand(this.planes[p].bands[b]);
      this.bufInvalid[this.dstBuf] = 0;
    } else {
      if (this.isScalable) throw new Error('Indeo4: null frame in scalability mode');
      for (let p = 0; p < 3; p++) if (!this.planes[p].bands[0].buf) throw new Error('Indeo4: null frame before any picture');
    }
    if (this.bufInvalid[this.dstBuf]) throw new Error('Indeo4: invalid buffer');
    if (!nonNull) return null;

    const pl = this.planes;
    const pic          = { y: new Uint8Array(pl[0].width * pl[0].height),
      u: new Uint8Array(pl[1].width * pl[1].height), v: new Uint8Array(pl[1].width * pl[1].height) };
    if (this.isScalable) recomposeHaar(pl[0], pic.y);
    else outputPlane(pl[0], pic.y);
    outputPlane(pl[2], pic.u); // FFmpeg: frame->data[1] (U) <- plane 2, data[2] (V) <- plane 1
    outputPlane(pl[1], pic.v);

    // B-frame mode: the next I and the following P frame are sent together.
    if (this.frameType === FT_INTRA) {
      while (gb.get(8)) if (gb.left() < 8) throw new Error('Indeo4: unterminated version string');
      const left = gb.idx & 0x18;
      gb.skip(64 - left);
      if (gb.left() > 18 && gb.show(21) === 0xbfff8) { // syncheader + inter type
        const sub = base + (gb.idx >> 3), subSize = gb.left() >> 3;
        this.gotPFrame = 0; this.pFrame = null;
        try { // FFmpeg ignores this call's result
          const p = this.decodeFrame(data, sub, subSize);
          if (p) { this.pFrame = p; this.gotPFrame = 1; }
        } catch { /* ignored, as in FFmpeg */ }
      }
    }
    return pic;
  }

  /** indeo4.c decode_pic_hdr */
          decodePicHdr()       {
    const gb = this.gb;
    if (gb.get(18) !== 0x3fff8) throw new Error('Indeo4: invalid picture start code');
    this.prevFrameType = this.frameType;
    this.frameType = gb.get(3);
    if (this.frameType === 7) throw new Error('Indeo4: invalid frame type 7');
    if (this.frameType === FT_BIDIR) this.hasBFrames = 1;
    this.hasTransp = gb.get1();
    if (gb.get1()) throw new Error('Indeo4: sync bit is set'); // Mac decoder ignores it, XANIM errors
    this.dataSize = gb.get1() ? gb.get(24) : 0;
    if (this.frameType >= FT_NULL_FIRST) return; // null frames contain nothing else

    if (gb.get1()) gb.skip(32); // key lock: ignore the lock word (password-protected clip)

    const pc            = { picWidth: 0, picHeight: 0, chromaWidth: 0, chromaHeight: 0,
      tileWidth: 0, tileHeight: 0, lumaBands: 0, chromaBands: 0 };
    const sizeIdx = gb.get(3);
    if (sizeIdx === IVI4_PIC_SIZE_ESC) { pc.picHeight = gb.get(16); pc.picWidth = gb.get(16); }
    else { pc.picHeight = IVI4_COMMON_PIC_SIZES[sizeIdx * 2 + 1]; pc.picWidth = IVI4_COMMON_PIC_SIZES[sizeIdx * 2]; }

    // tile dimensions (indeo4.c scale_tile_size)
    const scaleTile = (def        , f        )         => (f === 15 ? def : (f + 1) << 5);
    this.usesTiling = gb.get1();
    if (this.usesTiling) {
      pc.tileHeight = scaleTile(pc.picHeight, gb.get(4));
      pc.tileWidth = scaleTile(pc.picWidth, gb.get(4));
    } else { pc.tileHeight = pc.picHeight; pc.tileWidth = pc.picWidth; }

    if (gb.get(2)) throw new Error('Indeo4: only the YVU9 picture format is supported');
    pc.chromaHeight = (pc.picHeight + 3) >> 2;
    pc.chromaWidth = (pc.picWidth + 3) >> 2;

    pc.lumaBands = decodePlaneSubdivision(gb);
    if (pc.lumaBands) pc.chromaBands = decodePlaneSubdivision(gb);
    if (!pc.picWidth || !pc.picHeight) throw new Error(`Indeo4: picture dimensions ${pc.picWidth}x${pc.picHeight} cannot be decoded`);

    this.isScalable = pc.lumaBands !== 1 || pc.chromaBands !== 1 ? 1 : 0;
    if (this.isScalable && (pc.lumaBands !== 4 || pc.chromaBands !== 1))
      throw new Error(`Indeo4: unsupported subdivision (luma bands ${pc.lumaBands}, chroma bands ${pc.chromaBands})`);

    // picture layout changed: reallocate (ivi_pic_config_cmp)
    const c = this.picConf;
    if (c.picWidth !== pc.picWidth || c.picHeight !== pc.picHeight || c.chromaWidth !== pc.chromaWidth ||
      c.chromaHeight !== pc.chromaHeight || c.tileWidth !== pc.tileWidth || c.tileHeight !== pc.tileHeight ||
      c.lumaBands !== pc.lumaBands || c.chromaBands !== pc.chromaBands) {
      this.initPlanes(pc);
      this.picConf = pc;
      // default macroblock/block dimensions
      for (let p = 0; p <= 2; p++)
        for (let i = 0; i < (!p ? pc.lumaBands : pc.chromaBands); i++) {
          this.planes[p].bands[i].mbSize = !p ? (!this.isScalable ? 16 : 8) : 4;
          this.planes[p].bands[i].blkSize = !p ? 8 : 4;
        }
      this.initTiles(pc.tileWidth, pc.tileHeight);
    }

    this.frameNum = gb.get1() ? gb.get(20) : 0;
    if (gb.get1()) gb.skip(8); // decTimeEst

    // macroblock and block Huffman codebooks
    decHuffDesc(gb, gb.get1(), 0, this.mbVlc);
    decHuffDesc(gb, gb.get1(), 1, this.blkVlc);

    this.rvmapSel = gb.get1() ? gb.get(3) : 8;
    this.inImf = gb.get1();
    this.inQ = gb.get1();
    this.picGlobQuant = gb.get(5);
    this.unknown1 = gb.get1() ? gb.get(3) : 0;
    this.checksum = gb.get1() ? gb.get(16) : 0;
    while (gb.get1()) { // picture header extension
      if (gb.left() < 10) throw new Error('Indeo4: truncated picture header extension');
      gb.skip(8);
    }
    gb.get1(); // "bad blocks" bit: FFmpeg only logs it
    gb.align();
  }

  /** ivi.c ff_ivi_init_planes (Indeo 4) */
          initPlanes(cfg           )       {
    if (cfg.lumaBands < 1 || cfg.chromaBands < 1) throw new Error('Indeo4: invalid band configuration');
    const pl = this.planes;
    pl[0].width = cfg.picWidth; pl[0].height = cfg.picHeight; pl[0].numBands = cfg.lumaBands;
    pl[1].width = pl[2].width = (cfg.picWidth + 3) >> 2;
    pl[1].height = pl[2].height = (cfg.picHeight + 3) >> 2;
    pl[1].numBands = pl[2].numBands = cfg.chromaBands;
    for (let p = 0; p < 3; p++) {
      const plane = pl[p];
      // one band: full size; several bands: half size each
      const bw = plane.numBands === 1 ? plane.width : (plane.width + 1) >> 1;
      const bh = plane.numBands === 1 ? plane.height : (plane.height + 1) >> 1;
      const align = p ? 8 : 16; // luma bands aligned on 16x16, chroma on 8x8 (max macroblock size)
      const wa = Math.ceil(bw / align) * align, ha = Math.ceil(bh / align) * align;
      plane.bands = [];
      for (let b = 0; b < plane.numBands; b++) {
        const band = newBand(p, b);
        band.width = bw; band.height = bh; band.pitch = wa; band.aheight = ha; band.bufsize = wa * ha;
        plane.bands.push(band);
      }
    }
  }

  /** ivi.c ff_ivi_init_tiles + ivi_init_tiles */
          initTiles(tileWidth        , tileHeight        )       {
    const pl = this.planes;
    for (let p = 0; p < 3; p++) {
      let tw = !p ? tileWidth : (tileWidth + 3) >> 2, th = !p ? tileHeight : (tileHeight + 3) >> 2;
      if (!p && pl[0].numBands === 4) {
        if (tw % 2 || th % 2) throw new Error('Indeo4: odd tiles are not supported');
        tw >>= 1; th >>= 1;
      }
      if (tw <= 0 || th <= 0) throw new Error('Indeo4: invalid tile size');
      for (let b = 0; b < pl[p].numBands; b++) {
        const band = pl[p].bands[b];
        band.numTiles = Math.ceil(band.width / tw) * Math.ceil(band.height / th);
        band.tiles = [];
        // the first luma band is the reference for motion vectors and quant
        const refTiles = p || b ? pl[0].bands[0].tiles : null;
        let ri = 0;
        for (let y = 0; y < band.height; y += th) {
          for (let x = 0; x < band.width; x += tw) {
            const width = Math.min(band.width - x, tw), height = Math.min(band.height - y, th);
            const numMBs = MBS_PER_TILE(width, height, band.mbSize);
            const tile       = { xpos: x, ypos: y, mbSize: band.mbSize, width, height, isEmpty: 0, dataSize: 0,
              numMBs, mbs: Array.from({ length: numMBs }, newMb), refMbs: null };
            if (refTiles) {
              const rt = refTiles[ri++];
              if (tile.numMBs !== rt.numMBs) throw new Error('Indeo4: ref_tile mismatch');
              tile.refMbs = rt.mbs;
            }
            band.tiles.push(tile);
          }
        }
      }
    }
  }

  /** indeo4.c switch_buffers */
          switchBuffers()       {
    const isRef = (t        )          => t === FT_INTRA || t === FT_INTRA1 || t === FT_INTER;
    const prevRef = isRef(this.prevFrameType), ref = isRef(this.frameType);
    if (prevRef && ref) { const t = this.dstBuf; this.dstBuf = this.refBuf; this.refBuf = t; }
    else if (prevRef) {
      let t = this.refBuf; this.refBuf = this.bRefBuf; this.bRefBuf = t;
      t = this.dstBuf; this.dstBuf = this.refBuf; this.refBuf = t;
    }
  }

  /** ivi.c prepare_buf */
          prepareBuf(band      , i        )                    {
    if (this.picConf.lumaBands <= 1 && i === 2) return null;
    if (!band.bufs[i]) band.bufs[i] = new Int16Array(band.bufsize);
    return band.bufs[i];
  }

  /** ivi.c decode_band */
          decodeBand(band      )       {
    const gb = this.gb;
    band.buf = this.prepareBuf(band, this.dstBuf);
    if (!band.buf) throw new Error('Indeo4: band buffer points to no data');
    if (this.frameType === FT_BIDIR) {
      band.refBuf = this.prepareBuf(band, this.bRefBuf);
      band.bRefBuf = this.prepareBuf(band, this.refBuf);
      if (!band.bRefBuf) throw new Error('Indeo4: no backward reference buffer');
    } else {
      band.refBuf = this.prepareBuf(band, this.refBuf);
      band.bRefBuf = null;
    }
    if (!band.refBuf) throw new Error('Indeo4: no reference buffer');

    this.decodeBandHdr(band);
    if (band.isEmpty) throw new Error('Indeo4: empty band encountered');

    const rv = band.rvMap = this.rvmapTabs[band.rvmapSel];
    // apply corrections to the selected rvmap table (and undo them afterwards, in reverse order)
    const corr = (i        )       => {
      const i1 = band.corr[i * 2], i2 = band.corr[i * 2 + 1];
      let t = rv.runtab[i1]; rv.runtab[i1] = rv.runtab[i2]; rv.runtab[i2] = t;
      t = rv.valtab[i1]; rv.valtab[i1] = rv.valtab[i2]; rv.valtab[i2] = t;
      if (i1 === rv.eobSym || i2 === rv.eobSym) rv.eobSym ^= i1 ^ i2;
      if (i1 === rv.escSym || i2 === rv.escSym) rv.escSym ^= i1 ^ i2;
    };
    for (let i = 0; i < band.numCorr; i++) corr(i);

    try {
      let pos = gb.idx;
      const mb0 = this.planes[0].bands[0].mbSize;
      for (let t = 0; t < band.numTiles; t++) {
        const tile = band.tiles[t];
        if (tile.mbSize !== band.mbSize || mb0 < band.mbSize)
          throw new Error(`Indeo4: MB sizes mismatch: ${band.mbSize} vs. ${tile.mbSize} vs. ${mb0}`);
        tile.isEmpty = gb.get1();
        if (tile.isEmpty) {
          processEmptyTile(band, tile, (mb0 >> 3) - (band.mbSize >> 3));
        } else {
          tile.dataSize = decTileDataSize(gb);
          if (!tile.dataSize) throw new Error('Indeo4: tile data size is zero');
          this.decodeMbInfo(band, tile);
          decodeBlocks(gb, band, tile);
          if ((gb.idx - pos) >> 3 !== tile.dataSize) throw new Error('Indeo4: tile data_size mismatch');
          pos += tile.dataSize << 3; // skip to the next tile
        }
      }
    } finally {
      for (let i = band.numCorr - 1; i >= 0; i--) corr(i);
    }
    gb.align();
  }

  /** indeo4.c decode_band_hdr */
          decodeBandHdr(band      )       {
    const gb = this.gb;
    const plane = gb.get(2), bandNum = gb.get(4);
    if (band.plane !== plane || band.bandNum !== bandNum) throw new Error('Indeo4: invalid band header sequence');

    band.isEmpty = gb.get1();
    if (!band.isEmpty) {
      const oldBlkSize = band.blkSize;
      if (gb.get1()) gb.skip(16); // header size (if absent: 4 bytes)
      band.isHalfpel = gb.get(2);
      if (band.isHalfpel >= 2) throw new Error(`Indeo4: invalid/unsupported mv resolution ${band.isHalfpel}`);
      if (!band.isHalfpel) this.usesFullpel = 1;
      band.checksumPresent = gb.get1();
      if (band.checksumPresent) band.checksum = gb.get(16);

      const indx = gb.get(2);
      if (indx === 3) throw new Error('Indeo4: invalid block size');
      band.mbSize = 16 >> indx;
      band.blkSize = 8 >> (indx >> 1);
      band.inheritMv = gb.get1();
      band.inheritQdelta = gb.get1();
      band.globQuant = gb.get(5);

      if (!gb.get1() || this.frameType === FT_INTRA) {
        const tid = gb.get(5);
        const tr = tid < TRANSFORMS.length ? TRANSFORMS[tid] : null;
        if (!tr) throw new Error(`Indeo4: unsupported transform ${tid}${(tid >= 7 && tid <= 9) || tid === 17 ? ' (DCT)' : ''}`);
        if (tid < 10 && band.blkSize < 8) throw new Error('Indeo4: wrong transform size');
        if ((tid >= 0 && tid <= 2) || tid === 10) this.usesHaar = 1;
        band.invTransform = tr.inv; band.dcTransform = tr.dc; band.is2dTrans = tr.is2d;
        band.transformSize = tid < 10 ? 8 : 4;
        if (band.blkSize !== band.transformSize)
          throw new Error(`Indeo4: transform and block size mismatch (${band.transformSize} != ${band.blkSize})`);

        const scanIndx = gb.get(4);
        if (scanIndx === 15) throw new Error('Indeo4: custom scan pattern encountered');
        if (scanIndx > 4 && scanIndx < 10) { if (band.blkSize !== 4) throw new Error('Indeo4: mismatching scan table'); }
        else if (band.blkSize !== 8) throw new Error('Indeo4: mismatching scan table');
        band.scan = SCAN_INDEX_TO_TAB[scanIndx];
        band.scanSize = band.blkSize;

        const quantMat = gb.get(5);
        if (quantMat === 31) throw new Error('Indeo4: custom quant matrix encountered');
        if (quantMat >= QUANT_INDEX_TO_TAB.length) throw new Error(`Indeo4: unsupported quantization matrix ${quantMat}`);
        band.quantMat = quantMat;
      } else if (oldBlkSize !== band.blkSize) {
        throw new Error('Indeo4: the band block size does not match the configuration inherited');
      }
      if (QUANT_INDEX_TO_TAB[band.quantMat] > 4 && band.blkSize === 4) {
        band.quantMat = 0;
        throw new Error('Indeo4: invalid quant matrix for 4x4 block');
      }
      if (band.scanSize !== band.blkSize) throw new Error('Indeo4: mismatching scan table');
      if (band.transformSize === 8 && band.blkSize < 8) throw new Error('Indeo4: mismatching transform_size');

      // block Huffman codebook
      if (!gb.get1()) band.blkVlc.tab = this.blkVlc.tab;
      else decHuffDesc(gb, 1, 1, band.blkVlc);

      band.rvmapSel = gb.get1() ? gb.get(3) : 8;

      band.numCorr = 0; // rvmap probability corrections
      if (gb.get1()) {
        band.numCorr = gb.get(8);
        if (band.numCorr > 61) throw new Error(`Indeo4: too many corrections: ${band.numCorr}`);
        for (let i = 0; i < band.numCorr * 2; i++) band.corr[i] = gb.get(8);
      }
    }

    const q = QUANT_INDEX_TO_TAB[band.quantMat];
    if (band.blkSize === 8) {
      band.intraBase = IVI4_QUANT_8X8_INTRA.subarray(q * 64, q * 64 + 64);
      band.interBase = IVI4_QUANT_8X8_INTER.subarray(q * 64, q * 64 + 64);
    } else {
      band.intraBase = IVI4_QUANT_4X4_INTRA.subarray(q * 16, q * 16 + 16);
      band.interBase = IVI4_QUANT_4X4_INTER.subarray(q * 16, q * 16 + 16);
    }
    // Indeo 4 doesn't use scale tables
    gb.align();
    if (!band.scan) throw new Error('Indeo4: band->scan not set');
  }

  /** indeo4.c decode_mb_info */
          decodeMbInfo(band      , tile      )       {
    const gb = this.gb, mbVlc = this.mbVlc.tab ;
    const rowOffset = band.mbSize * band.pitch;
    let offs = tile.ypos * band.pitch + tile.xpos;
    const blksPerMb = band.mbSize !== band.blkSize ? 4 : 1;
    const mbTypeBits = this.frameType === FT_BIDIR ? 2 : 1;
    const mvScale = (this.planes[0].bands[0].mbSize >> 3) - (band.mbSize >> 3); // mv scale factor
    let mvX = 0, mvY = 0;
    if (MBS_PER_TILE(tile.width, tile.height, band.mbSize) !== tile.numMBs)
      throw new Error(`Indeo4: num_MBs mismatch ${tile.width} ${tile.height} ${band.mbSize} ${tile.numMBs}`);

    let mi = 0;
    const refMbs = tile.refMbs;
    for (let y = tile.ypos; y < tile.ypos + tile.height; y += band.mbSize) {
      let mbOffset = offs;
      for (let x = tile.xpos; x < tile.xpos + tile.width; x += band.mbSize) {
        const mb = tile.mbs[mi], refMb = refMbs ? refMbs[mi] : null;
        mb.xpos = x; mb.ypos = y; mb.bufOffs = mbOffset; mb.bMvX = mb.bMvY = 0;
        if (gb.left() < 1) throw new Error('Indeo4: insufficient input for mb info');

        if (gb.get1()) {
          if (this.frameType === FT_INTRA) throw new Error('Indeo4: empty macroblock in an INTRA picture');
          mb.type = 1; // empty macroblocks are always INTER
          mb.cbp = 0;  // all blocks are empty
          mb.qDelta = 0;
          if (!band.plane && !band.bandNum && this.inQ) {
            mb.qDelta = s8(gb.vlc(mbVlc));
            mb.qDelta = s8(toSigned(mb.qDelta));
          }
          mb.mvX = mb.mvY = 0; // no motion vector coded
          if (band.inheritMv && refMb) { // motion vector inheritance
            if (mvScale) { mb.mvX = s8(scaleMv(refMb.mvX, mvScale)); mb.mvY = s8(scaleMv(refMb.mvY, mvScale)); }
            else { mb.mvX = refMb.mvX; mb.mvY = refMb.mvY; }
          }
        } else {
          if (band.inheritMv) { // copy mb_type from the reference mb
            if (!refMb) throw new Error('Indeo4: ref_mb unavailable');
            mb.type = refMb.type;
          } else if (this.frameType === FT_INTRA || this.frameType === FT_INTRA1) {
            mb.type = 0; // always INTRA in intra frames
          } else {
            mb.type = gb.get(mbTypeBits);
          }
          mb.cbp = gb.get(blksPerMb);
          mb.qDelta = 0;
          if (band.inheritQdelta) {
            if (refMb) mb.qDelta = refMb.qDelta;
          } else if (mb.cbp || (!band.plane && !band.bandNum && this.inQ)) {
            mb.qDelta = s8(gb.vlc(mbVlc));
            mb.qDelta = s8(toSigned(mb.qDelta));
          }

          if (!mb.type) {
            mb.mvX = mb.mvY = 0; // no motion vector in intra macroblocks
          } else {
            if (band.inheritMv) {
              if (refMb) {
                if (mvScale) { mb.mvX = s8(scaleMv(refMb.mvX, mvScale)); mb.mvY = s8(scaleMv(refMb.mvY, mvScale)); }
                else { mb.mvX = refMb.mvX; mb.mvY = refMb.mvY; }
              }
            } else { // motion vector deltas
              mvY += toSigned(gb.vlc(mbVlc));
              mvX += toSigned(gb.vlc(mbVlc));
              mb.mvX = s8(mvX); mb.mvY = s8(mvY);
              if (mb.type === 3) {
                mvY += toSigned(gb.vlc(mbVlc));
                mvX += toSigned(gb.vlc(mbVlc));
                mb.bMvX = s8(-mvX); mb.bMvY = s8(-mvY);
              }
            }
            if (mb.type === 2) {
              mb.bMvX = s8(-mb.mvX); mb.bMvY = s8(-mb.mvY);
              mb.mvX = 0; mb.mvY = 0;
            }
          }
        }

        const s = band.isHalfpel;
        if (mb.type) {
          if (x + (mb.mvX >> s) + (y + (mb.mvY >> s)) * band.pitch < 0 ||
            x + ((mb.mvX + s) >> s) + band.mbSize - 1 + (y + band.mbSize - 1 + ((mb.mvY + s) >> s)) * band.pitch > band.bufsize - 1)
            throw new Error(`Indeo4: motion vector ${x * s + mb.mvX} ${y * s + mb.mvY} outside reference`);
        }
        mi++;
        mbOffset += band.mbSize;
      }
      offs += rowOffset;
    }
    gb.align();
  }
}

/** indeo4.c decode_plane_subdivision: 1 band (code 3) or 4 bands (2,3,3,3,3); 0 = unsupported. */
function decodePlaneSubdivision(gb           )         {
  switch (gb.get(2)) {
    case 3: return 1;
    case 2:
      for (let i = 0; i < 4; i++) if (gb.get(2) !== 3) return 0;
      return 4;
    default: return 0;
  }
}

/** ivi.c ivi_dec_tile_data_size */
function decTileDataSize(gb           )         {
  let len = 0;
  if (gb.get1()) {
    len = gb.get(8);
    if (len === 255) len = gb.get(24);
  }
  gb.align();
  return len;
}

/** ivi.c ivi_mc */
function iviMc(band      , delta         , offs        , mvX        , mvY        , mvX2        , mvY2        ,
  mcType        , mcType2        )       {
  const size = band.blkSize, pitch = band.pitch;
  const refOffs = offs + mvY * pitch + mvX;
  const bufSize = pitch * band.aheight;
  const minSize = pitch * (size - 1) + size;
  const refSize = (mcType > 1 ? 1 : 0) * pitch + (mcType & 1);
  if (mcType !== -1) {
    if (!(offs >= 0 && refOffs >= 0 && band.refBuf) || !(bufSize - minSize >= offs) || !(bufSize - minSize - refSize >= refOffs))
      throw new Error('Indeo4: motion compensation outside the buffer');
  }
  if (mcType2 === -1) {
    mcBlock(size, delta, band.buf , offs, pitch, band.refBuf , refOffs, pitch, mcType);
  } else {
    const refOffs2 = offs + mvY2 * pitch + mvX2;
    const refSize2 = (mcType2 > 1 ? 1 : 0) * pitch + (mcType2 & 1);
    if (offs < 0 || refOffs2 < 0 || !band.bRefBuf) throw new Error('Indeo4: invalid backward motion vector');
    if (bufSize - minSize - refSize2 < refOffs2) throw new Error('Indeo4: invalid backward motion vector');
    if (mcType === -1) mcBlock(size, delta, band.buf , offs, pitch, band.bRefBuf, refOffs2, pitch, mcType2);
    else mcAvg(size, delta, band.buf , offs, band.refBuf , refOffs, band.bRefBuf, refOffs2, pitch, mcType, mcType2);
  }
}

const trvec = new Int32Array(64);
const colFlags = new Uint8Array(8);
const prevDc = new Int32Array(1); // int32_t prev_dc of ivi_decode_blocks

/** ivi.c ivi_decode_coded_blocks */
function decodeCodedBlocks(gb           , band      , mvX        , mvY        , mvX2        , mvY2        ,
  isIntra         , mcType        , mcType2        , quant        , offs        )       {
  const baseTab = isIntra ? band.intraBase  : band.interBase ;
  const rvmap = band.rvMap , vlc = band.blkVlc.tab , scan = band.scan ;
  const blkSize = band.blkSize, numCoeffs = blkSize * blkSize, colMask = blkSize - 1;
  let scanPos = -1, sym = 0;
  const minSize = band.pitch * (band.transformSize - 1) + band.transformSize;
  const bufSize = band.pitch * band.aheight - offs;
  if (minSize > bufSize) throw new Error('Indeo4: block outside the buffer');

  trvec.fill(0, 0, numCoeffs);
  colFlags.fill(0);
  while (scanPos <= numCoeffs) {
    sym = gb.vlc(vlc) >>> 0; // uint32_t sym
    if (sym === rvmap.eobSym) break; // end of block
    let run        , val        ;
    if (sym === rvmap.escSym) { // escape: run/val coded explicitly with 3 vlc codes
      run = (gb.vlc(vlc) + 1) | 0;
      const lo = gb.vlc(vlc) >>> 0, hi = gb.vlc(vlc) >>> 0;
      val = toSigned(((hi << 6) | lo) | 0);
    } else {
      if (sym >= 256) throw new Error(`Indeo4: invalid sym encountered: ${sym}`);
      run = rvmap.runtab[sym];
      val = rvmap.valtab[sym];
    }
    // de-zigzag and dequantize
    scanPos += run;
    if (scanPos >= numCoeffs || scanPos < 0) break;
    const pos = scan[scanPos];
    const q = (baseTab[pos] * quant) >>> 9;
    if (q > 1) val = (val * q + (val > 0 ? 1 : -1) * (((q ^ 1) - 1) >> 1)) | 0;
    trvec[pos] = val;
    colFlags[pos & colMask] |= val ? 1 : 0; // columns containing non-zero coeffs
  }
  if (scanPos < 0 || (scanPos >= numCoeffs && sym !== rvmap.eobSym)) throw new Error('Indeo4: corrupt block data');

  // undo DC coefficient prediction for intra blocks
  if (isIntra && band.is2dTrans) {
    prevDc[0] += trvec[0];
    trvec[0] = prevDc[0];
    colFlags[0] |= prevDc[0] ? 1 : 0;
  }
  if (band.transformSize > band.blkSize) throw new Error('Indeo4: too large transform');
  band.invTransform (trvec, band.buf , offs, band.pitch, colFlags);
  if (!isIntra) iviMc(band, true, offs, mvX, mvY, mvX2, mvY2, mcType, mcType2);
}

/** ivi.c ivi_decode_blocks */
function decodeBlocks(gb           , band      , tile      )       {
  let mcType = 0, mcType2 = -1, mvX = 0, mvY = 0, mvX2 = 0, mvY2 = 0;
  prevDc[0] = 0; // intra prediction of the DC coefficient
  const blkSize = band.blkSize, pitch = band.pitch;
  const numBlocks = band.mbSize !== blkSize ? 4 : 1;

  for (let mbn = 0; mbn < tile.numMBs; mbn++) {
    const mb = tile.mbs[mbn];
    const isIntra = !mb.type;
    let cbp = mb.cbp, bufOffs = mb.bufOffs;
    let quant = band.globQuant + mb.qDelta;
    quant = quant < 0 ? 0 : quant > 31 ? 31 : quant; // av_clip_uintp2(quant, 5)

    if (!isIntra) {
      mvX = mb.mvX; mvY = mb.mvY; mvX2 = mb.bMvX; mvY2 = mb.bMvY;
      if (band.isHalfpel) {
        mcType = ((mvY & 1) << 1) | (mvX & 1);
        mcType2 = ((mvY2 & 1) << 1) | (mvX2 & 1);
        mvX >>= 1; mvY >>= 1; mvX2 >>= 1; mvY2 >>= 1; // halfpel -> fullpel vectors
      }
      if (mb.type === 2) mcType = -1;
      if (mb.type !== 2 && mb.type !== 3) mcType2 = -1;
      const check = (vx        , vy        )       => {
        const dx = vx >> band.isHalfpel, dy = vy >> band.isHalfpel;
        const cx = vx & band.isHalfpel, cy = vy & band.isHalfpel;
        if (mb.xpos + dx < 0 || mb.xpos + dx + band.mbSize + cx > pitch ||
          mb.ypos + dy < 0 || mb.ypos + dy + band.mbSize + cy > band.aheight)
          throw new Error('Indeo4: motion vector out of bounds');
      };
      if (mb.type) check(mb.mvX, mb.mvY);
      if (mb.type === 2 || mb.type === 3) check(mb.bMvX, mb.bMvY);
    }

    for (let blk = 0; blk < numBlocks; blk++) {
      // block position in the buffer by its number
      if (blk & 1) bufOffs += blkSize;
      else if (blk === 2) { bufOffs -= blkSize; bufOffs += blkSize * pitch; }

      if (cbp & 1) { // block coded
        decodeCodedBlocks(gb, band, mvX, mvY, mvX2, mvY2, isIntra, mcType, mcType2, quant, bufOffs);
      } else {
        const bufSize = pitch * band.aheight - bufOffs, minSize = (blkSize - 1) * pitch + blkSize;
        if (minSize > bufSize) throw new Error('Indeo4: block outside the buffer');
        // not coded: intra -> dc transform; inter -> motion compensation without delta
        if (isIntra) band.dcTransform (prevDc[0], band.buf , bufOffs, pitch, blkSize); // ivi_dc_transform
        else iviMc(band, false, bufOffs, mvX, mvY, mvX2, mvY2, mcType, mcType2);
      }
      cbp >>= 1;
    }
  }
  gb.align();
}

/** ivi.c ivi_process_empty_tile */
function processEmptyTile(band      , tile      , mvScale        )       {
  const clearFirst = !band.qdeltaPresent && !band.plane && !band.bandNum;
  const mbSize = band.mbSize, xend = tile.xpos + tile.width, isHalfpel = band.isHalfpel, pitch = band.pitch;
  if (tile.numMBs !== MBS_PER_TILE(tile.width, tile.height, mbSize)) throw new Error('Indeo4: allocated tile size mismatch');

  let offs = tile.ypos * pitch + tile.xpos, mi = 0, needMc = false;
  const rowOffset = mbSize * pitch, refMbs = tile.refMbs;
  for (let y = tile.ypos; y < tile.ypos + tile.height; y += mbSize) {
    let mbOffset = offs;
    for (let x = tile.xpos; x < xend; x += mbSize) {
      const mb = tile.mbs[mi];
      mb.xpos = x; mb.ypos = y; mb.bufOffs = mbOffset;
      mb.type = 1; // INTER
      mb.cbp = 0;  // all blocks empty
      if (clearFirst) { mb.qDelta = s8(band.globQuant); mb.mvX = 0; mb.mvY = 0; }
      if (refMbs) {
        const refMb = refMbs[mi];
        if (band.inheritQdelta) mb.qDelta = refMb.qDelta;
        if (band.inheritMv) { // motion vector inheritance
          if (mvScale) { mb.mvX = s8(scaleMv(refMb.mvX, mvScale)); mb.mvY = s8(scaleMv(refMb.mvY, mvScale)); }
          else { mb.mvX = refMb.mvX; mb.mvY = refMb.mvY; }
          needMc ||= mb.mvX !== 0 || mb.mvY !== 0;
          const dx = mb.mvX >> isHalfpel, dy = mb.mvY >> isHalfpel, cx = mb.mvX & isHalfpel, cy = mb.mvY & isHalfpel;
          if (mb.xpos + dx < 0 || mb.xpos + dx + mbSize + cx > pitch || mb.ypos + dy < 0 || mb.ypos + dy + mbSize + cy > band.aheight)
            throw new Error('Indeo4: MV out of bounds');
        }
      }
      mi++;
      mbOffset += mbSize;
    }
    offs += rowOffset;
  }

  if (band.inheritMv && needMc) { // motion compensation (some motion vector is non-zero)
    const numBlocks = mbSize !== band.blkSize ? 4 : 1;
    for (let mbn = 0; mbn < tile.numMBs; mbn++) {
      const mb = tile.mbs[mbn];
      let mvX = mb.mvX, mvY = mb.mvY, mcType = 0;
      if (band.isHalfpel) { mcType = ((mvY & 1) << 1) | (mvX & 1); mvX >>= 1; mvY >>= 1; }
      for (let blk = 0; blk < numBlocks; blk++) {
        const o = mb.bufOffs + band.blkSize * ((blk & 1) + (blk & 2 ? 1 : 0) * pitch);
        iviMc(band, false, o, mvX, mvY, 0, 0, mcType, -1);
      }
    }
  } else { // copy the reference tile into the current one
    const src = band.refBuf , dst = band.buf ;
    for (let y = 0; y < tile.height; y++) {
      const o = (tile.ypos + y) * pitch + tile.xpos;
      dst.set(src.subarray(o, o + tile.width), o);
    }
  }
}

/** ivi.c ivi_output_plane: add the bias of 128 back and clip. */
function outputPlane(plane       , dst            )       {
  const src = plane.bands[0].buf;
  if (!src) return;
  const pitch = plane.bands[0].pitch, w = plane.width;
  for (let y = 0; y < plane.height; y++) for (let x = 0; x < w; x++) dst[y * w + x] = clipU8(src[y * pitch + x] + 128);
}

/** ivi_dsp.c ff_ivi_recompose_haar (4 luma bands -> plane) */
function recomposeHaar(plane       , dst            )       {
  const pitch = plane.bands[0].pitch, w = plane.width, hgt = plane.height;
  const b0 = plane.bands[0].buf , b1 = plane.bands[1].buf , b2 = plane.bands[2].buf , b3 = plane.bands[3].buf ;
  // FFmpeg's frame buffer has padding; pixels beyond width/height are dropped here.
  const put = (x        , y        , v        )       => { if (x < w && y < hgt) dst[y * w + x] = clipU8(v + 128); };
  for (let y = 0, row = 0; y < hgt; y += 2, row += pitch) {
    for (let x = 0, i = row; x < w; x += 2, i++) {
      const c0 = b0[i], c1 = b1[i], c2 = b2[i], c3 = b3[i];
      put(x, y, (c0 + c1 + c2 + c3 + 2) >> 2);
      put(x + 1, y, (c0 + c1 - c2 - c3 + 2) >> 2);
      put(x, y + 1, (c0 - c1 + c2 - c3 + 2) >> 2);
      put(x + 1, y + 1, (c0 - c1 - c2 + c3 + 2) >> 2);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Tables: ivi.c (Huffman descriptors, scans, rvmap), indeo4data.h, mathtables.c ff_zigzag_direct.

// ivi.c ivi_mb_huff_desc[8] / ivi_blk_huff_desc[8] (xbits per row)
const IVI_MB_HUFF_DESC = [
  [0, 4, 5, 4, 4, 4, 6, 6], [0, 2, 2, 3, 3, 3, 3, 5, 3, 2, 2, 2], [0, 2, 3, 4, 3, 3, 3, 3, 4, 3, 2, 2],
  [0, 3, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2], [0, 4, 4, 3, 3, 3, 3, 2, 3, 3, 2, 1, 1], [0, 4, 4, 4, 4, 3, 3, 3, 2],
  [0, 4, 4, 4, 4, 3, 3, 2, 2, 2], [0, 4, 4, 4, 3, 3, 2, 3, 2, 2, 2, 2],
];
const IVI_BLK_HUFF_DESC = [
  [1, 2, 3, 4, 4, 7, 5, 5, 4, 1], [2, 3, 4, 4, 4, 7, 5, 4, 3, 3, 2], [2, 4, 5, 5, 5, 5, 6, 4, 4, 3, 1, 1],
  [3, 3, 4, 4, 5, 6, 6, 4, 4, 3, 2, 1, 1], [3, 4, 4, 5, 5, 5, 6, 5, 4, 2, 2], [3, 4, 5, 5, 5, 5, 6, 4, 3, 3, 2, 1, 1],
  [3, 4, 5, 5, 5, 6, 5, 4, 3, 3, 2, 1, 1], [3, 4, 4, 5, 5, 5, 6, 5, 5],
];

const U8 = (a          )             => Uint8Array.from(a);
const ZIGZAG_DIRECT = U8([
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
  35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63]);
const VERTICAL_SCAN_8X8 = U8(Array.from({ length: 64 }, (_, i) => (i & 7) * 8 + (i >> 3)));
const HORIZONTAL_SCAN_8X8 = U8(Array.from({ length: 64 }, (_, i) => i));
const DIRECT_SCAN_4X4 = U8([0, 1, 4, 8, 5, 2, 3, 6, 9, 12, 13, 10, 7, 11, 14, 15]);
const ALTERNATE_SCAN_8X8 = U8([
  0, 8, 1, 9, 16, 24, 2, 3, 17, 25, 10, 11, 32, 40, 48, 56, 4, 5, 6, 7, 33, 41, 49, 57, 18, 19, 26, 27, 12, 13, 14, 15,
  34, 35, 43, 42, 50, 51, 59, 58, 20, 21, 22, 23, 31, 30, 29, 28, 36, 37, 38, 39, 47, 46, 45, 44, 52, 53, 54, 55, 63, 62, 61, 60]);
const ALTERNATE_SCAN_4X4 = U8([0, 1, 4, 5, 8, 12, 2, 3, 9, 13, 6, 7, 10, 11, 14, 15]);
const VERTICAL_SCAN_4X4 = U8([0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]);
const HORIZONTAL_SCAN_4X4 = U8(Array.from({ length: 16 }, (_, i) => i));
// indeo4data.h scan_index_to_tab[15]
const SCAN_INDEX_TO_TAB = [
  ZIGZAG_DIRECT, ALTERNATE_SCAN_8X8, HORIZONTAL_SCAN_8X8, VERTICAL_SCAN_8X8, ZIGZAG_DIRECT, // 8x8
  DIRECT_SCAN_4X4, ALTERNATE_SCAN_4X4, VERTICAL_SCAN_4X4, HORIZONTAL_SCAN_4X4, DIRECT_SCAN_4X4, // 4x4
  HORIZONTAL_SCAN_8X8, HORIZONTAL_SCAN_8X8, HORIZONTAL_SCAN_8X8, HORIZONTAL_SCAN_8X8, HORIZONTAL_SCAN_8X8,
];
// indeo4data.h ivi4_common_pic_sizes, quant_index_to_tab
const IVI4_COMMON_PIC_SIZES = [640, 480, 320, 240, 160, 120, 704, 480, 352, 240, 352, 288, 176, 144];
const QUANT_INDEX_TO_TAB = [0, 1, 0, 2, 1, 3, 0, 4, 1, 5, 0, 1, 6, 7, 8, /* 8x8 */ 0, 1, 2, 2, 3, 3, 4 /* 4x4 */];

// ivi.c ff_ivi_rvmap_tabs[9]: per table eob_sym, esc_sym, runtab[256], valtab[256].
const RVMAP_DATA           = [
  5, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 2, 1, 1, 1, 1, 3, 3,
  1, 1, 2, 2, 1, 1, 4, 4, 1, 1, 1, 1, 2, 2, 5, 5, 1, 1,
  3, 3, 1, 1, 6, 6, 1, 2, 1, 2, 7, 7, 1, 1, 8, 8, 1, 1,
  4, 2, 1, 4, 2, 1, 3, 3, 1, 1, 1, 9, 9, 1, 2, 1, 2, 1,
  5, 5, 1, 1, 10, 10, 1, 1, 3, 3, 2, 2, 1, 1, 11, 11, 6, 4,
  4, 1, 6, 1, 2, 1, 2, 12, 8, 1, 12, 7, 8, 7, 1, 16, 1, 16,
  1, 3, 3, 13, 1, 13, 2, 2, 1, 15, 1, 5, 14, 15, 1, 5, 14, 1,
  17, 8, 17, 8, 1, 4, 4, 2, 2, 1, 25, 25, 24, 24, 1, 3, 1, 3,
  1, 8, 6, 7, 6, 1, 18, 8, 18, 1, 7, 23, 2, 2, 23, 1, 1, 21,
  22, 9, 9, 22, 19, 1, 21, 5, 19, 5, 1, 33, 20, 33, 20, 8, 4, 4,
  1, 32, 2, 2, 8, 3, 32, 26, 3, 1, 7, 7, 26, 6, 1, 6, 1, 1,
  16, 1, 10, 1, 10, 2, 16, 29, 28, 2, 29, 28, 1, 27, 5, 8, 5, 27,
  1, 8, 3, 7, 3, 31, 41, 31, 1, 41, 6, 1, 6, 7, 4, 4, 1, 1,
  2, 1, 2, 11, 34, 30, 11, 1, 30, 15, 15, 34, 36, 40, 36, 40, 35, 35,
  37, 37, 39, 39, 38, 38, 1, -1, 0, 2, -2, 0, 3, -3, 1, -1, 4, -4,
  5, -5, 1, -1, 6, -6, 2, -2, 7, -7, 1, -1, 8, -8, 9, -9, 3, -3,
  1, -1, 10, -10, 2, -2, 11, -11, 1, -1, 12, 4, -12, -4, 1, -1, 13, -13,
  1, -1, 14, -14, 2, 5, 15, -2, -5, -15, -3, 3, 16, -16, 17, 1, -1, -17,
  6, 18, -6, -18, 2, -2, 19, -19, 1, -1, 20, -20, 4, -4, 7, -7, 21, -21,
  1, -1, 2, 3, -3, 22, -2, -22, 8, 23, -8, 1, 2, -23, -1, 2, -2, -2,
  24, 1, -24, -1, 25, 5, -5, 1, -25, -1, 9, -9, 26, 1, -26, 3, 1, -1,
  27, -3, -1, -27, 1, 3, -1, -3, 28, -4, 4, 10, -10, -28, 1, -1, 1, -1,
  29, 6, -29, -6, 30, -4, 3, 3, -3, -30, 1, 4, -1, 31, -3, 1, 11, -11,
  -1, -31, 32, -1, -1, 2, -2, 1, 1, -32, 1, 4, -1, -4, 33, -1, 1, 1,
  -1, 5, 5, -5, -33, -1, -12, 12, -5, -7, 1, 1, 7, 34, 4, -4, -1, 4,
  -34, -4, 35, 36, -2, -35, -2, -36, 2, 13, 2, -1, 1, -13, 1, -1, 37, 1,
  -5, 6, 5, -1, 38, -6, -8, 5, 8, -1, 1, 1, -37, -1, 5, 39, -5, -5,
  6, -6, -38, -39, -14, 40, 14, 2, 1, 1, -2, -40, -1, -2, 2, -1, -1, -1,
  1, 1, 1, -1, 1, -1, 1, -1, 1, -1, 0, 38, 0, 1, 1, 2, 2, 3,
  3, 4, 4, 5, 5, 6, 8, 6, 8, 7, 7, 9, 9, 10, 10, 11, 11, 1,
  12, 1, 12, 13, 13, 16, 14, 16, 14, 15, 15, 17, 17, 18, 0, 18, 19, 20,
  21, 19, 22, 21, 20, 22, 25, 24, 2, 25, 24, 23, 23, 2, 26, 28, 26, 28,
  29, 27, 29, 27, 33, 33, 1, 32, 1, 3, 32, 30, 36, 3, 36, 30, 31, 31,
  35, 34, 37, 41, 34, 35, 37, 4, 41, 4, 49, 8, 8, 49, 40, 38, 5, 38,
  40, 39, 5, 39, 42, 43, 42, 7, 57, 6, 43, 44, 6, 50, 7, 44, 57, 48,
  50, 48, 45, 45, 46, 47, 51, 46, 47, 58, 1, 51, 58, 1, 52, 59, 53, 9,
  52, 55, 55, 59, 53, 56, 54, 56, 54, 9, 64, 64, 60, 63, 60, 63, 61, 62,
  61, 62, 2, 10, 2, 10, 11, 1, 11, 13, 12, 1, 12, 13, 16, 16, 8, 8,
  14, 3, 3, 15, 14, 15, 4, 4, 1, 17, 17, 5, 1, 7, 7, 5, 6, 1,
  2, 2, 6, 22, 1, 25, 21, 22, 8, 24, 1, 21, 25, 24, 8, 18, 18, 23,
  9, 20, 23, 33, 29, 33, 20, 1, 19, 1, 29, 36, 9, 36, 19, 41, 28, 57,
  32, 3, 28, 3, 1, 27, 49, 49, 1, 32, 26, 26, 2, 4, 4, 7, 57, 41,
  2, 7, 10, 5, 37, 16, 10, 27, 8, 8, 13, 16, 37, 13, 1, 5, 0, 1,
  -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, 1, -1, -1, 1, -1, 1, -1, 1,
  -1, 1, -1, 2, 1, -2, -1, 1, -1, 1, 1, -1, -1, 1, -1, 1, -1, 1,
  0, -1, 1, 1, 1, -1, 1, -1, -1, -1, 1, 1, 2, -1, -1, 1, -1, -2,
  1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 3, 1, -3, 2, -1, 1, 1, -2,
  -1, -1, -1, 1, 1, 1, 1, 1, -1, -1, -1, 2, -1, -2, 1, 2, -2, -1,
  1, 1, 2, -1, -1, 1, -2, -1, 1, 1, -1, 2, 1, 2, -1, 1, -2, -1,
  -2, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, -1, -1, 1, 4, -1, -1, -4,
  1, 1, 1, 2, -1, -1, 1, -1, -1, 1, -1, -1, 1, -2, 1, -1, 1, 1,
  -1, -1, 1, 1, -1, -1, 3, 2, -3, -2, 2, 5, -2, 2, 2, -5, -2, -2,
  -2, 2, -3, 3, 2, 3, -3, 2, -2, -2, 3, -3, 6, 2, -2, 3, -6, 3,
  -3, -3, 3, 7, -4, 4, -3, 2, -7, 2, 2, -2, -4, 2, 8, -2, -2, -2,
  4, 2, -2, 2, 3, 2, -2, -2, 2, 2, -2, -8, -2, 9, -2, 2, -3, -2,
  2, -2, 2, 2, 2, 4, -2, -4, 10, 2, 2, -2, -9, -2, 2, -2, 5, 4,
  -4, 4, -2, 2, -5, -4, -3, 4, 2, -3, 3, -2, -5, 5, 3, 3, -2, -3,
  -10, -4, 2, 11, 1, 1, 0, 2, 2, 1, 1, 3, 3, 4, 4, 0, 1, 1,
  5, 5, 2, 2, 6, 6, 7, 7, 1, 8, 1, 8, 3, 3, 9, 9, 1, 2,
  2, 1, 4, 10, 4, 10, 11, 11, 1, 5, 12, 12, 1, 5, 13, 13, 3, 3,
  6, 6, 2, 2, 14, 14, 16, 16, 15, 7, 15, 8, 8, 7, 1, 1, 17, 17,
  4, 4, 1, 1, 18, 18, 2, 2, 5, 5, 25, 3, 9, 3, 25, 9, 19, 24,
  19, 24, 1, 21, 20, 1, 21, 22, 20, 22, 23, 23, 8, 6, 33, 6, 8, 33,
  7, 7, 26, 26, 1, 32, 1, 32, 28, 4, 28, 10, 29, 27, 27, 10, 41, 4,
  29, 2, 2, 41, 36, 31, 49, 31, 34, 30, 34, 36, 30, 35, 1, 49, 11, 5,
  35, 11, 1, 3, 3, 5, 37, 37, 8, 40, 8, 40, 12, 12, 42, 42, 1, 38,
  16, 57, 1, 6, 16, 39, 38, 6, 7, 7, 13, 13, 39, 43, 2, 43, 57, 2,
  50, 9, 44, 9, 50, 4, 15, 48, 44, 4, 1, 15, 48, 14, 14, 1, 45, 45,
  8, 3, 5, 8, 51, 47, 3, 46, 46, 47, 5, 51, 1, 17, 17, 58, 1, 58,
  2, 52, 52, 2, 53, 7, 59, 6, 6, 56, 53, 55, 7, 55, 1, 54, 59, 56,
  54, 10, 1, 10, 4, 60, 1, 60, 8, 4, 8, 64, 64, 61, 1, 63, 3, 63,
  62, 61, 5, 11, 5, 3, 11, 62, 1, -1, 0, 1, -1, 2, -2, 1, -1, 1,
  -1, 0, 3, -3, 1, -1, 2, -2, 1, -1, 1, -1, 4, 1, -4, -1, 2, -2,
  1, -1, 5, 3, -3, -5, 2, 1, -2, -1, 1, -1, 6, 2, 1, -1, -6, -2,
  1, -1, 3, -3, 2, -2, 4, -4, 1, -1, 1, -1, 1, 2, -1, 2, -2, -2,
  7, -7, 1, -1, 3, -3, 8, -8, 1, -1, 5, -5, 3, -3, 1, 4, 2, -4,
  -1, -2, 1, 1, -1, -1, 9, 1, 1, -9, -1, 1, -1, -1, 1, -1, 3, -3,
  1, 3, -3, -1, 3, -3, 1, -1, 10, 1, -10, -1, 1, 4, -1, 2, 1, -1,
  1, -2, 1, -4, -1, 6, -6, -1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1,
  11, -1, -2, 4, -1, 2, -11, 5, -5, -4, -1, 1, 4, 1, -4, -1, -2, 2,
  1, -1, 12, 1, -2, 1, -12, 4, 2, 1, -1, -4, 4, -4, 2, -2, -1, 1,
  7, -1, -1, -7, -1, -3, 1, 3, 1, 5, 2, 1, -1, -5, 13, -2, -1, 2,
  -2, -13, 1, -1, 5, 6, 5, -5, 1, 1, -6, 1, -1, -1, -5, -1, 14, 2,
  -2, 1, -14, -1, 8, 1, -1, -8, 1, 5, 1, 5, -5, 1, -1, 1, -5, -1,
  15, 1, -1, -1, -1, 3, -15, -3, 6, 1, 16, -1, 6, -6, -6, 1, -1, 1,
  -16, 1, 7, -1, 1, -1, -6, -3, 6, -7, 3, -1, 0, 35, 0, 1, 1, 2,
  2, 3, 3, 4, 4, 1, 1, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 2,
  2, 10, 10, 1, 1, 11, 11, 12, 12, 3, 3, 13, 13, 0, 14, 14, 16, 15,
  16, 15, 4, 4, 17, 1, 17, 1, 5, 5, 18, 18, 2, 2, 6, 6, 8, 19,
  7, 8, 7, 19, 20, 20, 21, 21, 22, 24, 22, 24, 23, 23, 1, 1, 25, 25,
  3, 3, 26, 26, 9, 9, 27, 27, 28, 28, 33, 29, 4, 33, 29, 1, 4, 1,
  32, 32, 2, 2, 31, 10, 30, 10, 30, 31, 34, 34, 5, 5, 36, 36, 35, 41,
  35, 11, 41, 11, 37, 1, 8, 8, 37, 6, 1, 6, 40, 7, 7, 40, 12, 38,
  12, 39, 39, 38, 49, 13, 49, 13, 3, 42, 3, 42, 16, 16, 43, 43, 14, 14,
  1, 1, 44, 15, 44, 15, 2, 2, 57, 48, 50, 48, 57, 50, 4, 45, 45, 4,
  46, 47, 47, 46, 1, 51, 1, 17, 17, 51, 8, 9, 9, 5, 58, 8, 58, 5,
  52, 52, 55, 56, 53, 56, 55, 59, 59, 53, 54, 1, 6, 54, 7, 7, 6, 1,
  2, 3, 2, 3, 64, 60, 60, 10, 10, 64, 61, 62, 61, 63, 1, 63, 62, 1,
  18, 24, 18, 4, 25, 4, 8, 21, 21, 1, 24, 22, 25, 22, 8, 11, 19, 11,
  23, 1, 20, 23, 19, 20, 5, 12, 5, 1, 16, 2, 12, 13, 2, 13, 1, 16,
  0, 1, -1, 1, -1, 1, -1, 1, -1, 2, -2, 1, -1, 1, -1, 1, -1, 1,
  -1, 1, -1, 2, -2, 1, -1, 3, -3, 1, -1, 1, -1, 2, -2, 1, -1, 0,
  1, -1, 1, 1, -1, -1, 2, -2, 1, 4, -1, -4, 2, -2, 1, -1, -3, 3,
  2, -2, 2, 1, 2, -2, -2, -1, 1, -1, 1, -1, 1, 1, -1, -1, 1, -1,
  5, -5, 1, -1, 3, -3, 1, -1, 2, -2, 1, -1, 1, -1, 1, 1, 3, -1,
  -1, 6, -3, -6, -1, 1, 4, -4, 1, 2, 1, -2, -1, -1, 1, -1, 3, -3,
  1, -1, 1, 1, -1, 2, -1, -2, 1, 7, -3, 3, -1, 3, -7, -3, 1, -3,
  3, -1, 2, 1, -2, 1, -1, -1, 1, 2, -1, -2, -4, -1, 4, 1, 2, -2,
  1, -1, -2, 2, 8, -8, -1, 2, 1, -2, -5, 5, 1, -1, -1, 1, -1, 1,
  4, -1, 1, -4, -1, -1, 1, 1, 9, 1, -9, 2, -2, -1, -4, 3, -3, -4,
  -1, 4, 1, 4, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, 10, 4, 1,
  4, -4, -4, -10, 6, 5, -6, -5, 1, -1, 1, 3, -3, -1, 1, -1, -1, -1,
  11, 1, 1, -11, -2, -2, 2, 5, -2, -5, -5, 2, -2, 12, 2, -2, 2, 2,
  5, -3, -2, 3, -2, -12, -2, 2, 2, 2, -5, 3, 5, 13, -3, 7, -3, -3,
  -7, 3, -13, 3, 0, 34, 0, 1, 1, 1, 2, 2, 1, 3, 3, 1, 1, 1,
  4, 4, 1, 5, 2, 1, 5, 2, 1, 1, 6, 6, 1, 1, 1, 1, 1, 7,
  3, 1, 2, 3, 0, 1, 2, 7, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1,
  9, 1, 9, 1, 2, 1, 1, 2, 1, 1, 10, 4, 1, 10, 1, 4, 1, 1,
  1, 1, 1, 3, 1, 1, 1, 3, 2, 1, 5, 1, 1, 1, 2, 5, 1, 11,
  1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 6, 1, 6, 1,
  1, 2, 1, 1, 1, 1, 1, 1, 1, 12, 3, 1, 12, 1, 1, 1, 2, 1,
  1, 3, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 2, 1, 1, 4, 1, 1,
  1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1,
  2, 1, 1, 5, 1, 1, 1, 1, 1, 7, 1, 7, 1, 1, 2, 3, 1, 1,
  1, 1, 5, 1, 1, 1, 1, 1, 1, 2, 13, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 13, 2, 1, 1, 4, 1, 1, 1, 3, 1,
  6, 1, 1, 1, 14, 1, 1, 1, 1, 1, 14, 6, 1, 1, 1, 1, 15, 2,
  4, 1, 2, 3, 15, 1, 1, 1, 8, 1, 1, 8, 1, 1, 1, 1, 1, 1,
  1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, -1, 2, 1, -1, -2, 1,
  -1, 3, -3, 4, 1, -1, -4, 1, 2, 5, -1, -2, -5, 6, 1, -1, -6, 7,
  -7, 8, -8, 1, 2, 9, 3, -2, 0, -9, -3, -1, 10, -10, 11, 1, -11, 12,
  -1, -12, 13, -13, 1, 14, -1, -14, 4, 15, -15, -4, 16, -16, 1, 2, 17, -1,
  -17, -2, 18, -18, 19, -19, 20, 3, -20, 21, -21, -3, 5, 22, 2, -22, -23, 23,
  -5, -2, 24, 1, -24, -1, 25, -25, 26, -26, -27, 27, 28, 29, -28, -29, 6, 30,
  2, -31, -2, -30, 31, -6, -32, 32, 33, -33, 34, -35, -34, 1, 4, -36, -1, 35,
  37, 36, 7, -37, 38, -4, -38, 39, 41, 40, -40, -39, 3, 42, -43, -41, -7, -42,
  43, -3, 44, -44, 45, -45, 46, 47, 8, -47, -48, -46, 50, -50, 48, 49, 51, -49,
  52, -52, 5, -51, -8, -53, 53, 3, -56, 56, 55, 54, -54, 2, 60, -2, -55, 58,
  9, -5, 59, 57, -57, -63, -3, -58, -60, -61, 61, -59, -62, -9, 1, 64, 62, 69,
  -64, 63, 65, -67, -68, 66, -65, 68, -66, -69, 67, -70, -1, 10, 71, -71, 4, 73,
  72, 70, 6, -76, -3, 74, -78, -74, 1, 78, 80, -72, -75, 76, -1, 3, -73, 79,
  75, 77, 1, 11, -4, -79, -10, -6, -1, -77, -83, -80, 2, 81, -84, -2, 83, -81,
  82, -82, 84, -87, -86, 85, -11, -85, 86, -89, 87, -88, 88, 89, 2, 33, 1, 1,
  0, 2, 1, 2, 1, 3, 3, 1, 1, 4, 4, 2, 2, 1, 1, 5, 5, 6,
  1, 6, 1, 7, 7, 3, 3, 2, 8, 2, 8, 1, 1, 0, 9, 9, 1, 1,
  10, 4, 10, 4, 11, 11, 2, 1, 2, 1, 12, 12, 3, 3, 1, 1, 13, 5,
  5, 13, 14, 1, 1, 14, 2, 2, 6, 6, 15, 1, 1, 15, 16, 4, 7, 16,
  4, 7, 1, 1, 3, 3, 8, 8, 2, 2, 1, 1, 17, 17, 1, 1, 18, 18,
  5, 5, 2, 2, 1, 1, 9, 19, 9, 19, 20, 3, 3, 20, 1, 10, 21, 1,
  10, 4, 4, 21, 22, 6, 6, 22, 1, 1, 23, 24, 2, 2, 23, 24, 11, 1,
  1, 11, 7, 25, 7, 1, 1, 25, 8, 8, 3, 26, 3, 1, 12, 2, 2, 26,
  1, 12, 5, 5, 27, 4, 1, 4, 1, 27, 28, 1, 28, 13, 1, 13, 2, 29,
  2, 1, 32, 6, 1, 30, 14, 29, 14, 6, 3, 31, 3, 1, 30, 1, 32, 31,
  33, 9, 33, 1, 1, 7, 9, 7, 2, 2, 1, 1, 4, 36, 34, 4, 5, 10,
  10, 5, 34, 1, 1, 35, 8, 8, 36, 3, 35, 1, 15, 3, 2, 1, 16, 15,
  16, 2, 37, 1, 37, 1, 1, 1, 6, 6, 38, 1, 38, 11, 1, 39, 39, 40,
  11, 2, 41, 4, 40, 1, 2, 4, 1, 1, 1, 41, 3, 1, 3, 1, 5, 7,
  5, 7, 1, -1, 0, 1, 2, -1, -2, 1, -1, 3, -3, 1, -1, 2, -2, 4,
  -4, 1, -1, 1, 5, -1, -5, 1, -1, 2, -2, 3, 1, -3, -1, 6, -6, 0,
  1, -1, 7, -7, 1, 2, -1, -2, 1, -1, 4, 8, -4, -8, 1, -1, 3, -3,
  9, -9, 1, 2, -2, -1, 1, 10, -10, -1, 5, -5, 2, -2, 1, 11, -11, -1,
  1, 3, 2, -1, -3, -2, 12, -12, 4, -4, 2, -2, -6, 6, 13, -13, 1, -1,
  14, -14, 1, -1, 3, -3, 7, -7, 15, -15, 2, 1, -2, -1, 1, 5, -5, -1,
  -16, 2, 1, 16, -2, 4, -4, -1, 1, 3, -3, -1, 17, -17, 1, 1, -8, 8,
  -1, -1, 2, 18, -18, -2, 3, 1, -3, 19, -19, -1, 3, -3, 6, 1, -6, 20,
  2, 9, -9, -1, -20, -2, 4, -4, 1, -5, 21, 5, -21, -1, 1, -22, -1, 2,
  22, -2, 10, 1, -10, 23, 1, 4, -23, 1, 2, -1, -2, -4, -7, 1, 7, -24,
  -1, 24, -1, -1, 1, 3, -1, -25, 25, 4, -3, -4, 11, -11, 26, -26, 6, 1,
  1, -6, -5, -3, 3, 5, -1, -27, 27, 1, 4, -4, -1, -8, -1, 28, 2, 8,
  -12, -28, -2, -2, 2, 12, -1, 29, 1, -29, 30, -30, 5, -5, 1, -31, -1, 3,
  31, -1, 1, 1, -3, -13, 1, -7, -1, -32, 13, 7, 32, 33, -33, -1, -9, -34,
  9, 34, -6, 5, 6, -5, 2, 13, 1, 1, 0, 1, 1, 2, 2, 1, 1, 3,
  3, 1, 1, 0, 2, 2, 4, 1, 4, 1, 1, 1, 5, 5, 1, 1, 6, 6,
  2, 2, 1, 1, 3, 3, 7, 7, 1, 1, 8, 8, 1, 1, 2, 2, 1, 9,
  1, 9, 4, 4, 10, 1, 1, 10, 1, 1, 11, 11, 3, 3, 1, 2, 1, 2,
  1, 1, 12, 12, 5, 5, 1, 1, 13, 1, 1, 13, 2, 2, 1, 1, 6, 6,
  1, 1, 4, 14, 4, 14, 3, 1, 3, 1, 1, 1, 15, 7, 15, 2, 2, 7,
  1, 1, 1, 8, 1, 8, 16, 16, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1,
  3, 5, 5, 3, 4, 1, 1, 4, 1, 1, 17, 17, 9, 1, 1, 9, 2, 2,
  1, 1, 10, 10, 1, 6, 1, 1, 6, 18, 1, 1, 18, 1, 1, 1, 2, 2,
  3, 1, 3, 1, 1, 1, 4, 1, 19, 1, 19, 7, 1, 1, 20, 1, 4, 20,
  1, 7, 11, 2, 1, 11, 21, 2, 8, 5, 1, 8, 1, 5, 21, 1, 1, 1,
  22, 1, 1, 22, 1, 1, 3, 3, 1, 23, 2, 12, 24, 1, 1, 2, 1, 1,
  12, 23, 1, 1, 24, 1, 1, 1, 4, 1, 1, 1, 2, 1, 6, 6, 4, 2,
  1, 1, 1, 1, 1, 1, 1, 14, 13, 3, 1, 25, 9, 25, 14, 1, 9, 3,
  13, 1, 1, 1, 1, 1, 10, 1, 1, 2, 10, 2, -20, -1, 0, 2, -2, 1,
  -1, 3, -3, 1, -1, 4, -4, 0, 2, -2, 1, 5, -1, -5, 6, -6, 1, -1,
  7, -7, 1, -1, 3, -3, 8, -8, 2, -2, 1, -1, 9, -9, 1, -1, 10, -10,
  4, -4, 11, 1, -11, -1, 2, -2, 1, 12, -12, -1, 13, -13, 1, -1, 3, -3,
  14, 5, -14, -5, -15, 15, -1, 1, 2, -2, 16, -16, 1, 17, -17, -1, 6, -6,
  18, -18, 2, -2, -19, 19, -3, 1, 3, -1, 4, 20, -4, 1, -21, 21, 1, 2,
  -1, -7, 7, -2, 22, -22, 23, 2, -23, -2, 1, -1, -24, 24, -25, 25, -8, -26,
  26, 8, -27, 27, 5, 3, -3, -5, -4, 28, -28, 4, 29, -29, 1, -1, -2, -30,
  30, 2, 9, -9, -31, 31, 2, -2, -32, 3, 32, -33, -3, 1, 33, -34, -1, 34,
  -35, 35, -10, 10, -6, 36, 6, -36, 37, -37, -5, 38, 1, -38, -1, 3, 39, -39,
  -1, 40, 5, 1, -40, -3, 2, -11, -41, -2, 1, 11, -3, -4, 41, 3, 42, 4,
  -1, -43, -42, 43, 1, -44, 45, -1, 44, -45, -7, 7, -46, 1, -12, 2, 1, -47,
  46, 12, 47, 48, -2, -1, -48, 49, -1, -50, -49, 50, -6, -51, 51, 52, -13, 53,
  -4, 4, 6, 13, -53, -52, -54, 55, 54, -55, -56, -2, 2, -8, 56, 1, -3, -1,
  2, 58, 3, 8, -2, 57, -58, -60, -59, -57, -3, 60, 59, -14, 3, 14, 2, 38,
  1, 1, 0, 2, 2, 1, 1, 3, 3, 4, 4, 5, 5, 1, 1, 6, 6, 2,
  2, 7, 7, 8, 8, 1, 1, 3, 3, 9, 9, 10, 10, 1, 1, 2, 2, 4,
  4, 11, 0, 11, 12, 12, 13, 13, 1, 1, 5, 5, 14, 14, 15, 16, 15, 16,
  3, 3, 1, 6, 1, 6, 2, 2, 7, 7, 8, 8, 17, 17, 1, 1, 4, 4,
  18, 18, 2, 2, 1, 19, 1, 20, 19, 20, 21, 21, 3, 3, 22, 22, 5, 5,
  24, 1, 1, 23, 9, 23, 24, 9, 2, 2, 10, 1, 1, 10, 6, 6, 25, 4,
  4, 25, 7, 7, 26, 8, 1, 8, 3, 1, 26, 3, 11, 11, 27, 27, 2, 28,
  1, 2, 28, 1, 12, 12, 5, 5, 29, 13, 13, 29, 32, 1, 1, 33, 31, 30,
  32, 4, 30, 33, 4, 31, 3, 14, 1, 1, 3, 34, 34, 2, 2, 14, 6, 6,
  35, 36, 35, 36, 1, 15, 1, 16, 16, 15, 7, 9, 7, 9, 37, 8, 8, 37,
  1, 1, 39, 2, 38, 39, 2, 40, 5, 38, 40, 5, 3, 3, 4, 4, 10, 10,
  1, 1, 1, 1, 41, 2, 41, 2, 6, 6, 1, 1, 11, 42, 11, 43, 3, 42,
  3, 17, 4, 43, 1, 17, 7, 1, 8, 44, 4, 7, 44, 5, 8, 2, 5, 1,
  2, 48, 45, 1, 12, 45, 12, 48, 13, 13, 1, 9, 9, 46, 1, 46, 47, 47,
  49, 18, 18, 49, 1, -1, 0, 1, -1, 2, -2, 1, -1, 1, -1, 1, -1, 3,
  -3, 1, -1, -2, 2, 1, -1, 1, -1, 4, -4, -2, 2, 1, -1, 1, -1, 5,
  -5, -3, 3, 2, -2, 1, 0, -1, 1, -1, 1, -1, 6, -6, 2, -2, 1, -1,
  1, 1, -1, -1, -3, 3, 7, 2, -7, -2, -4, 4, 2, -2, 2, -2, 1, -1,
  8, -8, 3, -3, 1, -1, -5, 5, 9, 1, -9, 1, -1, -1, 1, -1, -4, 4,
  1, -1, 3, -3, 1, -10, 10, 1, 2, -1, -1, -2, 6, -6, 2, 11, -11, -2,
  3, -3, 1, -4, 4, -1, 3, -3, 1, 3, 12, -3, -5, -12, -1, 5, 2, -2,
  1, -1, -7, 1, 13, 7, -1, -13, 2, -2, 4, -4, 1, 2, -2, -1, 1, 14,
  -14, 1, 1, 1, -1, -5, -1, -1, 5, -1, -6, 2, -15, 15, 6, 1, -1, -8,
  8, -2, -4, 4, 1, 1, -1, -1, 16, 2, -16, -2, 2, -2, 4, 3, -4, -3,
  -1, -4, 4, 1, -17, 17, -1, -9, 1, 1, 9, 1, -5, -1, -1, 5, -7, 7,
  6, -6, 3, -3, 18, -18, 19, -19, 1, -10, -1, 10, -5, 5, 20, -20, -3, 1,
  3, 1, 8, -1, -8, 2, 7, -1, -21, -2, 5, 21, 5, -1, -7, -5, 1, -6,
  -5, -11, 6, 22, 11, 1, 1, -22, -3, -1, 3, -1, 3, -3, -23, 4, -4, 1,
  23, -1, 1, -1, 1, -2, 2, -1, 4, 11, 1, 1, 1, 1, 0, 2, 2, 1,
  1, 3, 3, 0, 1, 1, 2, 2, 4, 4, 1, 1, 5, 5, 1, 1, 2, 2,
  3, 3, 6, 6, 1, 1, 7, 7, 8, 1, 8, 2, 2, 1, 4, 4, 1, 3,
  1, 3, 9, 9, 2, 2, 1, 5, 1, 5, 10, 10, 1, 1, 11, 11, 3, 6,
  3, 4, 4, 6, 2, 2, 1, 12, 1, 12, 7, 13, 7, 13, 1, 1, 8, 8,
  2, 2, 14, 14, 16, 15, 16, 5, 5, 1, 3, 15, 1, 3, 4, 4, 1, 1,
  17, 17, 2, 2, 6, 6, 1, 18, 1, 18, 22, 21, 22, 21, 25, 24, 25, 19,
  9, 20, 9, 23, 19, 24, 20, 3, 23, 7, 3, 1, 1, 7, 28, 26, 29, 5,
  28, 26, 5, 8, 29, 4, 8, 27, 2, 2, 4, 27, 1, 1, 10, 36, 10, 33,
  33, 36, 30, 1, 32, 32, 1, 30, 6, 31, 31, 35, 3, 6, 11, 11, 3, 2,
  35, 2, 34, 1, 34, 1, 37, 37, 12, 7, 12, 5, 41, 5, 4, 7, 1, 8,
  13, 4, 1, 41, 13, 38, 8, 38, 9, 1, 40, 40, 9, 1, 39, 2, 2, 49,
  39, 42, 3, 3, 14, 16, 49, 14, 16, 42, 43, 43, 6, 6, 15, 1, 1, 15,
  44, 44, 1, 1, 50, 48, 4, 5, 4, 7, 5, 2, 10, 10, 48, 7, 50, 45,
  2, 1, 45, 8, 8, 1, 46, 46, 3, 47, 47, 3, 1, 1, 1, -1, 2, -2,
  0, 1, -1, 3, -3, 1, -1, 0, 4, -4, 2, -2, 1, -1, 5, -5, 1, -1,
  6, -6, 3, -3, 2, -2, 1, -1, 7, -7, 1, -1, 1, 8, -1, 4, -4, -8,
  2, -2, 9, 3, -9, -3, 1, -1, 5, -5, 10, 2, -10, -2, 1, -1, 11, -11,
  1, -1, -4, 2, 4, 3, -3, -2, 6, -6, 12, 1, -12, -1, 2, 1, -2, -1,
  13, -13, 2, -2, 7, -7, 1, -1, 1, 1, -1, 3, -3, 14, 5, -1, -14, -5,
  4, -4, 15, -15, 1, -1, 8, -8, -3, 3, 16, 1, -16, -1, 1, 1, -1, -1,
  1, 1, -1, 1, 2, 1, -2, 1, -1, -1, -1, 6, -1, 3, -6, 17, -17, -3,
  1, 1, 1, 4, -1, -1, -4, 3, -1, 5, -3, -1, -9, 9, -5, 1, 18, -18,
  2, 1, -2, 1, -1, -1, 1, 19, -1, 1, -19, -1, 4, 1, -1, 1, 7, -4,
  -2, 2, -7, 10, -1, -10, 1, 20, -1, -20, 1, -1, 2, 4, -2, 5, 1, -5,
  6, -4, 21, 4, 2, -6, -21, -1, -2, 1, -4, -1, -3, 22, -1, 1, 3, -22,
  -1, 11, -11, 1, 1, 1, 8, -8, 2, 2, -1, -2, -2, -1, 1, -1, -5, 5,
  2, 23, -23, -2, 1, -1, 24, -24, -1, -1, 7, 6, -7, 5, -6, 12, -3, 3,
  1, -5, 1, 1, -12, 25, -1, -5, 5, -25, -1, 1, 9, 1, -1, -9, 26, -26];
// indeo4data.h ivi4_quant_8x8_intra[9][64]
const IVI4_QUANT_8X8_INTRA = new Uint16Array([
  43, 342, 385, 470, 555, 555, 598, 726, 342, 342, 470, 513, 555, 598, 726, 769,
  385, 470, 555, 555, 598, 726, 726, 811, 470, 470, 555, 555, 598, 726, 769, 854,
  470, 555, 555, 598, 683, 726, 854, 1025, 555, 555, 598, 683, 726, 854, 1025, 1153,
  555, 555, 598, 726, 811, 982, 1195, 1451, 555, 598, 726, 811, 982, 1195, 1451, 1793,
  86, 1195, 2390, 2390, 4865, 4865, 4865, 4865, 1195, 1195, 2390, 2390, 4865, 4865, 4865, 4865,
  2390, 2390, 4865, 4865, 6827, 6827, 6827, 6827, 2390, 2390, 4865, 4865, 6827, 6827, 6827, 6827,
  4865, 4865, 6827, 6827, 6827, 6827, 6827, 6827, 4865, 4865, 6827, 6827, 6827, 6827, 6827, 6827,
  4865, 4865, 6827, 6827, 6827, 6827, 6827, 6827, 4865, 4865, 6827, 6827, 6827, 6827, 6827, 6827,
  235, 1067, 1195, 1323, 1451, 1579, 1707, 1835, 235, 1067, 1195, 1323, 1451, 1579, 1707, 1835,
  235, 1067, 1195, 1323, 1451, 1579, 1707, 1835, 235, 1067, 1195, 1323, 1451, 1579, 1707, 1835,
  235, 1067, 1195, 1323, 1451, 1579, 1707, 1835, 235, 1067, 1195, 1323, 1451, 1579, 1707, 1835,
  235, 1067, 1195, 1323, 1451, 1579, 1707, 1835, 235, 1067, 1195, 1323, 1451, 1579, 1707, 1835,
  1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414, 1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414,
  1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414, 1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414,
  1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414, 1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414,
  1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414, 1707, 1707, 3414, 3414, 3414, 3414, 3414, 3414,
  897, 897, 897, 897, 897, 897, 897, 897, 1067, 1067, 1067, 1067, 1067, 1067, 1067, 1067,
  1238, 1238, 1238, 1238, 1238, 1238, 1238, 1238, 1409, 1409, 1409, 1409, 1409, 1409, 1409, 1409,
  1579, 1579, 1579, 1579, 1579, 1579, 1579, 1579, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750,
  1921, 1921, 1921, 1921, 1921, 1921, 1921, 1921, 2091, 2091, 2091, 2091, 2091, 2091, 2091, 2091,
  1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707,
  3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414,
  3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414,
  3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414,
  2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390,
  2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390,
  2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390,
  2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390, 2390,
  22, 171, 214, 257, 257, 299, 299, 342, 171, 171, 257, 257, 299, 299, 342, 385,
  214, 257, 257, 299, 299, 342, 342, 385, 257, 257, 257, 299, 299, 342, 385, 427,
  257, 257, 299, 299, 342, 385, 427, 513, 257, 299, 299, 342, 385, 427, 513, 598,
  299, 299, 299, 385, 385, 470, 598, 726, 299, 299, 385, 385, 470, 598, 726, 897,
  86, 598, 1195, 1195, 2390, 2390, 2390, 2390, 598, 598, 1195, 1195, 2390, 2390, 2390, 2390,
  1195, 1195, 2390, 2390, 3414, 3414, 3414, 3414, 1195, 1195, 2390, 2390, 3414, 3414, 3414, 3414,
  2390, 2390, 3414, 3414, 3414, 3414, 3414, 3414, 2390, 2390, 3414, 3414, 3414, 3414, 3414, 3414,
  2390, 2390, 3414, 3414, 3414, 3414, 3414, 3414, 2390, 2390, 3414, 3414, 3414, 3414, 3414, 3414]);
// indeo4data.h ivi4_quant_8x8_inter[9][64]
const IVI4_QUANT_8X8_INTER = new Uint16Array([
  427, 427, 470, 427, 427, 427, 470, 470, 427, 427, 470, 427, 427, 427, 470, 470,
  470, 470, 470, 470, 470, 470, 470, 470, 427, 427, 470, 470, 427, 427, 470, 470,
  427, 427, 470, 427, 427, 427, 470, 470, 427, 427, 470, 427, 427, 427, 470, 470,
  470, 470, 470, 470, 470, 470, 470, 470, 470, 470, 470, 470, 470, 470, 470, 470,
  1707, 1707, 2433, 2433, 3414, 3414, 3414, 3414, 1707, 1707, 2433, 2433, 3414, 3414, 3414, 3414,
  2433, 2433, 3414, 3414, 4822, 4822, 4822, 4822, 2433, 2433, 3414, 3414, 4822, 4822, 4822, 4822,
  3414, 3414, 4822, 4822, 3414, 3414, 3414, 3414, 3414, 3414, 4822, 4822, 3414, 3414, 3414, 3414,
  3414, 3414, 4822, 4822, 3414, 3414, 3414, 3414, 3414, 3414, 4822, 4822, 3414, 3414, 3414, 3414,
  1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281, 1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281,
  1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281, 1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281,
  1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281, 1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281,
  1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281, 1195, 1195, 1281, 1238, 1195, 1195, 1281, 1281,
  2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433, 2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433,
  2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433, 2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433,
  2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433, 2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433,
  2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433, 2433, 2433, 3414, 3414, 2433, 2433, 2433, 2433,
  1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195,
  1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1238, 1238, 1238, 1238, 1238, 1238, 1238, 1238,
  1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195, 1195,
  1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281, 1281,
  2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433,
  3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414, 3414,
  2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433,
  2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433, 2433,
  1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707,
  1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707,
  1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707,
  1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707, 1707,
  86, 171, 171, 214, 214, 214, 214, 257, 171, 171, 214, 214, 214, 214, 257, 257,
  171, 214, 214, 214, 214, 257, 257, 257, 214, 214, 214, 214, 257, 257, 257, 299,
  214, 214, 214, 257, 257, 257, 299, 299, 214, 214, 257, 257, 257, 299, 299, 299,
  214, 257, 257, 257, 299, 299, 299, 342, 257, 257, 257, 299, 299, 299, 342, 342,
  854, 854, 1195, 1195, 1707, 1707, 1707, 1707, 854, 854, 1195, 1195, 1707, 1707, 1707, 1707,
  1195, 1195, 1707, 1707, 2390, 2390, 2390, 2390, 1195, 1195, 1707, 1707, 2390, 2390, 2390, 2390,
  1707, 1707, 2390, 2390, 1707, 1707, 1707, 1707, 1707, 1707, 2390, 2390, 1707, 1707, 1707, 1707,
  1707, 1707, 2390, 2390, 1707, 1707, 1707, 1707, 1707, 1707, 2390, 2390, 1707, 1707, 1707, 1707]);
// indeo4data.h ivi4_quant_4x4_intra[5][16]
const IVI4_QUANT_4X4_INTRA = new Uint16Array([
  22, 214, 257, 299, 214, 257, 299, 342, 257, 299, 342, 427, 299, 342, 427, 513,
  129, 1025, 1451, 1451, 1025, 1025, 1451, 1451, 1451, 1451, 2049, 2049, 1451, 1451, 2049, 2049,
  43, 171, 171, 171, 43, 171, 171, 171, 43, 171, 171, 171, 43, 171, 171, 171,
  43, 43, 43, 43, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171,
  43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43]);
// indeo4data.h ivi4_quant_4x4_inter[5][16]
const IVI4_QUANT_4X4_INTER = new Uint16Array([
  107, 214, 257, 299, 214, 257, 299, 299, 257, 299, 299, 342, 299, 299, 342, 342,
  513, 1025, 1238, 1238, 1025, 1025, 1238, 1238, 1238, 1238, 1451, 1451, 1238, 1238, 1451, 1451,
  43, 171, 171, 171, 43, 171, 171, 171, 43, 171, 171, 171, 43, 171, 171, 171,
  43, 43, 43, 43, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171,
  43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43]);
