// In-browser conversion of an original Director 6 movie (.dxr, little-endian 'XFIR' RIFX) to the data the
// runtime uses. Port of tools/director.py + tools/export_cast.py + tools/export_score.py (which work on the
// ProjectorRays chunk dump and write cast.json, palette_<n>.json, <n>.png, <n>_text.png and score.json);
// formats: decomp/formats/cast.md, decomp/formats/score.md. Field layouts follow ScummVM engines/director
// (frame.cpp readChannelD6/readSpriteDataD6, castmember/bitmap.cpp D6 branch, images.cpp BITDDecoder,
// rte.cpp RTE2, score.cpp loadFrames/updateNextFrameTime). The output must equal the Python output exactly.
                                                               

                                                                            
                                 
                 
                   
                                                       
                                 
 

                                   
                        

const MEMBER_TYPES                         = { 0: 'null', 1: 'bitmap', 2: 'filmLoop', 3: 'field', 4: 'palette', 5: 'picture',
  6: 'sound', 7: 'button', 8: 'shape', 9: 'movie', 10: 'digitalVideo', 11: 'script', 12: 'text', 13: 'OLE',
  14: 'transition', 15: 'xtra' };
const MAIN_SIZE = 144, SPR_SIZE = 24; // D6: 6 main channels x 24 bytes, 24 bytes per sprite channel

// ---- byte helpers (payloads are big-endian; the container is little-endian) ----
const dv = (b       ) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const u16 = (b       , o        ) => dv(b).getUint16(o);
const i16 = (b       , o        ) => dv(b).getInt16(o);
const u32 = (b       , o        ) => dv(b).getUint32(o);
const i32 = (b       , o        ) => dv(b).getInt32(o);
/** Python bytes.decode('latin-1'): one char per byte (TextDecoder 'latin1' is windows-1252, which differs at 0x80-0x9F). */
function latin1(b       )         {
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return s;
}
const hex = (b       ) => Array.from(b, (x) => (x < 16 ? '0' : '') + x.toString(16)).join('');
/** Pascal string (length byte first); '' when empty. */
const pstr = (b                   ) => (b && b.length ? latin1(b.subarray(1, 1 + b[0])) : '');

// ---- container: imap -> mmap -> sections (ids match the ProjectorRays <FOURCC>-<sectionID>.bin names) ----
/** Sections keyed '<FOURCC>-<id>' with the real fourccs (ProjectorRays' dump writes `KEY*`/`CAS*` as `KEY_`/`CAS_`). */
function readSections(data       )                     {
  const tag = (o        ) => String.fromCharCode(data[o + 3], data[o + 2], data[o + 1], data[o]); // little-endian: reversed
  const le = (o        ) => dv(data).getUint32(o, true);
  if (tag(0) !== 'RIFX') throw new Error('not a little-endian Director movie (XFIR)');
  // imap chunk right after the 12-byte RIFX header: u32 version, u32 mmapOffset (little-endian)
  if (tag(12) !== 'imap') throw new Error('imap missing');
  const mmap = le(12 + 8 + 4);
  if (tag(mmap) !== 'mmap') throw new Error('mmap missing');
  // mmap: u16 headerLen, u16 entryLen(20), u32 capacity, u32 used, ...; entries: fourcc, len, offset, u16 flags, u16 unk, u32 next
  const p = mmap + 8, hdr = dv(data).getUint16(p, true), esz = dv(data).getUint16(p + 2, true), used = le(p + 8);
  const out = new Map               ();
  for (let id = 0; id < used; id++) {
    const e = p + hdr + id * esz, fc = tag(e);
    if (fc === 'free' || fc === 'junk') continue;
    const len = le(e + 4), off = le(e + 8);
    if (off + 8 + len > data.length || tag(off) !== fc) continue;
    out.set(fc + '-' + id, data.subarray(off + 8, off + 8 + len));
  }
  return out;
}
export { readSections as readChunks };

// ---- member header ----
/** CASt info: 20-byte header (dataOffset, unk1, unk2, flags, scriptId) + offset table + items. */
function readInfoList(d       )                                       {
  if (d.length < 20) return { scriptId: 0, items: [] };
  const dataOff = u32(d, 0), scriptId = u32(d, 16);
  let items          = [];
  if (d.length >= dataOff + 2) {
    const n = u16(d, dataOff);
    const offs           = [];
    for (let k = 0; k < n; k++) offs.push(u32(d, dataOff + 2 + 4 * k));
    const base = dataOff + 2 + 4 * n + 4, ilen = u32(d, dataOff + 2 + 4 * n);
    offs.push(ilen);
    items = offs.slice(0, n).map((o, k) => d.subarray(base + o, Math.max(base + o, base + offs[k + 1])));
  }
  return { scriptId, items };
}

                  
                                                                                                                           
                          
 

