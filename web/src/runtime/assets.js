// The virtual file system of the original CD (decomp/notes/runtime.md, "Files"), read from the
// player's own copy (port/src/import/sources.ts): movies converted in the browser
// (import/director.ts), sounds and text decoded per movie, the logo video decoded (import/video.ts).
                                                    
import { convertMovie,                     } from '../import/director.js';
                                                     
import { decodeVideo,                } from '../import/video.js';

/** Root of the virtual CD; `the pathName` is VIRTUAL_ROOT + "LOCAL\". */
export const VIRTUAL_ROOT = 'D:\\RCKSETUP\\';
export const PATH_NAME = VIRTUAL_ROOT + 'LOCAL\\';

/** Lingo/Windows path -> file key (case-insensitive, `\` -> `/`, `..` resolved). */
export function normalizePath(p        )         {
  let s = p.replace(/\\/g, '/').toLowerCase();
  const root = VIRTUAL_ROOT.replace(/\\/g, '/').toLowerCase();
  if (s.startsWith(root)) s = s.substring(root.length);
  else if (/^[a-z]:\//.test(s)) s = s.substring(3);
  const out           = [];
  for (const part of s.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return out.join('/');
}

/** Audio/text that must be decoded before a movie starts, so `dsNewSound` and `readTextFile`
 * stay synchronous like the original. Folders from MAIN APPSETTINGS `initAppSettings`
 * (#INTRO_/#MNU_/#OPT_/#FEnn_PATH_* and *_FILE_MUSIC), checked against the ported movies (Phase 6):
 * GM02..GM05's EC character reads #FE01_PATH_SNDFX (RCZF_*.wav from GM01's folder). A file that is
 * not preloaded logs a warning instead of playing. */
export const PRELOAD                           = {
  MAIN: ['data/dref.ini'], // MAIN CheckScript ReadINI
  INTRO: ['local/data2/'],
  MENU: ['local/data2/music_mn.wav', 'data/fe_00/'],
  GM01: ['local/data2/music_g1.wav', 'data/fe_01/'],
  GM02: ['local/data2/music_g2.wav', 'data/fe_02/', 'data/fe_01/audio/sndfx/'],
  GM03: ['local/data2/music_g3.wav', 'data/fe_03/', 'data/fe_01/audio/sndfx/'],
  GM04: ['local/data2/music_g4.wav', 'data/fe_04/', 'data/fe_01/audio/sndfx/'],
  GM05: ['local/data2/music_g5.wav', 'data/fe_05/', 'data/fe_01/audio/sndfx/'],
};

/** Files the original CD lacks, decoded from an identical file elsewhere on the CD
 * (DEVIATIONS.md "GM05: Redcat's missing word recordings"). GM05's voice.cpd lists Redcat's word
 * recordings `WL\05RC<word><A|B>.wav`, but the CD has only 21 of the 308 (the original stays
 * silent while Redcat's mouth moves). GM02 has all 308 as `02RC...`: each of GM05's 637 word files
 * that does exist is byte-identical to its GM02 twin, and all 924 cue lists are the same. */
const STAND_INS                                                                                 = {
  GM05: [{ source: /^data\/fe_02\/audio\/voicem\/wl\/02rc(\d{3}[ab])\.wav$/, missing: (m) => `data/fe_05/audio/voice/wl/05rc${m[1]}.wav` }],
};

export class Assets {
           cd          ;
  /** Normalised path -> original spelling of the files `getNthFileNameInFolder` and the Xtras see
   * (the movies are opened by the player, not listed). */
           files = new Map                ();
          audio = new Map                     ();
          text = new Map                ();
          videos = new Map                                   ();
          audioCtx                     ;

  constructor(cd          , audioCtx                     ) {
    this.cd = cd;
    this.audioCtx = audioCtx;
    for (const [k, n] of cd.names) if (!k.endsWith('.dxr')) this.files.set(k, n);
  }

  /** A movie's cast, score, palettes and images, converted from `LOCAL/<name>.dxr`. */
  async movie(name        )                          {
    return convertMovie(name, await this.cd.read('local/' + name.toLowerCase() + '.dxr'));
  }

  exists(lingoPath        )          { return this.files.has(normalizePath(lingoPath)); }

  /** Names (original spelling) of the files and folders directly in a folder, sorted like a CD
   * directory (ISO 9660 order). TODO(faithful): whether D6 `getNthFileNameInFolder` lists folders. */
  listFolder(lingoPath        )           {
    const dir = normalizePath(lingoPath);
    const pre = dir === '' ? '' : dir + '/';
    const names = new Map                ();
    for (const [k, n] of this.files) {
      if (!k.startsWith(pre)) continue;
      const parts = n.split('/');
      const name = parts[pre === '' ? 0 : dir.split('/').length];
      if (name !== undefined) names.set(name.toLowerCase(), name);
    }
    return [...names.values()].sort((a, b) => (a.toUpperCase() < b.toUpperCase() ? -1 : a.toUpperCase() > b.toUpperCase() ? 1 : 0));
  }

  /** Decodes the audio and text files of `movie`'s preload group; drops the other groups. */
  async preload(movie        , onProgress                                        )                {
    const prefixes = PRELOAD[movie] ?? [];
    const wanted = [...this.files.keys()].filter((k) => prefixes.some((p) => k === p || (p.endsWith('/') && k.startsWith(p))));
    const standIns = new Map                (); // missing file -> the file decoded in its place
    for (const si of STAND_INS[movie] ?? []) {
      for (const k of this.files.keys()) {
        const m = si.source.exec(k);
        if (m && !this.files.has(si.missing(m))) standIns.set(si.missing(m), k);
      }
    }
    wanted.push(...standIns.keys());
    const want = new Set(wanted);
    for (const k of this.audio.keys()) if (!want.has(k)) this.audio.delete(k);
    for (const k of this.text.keys()) if (!want.has(k)) this.text.delete(k);
    const isText = (k        )          => k.endsWith('.cpd') || k.endsWith('.ini');
    const todo = wanted.filter((k) => (k.endsWith('.wav') && !this.audio.has(k)) || (isText(k) && !this.text.has(k)));
    let done = 0;
    const work = async (k        )                => {
      const buf = await this.cd.read(standIns.get(k) ?? k);
      if (isText(k)) this.text.set(k, new TextDecoder('windows-1252').decode(buf));
      else if (this.audioCtx) this.audio.set(k, await this.audioCtx.decodeAudioData(buf));
      onProgress?.(++done, todo.length);
    };
    // A few parallel reads; decodeAudioData runs off the main thread.
    const queue = todo.slice();
    await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await work(queue.shift() ); }));
  }

  /** Decoded audio for `dsNewSound`, or null (missing on the CD -> the Xtra returns 0). */
  sound(lingoPath        )                     {
    const k = normalizePath(lingoPath);
    const b = this.audio.get(k);
    if (b) return b;
    if (this.files.has(k)) console.warn('[assets] sound exists but was not preloaded:', lingoPath);
    return null;
  }

  /** Text of a file for `readTextFile` (Windows-1252), or '' if missing. */
  textFile(lingoPath        )         {
    const k = normalizePath(lingoPath);
    const t = this.text.get(k);
    if (t !== undefined) return t;
    if (this.files.has(k)) console.warn('[assets] text file exists but was not preloaded:', lingoPath);
    return '';
  }

  /** A digital video file decoded (frames and sound), or null when the CD has no such file. */
  video(lingoPath        )                            {
    const k = normalizePath(lingoPath);
    let v = this.videos.get(k);
    if (!v) {
      v = this.files.has(k) ? this.cd.read(k).then((b) => decodeVideo(b, this.audioCtx)) : Promise.resolve(null);
      this.videos.set(k, v);
    }
    return v;
  }
}
