// Movie data from the Phase 2 exports (tools/export_cast.py -> cast.json, tools/export_score.py ->
// score.json; formats: decomp/formats/cast.md, decomp/formats/score.md).
                                    
import { LPoint } from './lingo.js';

                             
                                          
                                                                                                
                                                    
                                                                                               
                                         
 
                           
                
                                                                                    
                        
 
                             
                                                                         
                                                                                        
                                                                          
 
                            
                                                                                               
                                                                 
 
                                                                                                                 

export const NUM_CHANNELS = 120;

/** A cast member as Lingo sees it (`member n`, `member "name"`). */
export class Member {
           movie       ;
           data            ;
  name        ;
  /** Current reg point relative to the image's top-left (`the regPoint` can be set). */
  regH        ; regV        ;
  /** Decoded image (bitmap or text RTE2 rendering), set by the loader. */
  image                                                            = null;
  /** Digital video: `the duration of member` in ticks (from the original AVI, import/video.ts). */
  duration = 0;
  constructor(movie       , d            ) {
    this.movie = movie;
    this.data = d;
    this.name = d.name ?? '';
    const r = d.rect ?? [0, 0, 0, 0];
    if (d.type === 'bitmap') { this.regH = (d.regX ?? 0) - r[0]; this.regV = (d.regY ?? 0) - r[1]; }
    else if (d.type === 'digitalVideo') { this.regH = this.width / 2; this.regV = this.height / 2; } // reg = centre (video.md)
    else { this.regH = 0; this.regV = 0; } // text/field: top-left
  }
  /** `the regPoint of member` (relative to the image's top-left); settable (GM03 MovieScript 15). */
  get regPoint()         { return new LPoint(this.regH, this.regV); }
  set regPoint(p        ) { this.regH = p.locH; this.regV = p.locV; }
  get number()         { return this.data.num; }
  get memberNum()         { return this.data.num; }
  get type()         { return this.data.type; }
  get width()         {
    const d = this.data;
    if (d.type === 'digitalVideo') return 240; // MAIN #73 rect 240x180 (cast.md)
    if (d.rect) return d.rect[2] - d.rect[0];
    return d.w ?? 0;
  }
  get height()         {
    const d = this.data;
    if (d.type === 'digitalVideo') return 180;
    if (d.rect) return d.rect[3] - d.rect[1];
    return d.h ?? 0;
  }
}

export class Movie {
           name        ;
           cast          ;
           score           ;
           palette       ;
           members = new Map                ();
           frameCount        ;
  /** spans[ch][frame-1]: id of the sprite span (ch 0 = frame script); -1 = empty. */
          spans               = [];
          frames             ;
          sprites                                ;
  /** Tempo in effect in each frame (D6 tempo command 246 keeps its value; DRCF default first). */
           tempo          ;

  constructor(name        , cast          , score           , palette       ) {
    this.name = name;
    this.cast = cast;
    this.score = score;
    this.palette = palette;
    for (const m of cast.members) this.members.set(m.num, new Member(this, m));
    this.frames = score.frames.slice().sort((a, b) => a.frame - b.frame);
    this.frameCount = this.frames.length ? this.frames[this.frames.length - 1].frame : 0;
    const byFrame              = new Array(this.frameCount);
    for (const f of this.frames) byFrame[f.frame - 1] = f;
    this.frames = Array.from(byFrame, (f, i) => f ?? { frame: i + 1 });
    this.sprites = this.frames.map((f) => new Map((f.sprites ?? []).map((s) => [s.ch, s])));
    this.tempo = [];
    let fps = cast.config.frameRate;
    for (const f of this.frames) {
      if (f.tempo === 246 && f.tempoCuePoint) fps = f.tempoCuePoint;
      else if (f.tempo && f.tempo !== 246) console.warn('[score] unsupported tempo command', f.tempo, 'in frame', f.frame);
      this.tempo.push(fps);
    }
    this.buildSpans();
  }

          buildSpans()       {
    let next = 1;
    for (let ch = 0; ch <= NUM_CHANNELS; ch++) {
      const arr = new Int32Array(this.frameCount).fill(-1);
      let prevKey = '';
      for (let f = 0; f < this.frameCount; f++) {
        let key = '';
        if (ch === 0) { const s = this.frames[f].script; key = s ? 'S' + s : ''; }
        else {
          const sp = this.sprites[f].get(ch);
          if (sp && sp.member) key = sp.listIdx ? 'L' + sp.listIdx : 'M' + sp.member + '/' + sp.ink;
        }
        if (key === '') { prevKey = ''; continue; }
        if (key !== prevKey) next++;
        arr[f] = next;
        prevKey = key;
      }
      this.spans.push(arr);
    }
  }

  frame(n        )            { return this.frames[n - 1]; }
  sprite(n        , ch        )                         { return this.sprites[n - 1]?.get(ch); }
  spanId(ch        , n        )         { return n >= 1 && n <= this.frameCount ? this.spans[ch][n - 1] : -1; }

  /** Frame of a label (Director labels match case-insensitively), 0 if none. */
  label(name        )         {
    const l = this.score.labels.find((x) => x.name.toLowerCase() === name.toLowerCase());
    return l ? l.frame : 0;
  }
  member(ref                 )                     {
    if (typeof ref === 'number') return this.members.get(ref);
    const lc = ref.toLowerCase();
    for (const m of this.members.values()) if (m.name.toLowerCase() === lc) return m;
    return undefined;
  }
}