/** Type-specific data (Member._parse_spec in director.py). */
function parseSpec(s       , t        )      {
  if (t === 1 && s.length >= 22) {
    const pitch = u16(s, 0), top = i16(s, 2), left = i16(s, 4), bottom = i16(s, 6), right = i16(s, 8);
    const p      = { rect: [left, top, right, bottom], w: right - left, h: bottom - top, regX: i16(s, 20), regY: i16(s, 18),
      pitch: pitch & 0x3fff, bpp: 1 };
    if (s.length >= 23) p.updateFlags = s[22];
    if (pitch & 0x8000 && s.length >= 28) {
      p.bpp = s[23];
      p.clutCastLib = i16(s, 24);
      const clut = i16(s, 26);
      p.clut = clut > 0 ? clut : clut - 1; // <= 0: builtin palette, ScummVM bitmap.cpp
    }
    return p;
  }
  if (t === 8 && s.length >= 17) {
    const st = u16(s, 0);
    return { shapeType: ({ 1: 'rect', 2: 'roundRect', 3: 'oval', 4: 'line' }                          )[st] ?? st,
      rect: [i16(s, 4), i16(s, 2), i16(s, 8), i16(s, 6)], pattern: u16(s, 10), foreColor: s[12], backColor: s[13],
      filled: (s[14] & 0x40) === 0 && s[14] !== 0, fillType: s[14], lineThickness: s[15], lineDirection: s[16] };
  }
  if (t === 12 && s.length >= 28) {
    const r = [0, 2, 4, 6].map((o) => i16(s, o)), b = [8, 10, 12, 14].map((o) => i16(s, o));
    return { rect: [r[1], r[0], r[3], r[2]], boundingRect: [b[1], b[0], b[3], b[2]], antialias: s[16], cropFlags: s[17],
      antialiasFontSize: u16(s, 20), displayHeight: u16(s, 22), foreColor: [s[25], s[26], s[27]],
      bgColor: s.length >= 34 ? [u16(s, 28) >> 8, u16(s, 30) >> 8, u16(s, 32) >> 8] : null };
  }
  if ((t === 3 || t === 7) && s.length >= 20) {
    const align = i16(s, 4);
    const [top, left, bottom, right] = s.length >= 22 ? [i16(s, 14), i16(s, 16), i16(s, 18), i16(s, 20)] : [0, 0, 0, 0];
    const p      = { border: s[0], margin: s[1], boxShadow: s[2], boxType: s[3],
      alignment: ({ 0: 'left', 1: 'center', [-1]: 'right' }                          )[align] ?? align,
      bgColor: [u16(s, 6) >> 8, u16(s, 8) >> 8, u16(s, 10) >> 8], rect: [left, top, right, bottom], specHex: hex(s) };
    if (t === 7) p.buttonType = u16(s, s.length - 2);
    return p;
  }
  return s.length ? { specHex: hex(s) } : {};
}

// ---- bitmaps ----
/** BITD -> rows of palette indices (<= 8 bpp). PackBits-style RLE unless the size equals pitch*height (decode_bitd). */
function decodeBitd(data       , w        , h        , pitch        , bpp        )          {
  const need = pitch * h;
  let px       ;
  if (data.length === need) px = data;
  else {
    let out = new Uint8Array(Math.max(need, 1024)), n = 0;
    const put = (len        ) => { if (n + len > out.length) { const o2 = new Uint8Array(Math.max(out.length * 2, n + len)); o2.set(out); out = o2; } };
    let i = 0;
    while (i < data.length) {
      const c = data[i++];
      if (c & 0x80) {
        const cnt = (c ^ 0xff) + 2;
        if (i < data.length) { put(cnt); out.fill(data[i], n, n + cnt); n += cnt; }
        i++;
      } else {
        const chunk = data.subarray(i, i + c + 1);
        put(chunk.length); out.set(chunk, n); n += chunk.length;
        i += c + 1;
      }
    }
    px = out.subarray(0, n);
  }
  if (px.length < need) { const p2 = new Uint8Array(need); p2.set(px); px = p2; }
  const rows          = [];
  for (let y = 0; y < h; y++) {
    const row = px.subarray(y * pitch, (y + 1) * pitch);
    if (bpp === 8) rows.push(row.subarray(0, w));
    else if (bpp === 1 || bpp === 2 || bpp === 4) {
      const per = 8 / bpp, mask = (1 << bpp) - 1, vals = new Uint8Array(w);
      for (let x = 0; x < w; x++) vals[x] = (row[Math.floor(x / per)] >> (bpp * (per - 1 - (x % per)))) & mask;
      rows.push(vals);
    } else throw new Error('bpp ' + bpp + ' not handled');
  }
  return rows;
}

