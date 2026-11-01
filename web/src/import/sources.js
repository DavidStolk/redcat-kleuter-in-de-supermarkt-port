// The player's own copy of the CD, read in the browser (README.md "Game data"). A source maps
// the files under RCKSETUP (normalised: lower case, `/`) to their original spelling and reads
// them on demand. Sources: a picked folder (or dropped one), a .zip, an .iso (ISO 9660/Joliet),
// the browser's storage (store.ts) and, for development, a URL (tools/serve.mjs `/cd/`).

                           
                                                                                                         
                                      
                                          
 

/** The movies the runtime plays (RCK1.exe's start movie only does `go(1, "MAIN")`). */
export const MOVIES = ['MAIN', 'INTRO', 'MENU', 'GM01', 'GM02', 'GM03', 'GM04', 'GM05'];

/** Files the game reads: the movies, DREF.ini, voice.cpd lists, all WAVs and the logo video, and
 * the projector RCK1.exe for its icon only (import/icon.ts). The Xtras and installers are not needed. */
export function isGameFile(key        )          {
  if (/\.(wav|cpd|ini)$/.test(key)) return true;
  if (key === 'local/dxs3.avi' || key === 'local/rck1.exe') return true;
  return MOVIES.some((m) => key === 'local/' + m.toLowerCase() + '.dxr');
}

/** Files that must be present (README.md lists them): the missing ones, empty when complete. */
export function missingFiles(names                     )           {
  const need = [...MOVIES.map((m) => 'LOCAL/' + m + '.dxr'), 'LOCAL/Dxs3.avi', 'DATA/DREF.ini',
    'LOCAL/Data2/MUSIC_IN.wav', 'LOCAL/Data2/MUSIC_MN.wav',
    ...[1, 2, 3, 4, 5].map((n) => 'LOCAL/Data2/MUSIC_G' + n + '.wav')];
  const out = need.filter((p) => !names.has(p.toLowerCase()));
  // The six game folders (Fe_00 = menu) with their voice lists.
  for (let n = 0; n <= 5; n++) {
    const pre = 'data/fe_0' + n + '/';
    if (![...names.keys()].some((k) => k.startsWith(pre) && k.endsWith('voice.cpd'))) out.push('DATA/FE_0' + n + '/.../voice.cpd');
  }
  return out;
}

                                                                  

/** Finds RCKSETUP in a list of paths (the folder holding `LOCAL/MAIN.dxr`; the CD root, the
 * RCKSETUP folder itself or any folder above it may be picked) and keeps the game files. */
