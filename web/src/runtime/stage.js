// The 640x480 stage: canvas scaled to fit the window, sprite drawing with the game's inks
// (decomp/notes/runtime.md, "Sprites and inks").
import { applyMask, backgndTrans, colorize1bit, INK_BACKGND_TRANS, INK_COPY, INK_MATTE, matteMask, opaque,          } from './ink.js';
                                         

export const STAGE_W = 640;
export const STAGE_H = 480;

/** What the stage needs to draw one sprite channel. */
                             
                 
                             
                                          
 

                                                  
function makeCanvas(w        , h        )         {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, w), Math.max(1, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, w); c.height = Math.max(1, h);
  return c;
}

export class Stage {
           canvas                   ;
          ctx                          ;
          cache = new Map                ();
          masks = new Map                    ();
  /** Stage colour (DRCF stage color index 255 = black in every movie palette). */
  stageColor      = [0, 0, 0];

  constructor(container             ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = STAGE_W;
    this.canvas.height = STAGE_H;
    this.canvas.className = 'stage';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') ;
    this.ctx.imageSmoothingEnabled = false;
    const fit = ()       => {
      const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
      this.canvas.style.width = Math.floor(STAGE_W * s) + 'px';
      this.canvas.style.height = Math.floor(STAGE_H * s) + 'px';
    };
    window.addEventListener('resize', fit);
    // Tablets: turning the device or entering full screen does not always fire resize at once.
    window.addEventListener('orientationchange', () => setTimeout(fit, 100));
    document.addEventListener('fullscreenchange', fit);
    fit();
  }

  /** Window coordinates -> stage coordinates. */
  toStage(clientX        , clientY        )                   {
    const r = this.canvas.getBoundingClientRect();
    return [Math.floor((clientX - r.left) * STAGE_W / r.width), Math.floor((clientY - r.top) * STAGE_H / r.height)];
  }

  /** Drop cached ink renderings (on a movie change: other members, other palette). */
  clearCache()       { this.cache.clear(); this.masks.clear(); }

  /** Top-left of a sprite on the stage: loc minus the member's reg point. */
  static topLeft(s                                                )                   {
    return [s.locH - s.member.regH, s.locV - s.member.regV];
  }

  /** Matte of a bitmap member (1 = inside), for matte-ink hit testing. */
  matte(m        , palette       )                    {
    if (m.type !== 'bitmap' || !m.image) return null;
    let mask = this.masks.get(m);
    if (!mask) {
      const px = this.pixels(m, 255, 0, palette);
      mask = matteMask(px.data, px.width, px.height);
      this.masks.set(m, mask);
    }
    return mask;
  }

          pixels(m        , fore        , back        , palette       )            {
    const w = m.width, h = m.height;
    const c = makeCanvas(w, h);
    const cx = c.getContext('2d')                            ;
    cx.drawImage(m.image , 0, 0);
    const img = cx.getImageData(0, 0, w, h);
    if (m.data.bpp === 1) colorize1bit(img.data, palette[fore] ?? [0, 0, 0], palette[back] ?? [255, 255, 255]);
    if (m.data.bpp === 32) opaque(img.data);
    return img;
  }

  /** The member drawn with an ink, cached per (member, ink, colours). */
          rendered(s            , palette       )                           {
    const m = s.member;
    if (!m.image) return null;
    const key = m.movie.name + ':' + m.number + ':' + s.ink + ':' + s.fore + ':' + s.back;
    let c = this.cache.get(key);
    if (c) return c;
    if (m.type === 'bitmap') {
      if (m.width <= 0 || m.height <= 0) return null;
      const img = this.pixels(m, s.fore, s.back, palette);
      if (s.ink === INK_BACKGND_TRANS) backgndTrans(img.data, palette[s.back] ?? [255, 255, 255]);
      else if (s.ink === INK_MATTE) applyMask(img.data, this.matte(m, palette) );
      else if (s.ink !== INK_COPY) console.warn('[stage] ink', s.ink, 'not implemented (not used by the game)');
      c = makeCanvas(m.width, m.height);
      (c.getContext('2d')                            ).putImageData(img, 0, 0);
    } else if (m.type === 'text') {
      // RTE2 anti-aliased rendering (RGBA); copy ink draws the member's background colour first.
      const w = m.width, h = m.height;
      c = makeCanvas(w, h);
      const cx = c.getContext('2d')                            ;
      if (s.ink === INK_COPY) { const b = m.data.bgColor ?? [255, 255, 255]; cx.fillStyle = `rgb(${b[0]},${b[1]},${b[2]})`; cx.fillRect(0, 0, w, h); }
      cx.drawImage(m.image, 0, 0);
    } else return null;
    this.cache.set(key, c);
    return c;
  }

  /** Clears to the stage colour and draws the sprites in channel order, then direct-to-stage
   * video on top. */
  render(sprites              , palette       , video                                                                                 )       {
    const cx = this.ctx;
    cx.fillStyle = `rgb(${this.stageColor[0]},${this.stageColor[1]},${this.stageColor[2]})`;
    cx.fillRect(0, 0, STAGE_W, STAGE_H);
    for (const s of sprites) {
      const [x, y] = Stage.topLeft(s);
      if (s.member.type === 'field') { this.drawField(s, x, y); continue; }
      const img = this.rendered(s, palette);
      if (img) cx.drawImage(img, x, y);
    }
    if (video) {
      const [x, y] = Stage.topLeft(video);
      cx.drawImage(video.image, x, y, video.member.width, video.member.height);
    }
  }

  /** Field member (only GM02 #20 FrameRate). TODO(faithful): Director's field rendering (font,
   * size, margins) is not decoded; drawn with a plain 12 px font. */
          drawField(s            , x        , y        )       {
    const m = s.member, cx = this.ctx;
    if (s.ink === INK_COPY) { const b = m.data.bgColor ?? [255, 255, 255]; cx.fillStyle = `rgb(${b[0]},${b[1]},${b[2]})`; cx.fillRect(x, y, m.width, m.height); }
    cx.fillStyle = '#000';
    cx.font = '12px Arial, sans-serif';
    cx.textBaseline = 'top';
    cx.fillText(m.data.text ?? '', x + 1, y + 1);
  }

  /** PNG of the current stage (debug `shot=1`). */
  toDataURL()         { return this.canvas.toDataURL('image/png'); }
}