/** CLUT: 6 bytes per entry, 16-bit big-endian R, G, B; the high byte is the 8-bit value (decode_clut). */
function decodeClut(d       )                             {
  const out                             = [];
  for (let i = 0; i < d.length - 5; i += 6) out.push([d[i], d[i + 2], d[i + 4]]);
  return out;
}

/** RTE2 (anti-aliased text rendering): u16 w, h, bpp; then per-row runs (ScummVM rte.cpp). Flat RGBA like putdata. */
function decodeRte2(d       , fg          )                                                                 {
  const w = u16(d, 0), h = u16(d, 2), bpp = u16(d, 4), cmax = (1 << bpp) - 1;
  const rgba = new Uint8ClampedArray(w * h * 4);
  let i = 6, o = 0, [r, g, b] = fg;
  const push = (a        ) => { if (o < rgba.length) { rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = a; } o += 4; };
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = d[i++];
      if (c === 0x1f) { r = d[i]; g = d[i + 1]; b = d[i + 2]; i += 3; continue; }
      const a = Math.floor((c * 255) / cmax);
      if (c === 0 || c === cmax) {
        const n = d[i++];
        if (n === 0 && c === 0) { for (; x < w; x++) push(0); break; }
        for (let k = 0; k < n; k++) { push(a); x++; if (x >= w) break; }
      } else { push(a); x++; }
    }
  }
  return { w, h, bpp, rgba };
}

// ---- score ----
function parseScore(vwsc       ) {
  const d = vwsc;
  const total = u32(d, 0), ver = i32(d, 4), listStart = u32(d, 8);
  const nEntries = u32(d, listStart), listSize = u32(d, listStart + 4);
  const indexStart = listStart + 12, dataOff = indexStart + listSize * 4;
  const offs           = [];
  for (let k = 0; k < nEntries; k++) offs.push(dataOff + u32(d, indexStart + 4 * k));
  const entry = (k        )               => (k >= 0 && k < nEntries - 1 && offs[k + 1] > offs[k] ? d.subarray(offs[k], offs[k + 1]) : null);
  // Entry 0: frame data; entry 1: sprite order list; then per sprite-detail triples (spriteInfo, behaviors, name)
  // referenced by spriteListIdx (ScummVM Score::loadFrames).
  const f = entry(0) ;
  const fsize = u32(f, 0), nframesHdr = u32(f, 8), fver = u16(f, 12), recSize = u16(f, 14), nchan = u16(f, 16);
  if (recSize !== SPR_SIZE) throw new Error('sprite record size ' + recSize);
  const buf = new Uint8Array(MAIN_SIZE + SPR_SIZE * nchan);
  const frames          = [];
  let pos = 20;
  while (pos < fsize) {
    const size = u16(f, pos);
    if (size === 0) break;
    const end = pos + size;
    let p = pos + 2;
    while (p < end) {
      const csize = u16(f, p), coff = u16(f, p + 2);
      buf.set(f.subarray(p + 4, p + 4 + csize), coff);
      p += 4 + csize;
    }
    pos = end;
    frames.push(buf.slice());
  }
  const details = new Map               ();
  const behaviors = (idx        )        => {
    if (!idx) return [];
    const cached = details.get(idx);
    if (cached) return cached;
    const out        = [];
    const b = entry(idx + 1);
    if (b) {
      for (let k = 0; k < b.length - 7; k += 8) {
        const beh      = { castLib: i16(b, k), member: i16(b, k + 2) };
        const init = u32(b, k + 4);
        if (init) { const s = entry(init); beh.params = s ? latin1(s.subarray(0, s.indexOf(0) < 0 ? s.length : s.indexOf(0))) : ''; }
        out.push(beh);
      }
    }
    details.set(idx, out);
    return out;
  };
  const outFrames        = [];
  frames.forEach((b, n) => {
    const fr      = { frame: n + 1 };
    const script = u16(b, 2);
    if (script) fr.script = script;
    const sidx = u32(b, 4);
    if (sidx) fr.scriptBehaviors = behaviors(sidx);
    // D6 tempo channel: the byte is a command, its argument is the i16 at +4 (score.md)
    const tempo = b[24 + 6];
    if (tempo) fr.tempo = tempo;
    const cue = i16(b, 24 + 4);
    if (cue) fr.tempoCuePoint = cue;
    const trans = u16(b, 48 + 2);
    if (trans) fr.transition = trans;
    const s2 = u16(b, 72 + 2), s1 = u16(b, 96 + 2);
    if (s1) fr.sound1 = s1;
    if (s2) fr.sound2 = s2;
    const pal = b.subarray(120, 144), palId = i16(pal, 2);
    if (palId) fr.palette = { member: palId, castLib: i16(pal, 0), speed: pal[4], flags: pal[5], firstColor: pal[6],
      lastColor: pal[7], frameCount: u16(pal, 8), cycleCount: u16(pal, 10) };
    const sprites        = [];
    for (let ch = 1; ch <= nchan; ch++) {
      const s = b.subarray(MAIN_SIZE + (ch - 1) * SPR_SIZE, MAIN_SIZE + ch * SPR_SIZE);
      const member = u16(s, 6);
      if (!member && !s.some((x) => x)) continue;
      const ink = s[1];
      const sp      = { ch, member, castLib: i16(s, 4), type: s[0], ink: ink & 0x3f, trails: !!(ink & 0x40), stretch: !!(ink & 0x80),
        fore: s[2], back: s[3], y: i16(s, 12), x: i16(s, 14), h: i16(s, 16), w: i16(s, 18), colorcode: s[20], blend: s[21], thickness: s[22] };
      const idx = u32(s, 8);
      if (idx) { sp.listIdx = idx; sp.behaviors = behaviors(idx); }
      sprites.push(sp);
    }
    fr.sprites = sprites;
    outFrames.push(fr);
  });
  const header = { totalSize: total, version: ver, detailEntries: nEntries, framesSize: fsize, framesHeaderCount: nframesHdr,
    framesVersion: fver, spriteRecordSize: recSize, channels: nchan };
  return { header, frames: outFrames };
}