function rooted(entries         )                  {
  const norm = (p        )         => p.replace(/\\/g, '/').replace(/^\/+/, '');
  let root                = null;
  for (const e of entries) {
    const p = norm(e.path);
    if (/(^|\/)__macosx\//i.test(p)) continue;
    const m = /^(.*?)local\/main\.dxr$/i.exec(p);
    if (m && (m[1] === '' || m[1].endsWith('/')) && (root === null || m[1].length < root.length)) root = m[1];
  }
  if (root === null) return null;
  const names = new Map                ();
  const readers = new Map                                    ();
  for (const e of entries) {
    const p = norm(e.path);
    if (p.length <= root.length || p.substring(0, root.length).toLowerCase() !== root.toLowerCase()) continue;
    const rel = p.substring(root.length);
    const key = rel.toLowerCase();
    if (!isGameFile(key) || names.has(key)) continue;
    names.set(key, rel);
    readers.set(key, e.read);
  }
  return { names, read: (k) => { const r = readers.get(k); return r ? r() : Promise.reject(new Error('not on the CD: ' + k)); } };
}

/** Picked files: a folder (`webkitdirectory`, `webkitRelativePath`), dropped files and folders
 * (`path` set by `fromDrop`), or a single .zip/.iso. */
export async function fromFiles(files                                 )                           {
  if (files.length === 1) {
    const f = files[0];
    const head = new Uint8Array(await f.slice(0, 4).arrayBuffer());
    if (head[0] === 0x50 && head[1] === 0x4b) return fromZip(f);
    if (f.size > 0x8006) {
      const id = new TextDecoder().decode(await f.slice(0x8001, 0x8006).arrayBuffer());
      if (id === 'CD001') return fromIso(f);
    }
  }
  return rooted(files.map((f) => ({ path: f.path ?? (f.webkitRelativePath || f.name), read: () => f.arrayBuffer() })));
}

/** Files and folders dropped on the page (desktop browsers). */
export async function fromDrop(dt              )                           {
                                                                                         
                                                                      
                                                                                                             
  const roots            = [];
  for (const it of Array.from(dt.items)) {
    const e = (it                                                                  ).webkitGetAsEntry?.();
    if (e) roots.push(e);
  }
  if (roots.length === 0) return fromFiles(Array.from(dt.files));
  const out                                  = [];
  const walk = async (e         )                => {
    if (e.isFile) {
      const f = await new Promise      ((ok, err) => e.file (ok, err))                            ;
      f.path = e.fullPath;
      out.push(f);
    } else if (e.isDirectory) {
      const reader = e.createReader ();
      for (;;) {
        const batch = await new Promise           ((ok, err) => reader.readEntries(ok, err));
        if (batch.length === 0) break;
        for (const c of batch) await walk(c);
      }
    }
  };
  for (const e of roots) await walk(e);
  return fromFiles(out);
}

// ---- ZIP (PKWARE APPNOTE 4.3: central directory, stored/deflate, Zip64) ----------------------
export async function fromZip(file      )                           {
  const tailLen = Math.min(file.size, 65557);
  const tail = new DataView(await file.slice(file.size - tailLen).arrayBuffer());
  let eocd = -1;
  for (let i = tailLen - 22; i >= 0; i--) if (tail.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Geen geldig .zip-bestand.');
  let count = tail.getUint16(eocd + 10, true);
  let cdSize = tail.getUint32(eocd + 12, true);
  let cdOff = tail.getUint32(eocd + 16, true);
  if (eocd >= 20 && tail.getUint32(eocd - 20, true) === 0x07064b50) {
    const z64 = Number(tail.getBigUint64(eocd - 12, true));
    const d = new DataView(await file.slice(z64, z64 + 56).arrayBuffer());
    count = Number(d.getBigUint64(32, true));
    cdSize = Number(d.getBigUint64(40, true));
    cdOff = Number(d.getBigUint64(48, true));
  }
  const cd = new DataView(await file.slice(cdOff, cdOff + cdSize).arrayBuffer());
  const entries          = [];
  let p = 0;
  for (let i = 0; i < count && cd.getUint32(p, true) === 0x02014b50; i++) {
    const flags = cd.getUint16(p + 8, true), method = cd.getUint16(p + 10, true);
    let csize = cd.getUint32(p + 20, true), local = cd.getUint32(p + 42, true);
    const usize32 = cd.getUint32(p + 24, true);
    const nl = cd.getUint16(p + 28, true), xl = cd.getUint16(p + 30, true), cl = cd.getUint16(p + 32, true);
    const nameBytes = new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nl);
    // Bit 11: UTF-8 names; otherwise CP437 (the CD's names are ASCII).
    const name = (flags & 0x800) ? new TextDecoder().decode(nameBytes) : String.fromCharCode(...nameBytes);
    // Zip64 extra field: the 0xFFFFFFFF sizes/offset follow in this order.
    for (let x = p + 46 + nl; x < p + 46 + nl + xl;) {
      const id = cd.getUint16(x, true), len = cd.getUint16(x + 2, true);
      if (id === 0x0001) {
        let q = x + 4;
        if (usize32 === 0xffffffff) q += 8;
        if (csize === 0xffffffff) { csize = Number(cd.getBigUint64(q, true)); q += 8; }
        if (local === 0xffffffff) local = Number(cd.getBigUint64(q, true));
      }
      x += 4 + len;
    }
    p += 46 + nl + xl + cl;
    if (name.endsWith('/')) continue;
    if (method !== 0 && method !== 8) throw new Error('Niet ondersteunde zip-compressie in ' + name);
    entries.push({ path: name, read: async () => {
      const h = new DataView(await file.slice(local, local + 30).arrayBuffer());
      const start = local + 30 + h.getUint16(26, true) + h.getUint16(28, true);
      const data = file.slice(start, start + csize);
      if (method === 0) return data.arrayBuffer();
      return new Response(data.stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    } });
  }
  return rooted(entries);
}

// ---- ISO 9660 (ECMA-119) with Joliet names ---------------------------------------------------
export async function fromIso(file      )                           {
  const S = 2048;
  const sector = async (lba        , n = 1)                    => new DataView(await file.slice(lba * S, (lba + n) * S).arrayBuffer());
  // Volume descriptors from sector 16: 1 = primary, 2 = supplementary (Joliet: escape %/@, %/C, %/E).
  let root                                                        = null;
  for (let lba = 16; lba < 64; lba++) {
    const d = await sector(lba);
    const type = d.getUint8(0);
    if (type === 255) break;
    const rec = { lba: d.getUint32(156 + 2, true), size: d.getUint32(156 + 10, true) };
    const esc = String.fromCharCode(d.getUint8(88), d.getUint8(89), d.getUint8(90));
    if (type === 2 && /^%\/[@CE]$/.test(esc)) { root = { ...rec, joliet: true }; break; }
    if (type === 1 && !root) root = { ...rec, joliet: false };
  }
  if (!root) throw new Error('Geen geldig .iso-bestand.');
  const joliet = root.joliet;
  const entries          = [];
  const walk = async (lba        , size        , dir        , depth        )                => {
    if (depth > 16) return;
    const d = await sector(lba, Math.ceil(size / S));
    for (let p = 0; p < size;) {
      const len = d.getUint8(p);
      if (len === 0) { p = (Math.floor(p / S) + 1) * S; continue; } // records do not cross sectors
      const ext = d.getUint32(p + 2, true), sz = d.getUint32(p + 10, true), flags = d.getUint8(p + 25);
      const nl = d.getUint8(p + 32);
      const raw = new Uint8Array(d.buffer, d.byteOffset + p + 33, nl);
      p += len;
      if (nl === 1 && raw[0] <= 1) continue; // "." and ".."
      let name = '';
      if (joliet) for (let i = 0; i + 1 < nl; i += 2) name += String.fromCharCode((raw[i] << 8) | raw[i + 1]);
      else name = String.fromCharCode(...raw);
      name = name.replace(/;\d+$/, '').replace(/\.$/, '');
      if (flags & 2) await walk(ext, sz, dir + name + '/', depth + 1);
      else entries.push({ path: dir + name, read: () => file.slice(ext * S, ext * S + sz).arrayBuffer() });
    }
  };
  await walk(root.lba, root.size, '', 0);
  return rooted(entries);
}

// ---- development: tools/serve.mjs serves cd/RCKSETUP at /cd/ with a listing at /cd/?list ----
export async function fromUrl(base        )                           {
  const b = base.endsWith('/') ? base : base + '/';
  const list = await (await fetch(b + '?list')).json()            ;
  return rooted(list.map((p) => ({ path: p, read: async () => {
    const r = await fetch(b + p.split('/').map(encodeURIComponent).join('/'));
    if (!r.ok) throw new Error('missing ' + p);
    return r.arrayBuffer();
  } })));
}