/** VWLB: u16 count; (count+1) x (u16 frame, u16 textOffset); text. A label's text is 'name' optionally followed by '\r' and a comment. */
function readLabels(d                   )        {
  if (!d || !d.length) return [];
  const n = u16(d, 0), ents             = [];
  for (let k = 0; k <= n; k++) ents.push([u16(d, 2 + 4 * k), u16(d, 4 + 4 * k)]);
  const base = 2 + 4 * (n + 1), out        = [];
  for (let k = 0; k < n; k++) {
    const text = latin1(d.subarray(base + ents[k][1], Math.max(base + ents[k][1], base + ents[k + 1][1])));
    const i = text.indexOf('\r');
    out.push({ frame: ents[k][0], name: i < 0 ? text : text.slice(0, i), comment: i < 0 ? '' : text.slice(i + 1) });
  }
  return out;
}

// ---- main ----
export function convertMovie(name        , data             )                 {
  const sections = readSections(new Uint8Array(data));
  const first = (fc        )                    => {
    let best = -1;
    for (const k of sections.keys()) if (k.startsWith(fc + '-')) { const id = +k.slice(5); if (best < 0 || id < best) best = id; }
    return best < 0 ? undefined : sections.get(fc + '-' + best);
  };
  const chunk = (fc        , id        ) => sections.get(fc + '-' + id);

  // DRCF (movie config, big-endian)
  const dr = first('DRCF') ;
  const top = i16(dr, 4), left = i16(dr, 6), bottom = i16(dr, 8), right = i16(dr, 10), minM = i16(dr, 12), maxM = i16(dr, 14);
  const config = { stageRect: [left, top, right, bottom], stageW: right - left, stageH: bottom - top, minMember: minM, maxMember: maxM,
    stageColor: i16(dr, 26), bitDepth: i16(dr, 28), directorVersion: '0x' + u16(dr, 36).toString(16), frameRate: i16(dr, 54), platform: i16(dr, 56) };

  // KEY_ (little-endian): owner (CASt section id) -> child chunks
  const kd = first('KEY*') , kv = dv(kd), used = kv.getUint32(8, true);
  const key = new Map                            ();
  for (let i = 0; i < used; i++) {
    const sid = kv.getUint32(12 + i * 12, true), owner = kv.getUint32(16 + i * 12, true);
    const o = 20 + i * 12, fc = String.fromCharCode(kd[o + 3], kd[o + 2], kd[o + 1], kd[o]);
    if (!key.has(owner)) key.set(owner, []);
    key.get(owner) .push([fc, sid]);
  }
  const child = (m        , fc        )                    => {
    for (const [f, sid] of key.get(m.sid) ?? []) if (f === fc) return chunk(f, sid);
    return undefined;
  };

  // CAS_: u32 CASt section ids; index i is member number i + minMember; 0 = empty slot
  const cas = first('CAS*') , members = new Map                (), cv = dv(cas);
  for (let i = 0; i < (cas.length >> 2); i++) {
    const sid = cv.getUint32(i * 4);
    if (!sid) continue;
    const d = chunk('CASt', sid) , type = u32(d, 0), il = u32(d, 4), sl = u32(d, 8);
    const { scriptId, items } = readInfoList(d.subarray(12, 12 + il));
    const spec = d.subarray(12 + il, 12 + il + sl);
    members.set(i + minM, { num: i + minM, sid, type, typeName: MEMBER_TYPES[type] ?? 'type' + type, scriptId,
      name: pstr(items[1]), path: pstr(items[2]), filename: pstr(items[3]), props: parseSpec(spec, type), spec });
  }

  // export_cast.py export()
  const palettes                                             = {};
  const pal = new Map                                    ();
  for (const m of members.values()) if (m.type === 4) { const p = decodeClut(child(m, 'CLUT') ); pal.set(m.num, p); palettes[String(m.num)] = p; }
  const images = new Map                   ();
  const rows        = [];
  for (const m of [...members.values()].sort((a, b) => a.num - b.num)) {
    const rec      = { num: m.num, type: m.typeName, name: m.name, sectionId: m.sid };
    if (m.path || m.filename) { rec.path = m.path; rec.filename = m.filename; }
    if (m.scriptId) rec.scriptId = m.scriptId;
    for (const [k, v] of Object.entries(m.props)) if (k !== 'specHex' || (m.type !== 1 && m.type !== 12)) rec[k] = v;
    if (m.type === 11) {
      rec.scriptType = ({ 1: 'score', 3: 'movie', 7: 'parent' }                          )[u16(m.spec, 0)] ?? hex(m.spec);
    }
    if (m.type === 1) {
      const p = m.props                                                                       ;
      const d = child(m, 'BITD');
      if (!d || p.w <= 0 || p.h <= 0) rec.file = null;
      else {
        const w = p.w, h = p.h, rgba = new Uint8ClampedArray(w * h * 4);
        if (p.bpp === 32) {
          // D6 32-bit rows are planar: pad/alpha, R, G, B (ScummVM images.cpp)
          const rws = decodeBitd(d, w * 4, h, p.pitch, 8);
          for (let y = 0, o = 0; y < h; y++) for (let x = 0; x < w; x++, o += 4) {
            const r = rws[y]; rgba[o] = r[x + w]; rgba[o + 1] = r[x + 2 * w]; rgba[o + 2] = r[x + 3 * w]; rgba[o + 3] = 255;
          }
        } else {
          const rws = decodeBitd(d, w, h, p.pitch, p.bpp);
          // 1-bit: index 0 = white, 1 = black; else the member's palette; indices beyond it are black
          const pl = p.bpp === 1 ? [[255, 255, 255], [0, 0, 0]] : pal.get(p.clut          ) ?? Array.from({ length: 256 }, (_, i) => [i, i, i]);
          let o = 0;
          for (const r of rws) for (let x = 0; x < r.length && o < rgba.length; x++, o += 4) {
            const c = pl[r[x]] ?? [0, 0, 0]; rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
          }
          // putdata with fewer pixels than w*h leaves the rest index 0
          for (; o < rgba.length; o += 4) { const c = pl[0] ?? [0, 0, 0]; rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255; }
        }
        rec.file = m.num + '.png';
        images.set(rec.file          , { w, h, rgba });
      }
    } else if (m.type === 12) {
      const t = child(m, 'RTE1');
      rec.text = t ? latin1(t) : '';
      const r2 = child(m, 'RTE2');
      if (r2) {
        const fg = (m.props.foreColor                        ) ?? [0, 0, 0];
        const { w, h, bpp, rgba } = decodeRte2(r2, fg);
        rec.rte2 = { w, h, bpp, file: m.num + '_text.png' };
        images.set(m.num + '_text.png', { w, h, rgba });
      }
    } else if (m.type === 3 || m.type === 7) {
      const t = child(m, 'STXT');
      if (t) {
        const hl = u32(t, 0), tl = u32(t, 4), sl = u32(t, 8);
        rec.text = latin1(t.subarray(hl, hl + tl));
        rec.stxtStylesHex = hex(t.subarray(hl + tl, hl + tl + sl));
      }
    } else if (m.type === 4) rec.colors = pal.get(m.num) .length;
    rows.push(rec);
  }
  const cast = { movie: name, config, members: rows }                       ;

  // export_score.py
  const { header, frames } = parseScore(first('VWSC') );
  const score = { movie: name, header, labels: readLabels(first('VWLB')), frames }                        ;
  return { cast, score, palettes, images };
}
