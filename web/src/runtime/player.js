// The Director 6 player: score playback, sprite channels, event dispatch, `go`, mouse, video.
// Every rule here is documented with its evidence in decomp/notes/runtime.md.
import { Assets, PATH_NAME } from './assets.js';
                                                       
                                                    
import { DirectSound, WebAudioBackend,                   } from './directsound.js';
import { LingoAbort, LPoint, num, string, VOID,            } from './lingo.js';
import { Member, Movie, NUM_CHANNELS,                 } from './movie.js';
import { callHandler, hasHandler, LingoScript,                                     } from './scripts.js';
import { Stage, STAGE_H, STAGE_W,                 } from './stage.js';
import { DirectOS } from './xtras.js';
import { INK_MATTE,          } from './ink.js';

/** A text member's RTE2 rendering (anti-aliased, the only images with partial alpha) as a canvas
 * filled with putImageData. iOS WebKit (Safari and Chrome on iPad) loses the alpha of
 * `createImageBitmap(ImageData, { premultiplyAlpha: 'none' })`: the text showed as opaque boxes. */
function textImage(img           )                    {
  const c = document.createElement('canvas');
  c.width = Math.max(1, img.w); c.height = Math.max(1, img.h);
  c.getContext('2d') .putImageData(new ImageData(img.rgba, img.w, img.h), 0, 0);
  return c;
}

/** The game's own hand cursor: channel 119 in every movie that has one (Class_Cursor `new`,
 * e.g. GM05.dxr #18: `pSprite = 119`; the frame scripts move it to `the mouseH/V` in `idle`). */
const CURSOR_CHANNEL = 119;

                                                                         

/** One sprite channel (`sprite n`). Lingo-set properties last until the span ends (D6). */
export class Channel {
           spriteNum        ;
          player        ;
  span = -1;
  score                        ;
  instances                = [];
          _member                = null;
          _memberNum = 0;
          _locH = 0;
          _locV = 0;
  ink = 0; fore = 255; back = 0;
          ovMember = false;         ovH = false;         ovV = false;

  constructor(player        , n        ) { this.player = player; this.spriteNum = n; }

  /** Loads the score data of the current frame; a new span drops the Lingo changes. */
  applyScore(sd                        , newSpan         )       {
    if (newSpan) { this.ovMember = false; this.ovH = false; this.ovV = false; }
    this.score = sd;
    if (!sd) { this._member = null; this._memberNum = 0; return; }
    if (!this.ovMember) { this._memberNum = sd.member; this._member = this.player.movie.member(sd.member) ?? null; }
    if (!this.ovH) this._locH = sd.x;
    if (!this.ovV) this._locV = sd.y;
    this.ink = sd.ink; this.fore = sd.fore; this.back = sd.back;
  }

  // ---- Lingo sprite properties (decomp/notes/lingo_usage.md, "Properties") ----
  get memberNum()         { return this._memberNum; }
  set memberNum(n       ) {
    this._memberNum = num(n);
    this._member = this.player.movie.member(this._memberNum) ?? null;
    this.ovMember = true;
    this.player.memberChanged(this);
  }
  get member()                { return this._member; }
  set member(m       ) {
    if (m instanceof Member) { this._member = m; this._memberNum = m.number; }
    else if (typeof m === 'string') { this._member = this.player.movie.member(m) ?? null; this._memberNum = this._member?.number ?? 0; }
    else { this.memberNum = m; return; }
    this.ovMember = true;
    this.player.memberChanged(this);
  }
  get locH()         { return this._locH; }
  set locH(v       ) { this._locH = num(v); this.ovH = true; }
  get locV()         { return this._locV; }
  set locV(v       ) { this._locV = num(v); this.ovV = true; }
  get loc()         { return new LPoint(this._locH, this._locV); }
  // A non-point (VOID) is ignored: every game's BTN_BACK flash sets `the loc` to its never-assigned
  // pLoc at the intro, and the original plays on with the button in place. TODO(faithful): D6's
  // own handling of a VOID loc is not verified (decomp/notes/runtime.md).
  set loc(p       ) { if (!(p instanceof LPoint)) return; this.locH = p.locH; this.locV = p.locV; }
  get castLibNum()         { return 1; }
  /** First behaviour's member. TODO(faithful): D6 `the scriptNum of sprite` with several behaviours. */
  get scriptNum()         { return this.score?.behaviors?.[0]?.member ?? 0; }
  get scriptInstanceList()                { return this.instances; }
  get width()         { return this._member?.width ?? 0; }
  get height()         { return this._member?.height ?? 0; }
  get left()         { return this._member ? this._locH - this._member.regH : this._locH; }
  get top()         { return this._member ? this._locV - this._member.regV : this._locV; }
  get right()         { return this.left + this.width; }
  get bottom()         { return this.top + this.height; }
  /** Digital video position in ticks (1/60 s); equals the member's duration at the end. */
  get movieTime()         { return this.player.videoTime(this); }

  contains(x        , y        )          {
    return !!this._member && x >= this.left && x < this.right && y >= this.top && y < this.bottom;
  }
}

                                                                           

export class Player {
           assets        ;
           stage       ;
           ds             ;
           dos          ;
          registry                ;
  movie        ;
          scripts               = { scripts: {}, movieScripts: [] };
  frameNum = 0;
           channels            = [];
          frameInstance                     = null;
          frameSpan = -1;
          pendingFrame                = null;
          pendingMovie                                        = null;
  /** Tick (1/60 s, `the ticks`) at which the current frame may be left. */
          nextFrameTick = 0;
          atEnd = false;
          busy = false;
          stopped = false;
          input               = [];
  mouseH = 0; mouseV = 0; mouseIsDown = false;
  /** The emulated OS mouse pointer while the pointer is locked (screen = stage, 640x480). */
          pointerX = STAGE_W / 2;         pointerY = STAGE_H / 2;
          locked = false;
  /** The last pointer was a finger: the hand cursor is not drawn (DEVIATIONS.md "Touch screens"). */
          touchInput = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
          hovered = 0;
          downTarget = 0;
  /** Ticks since the last press, until an idle event has run with the button down (see tick). */
          ticksSinceDown = -1;
                   t0 = performance.now();
  exitLock = 0;
  /** The playing digital video: decoded clip, start time on `clock`, frame on the stage. */
          video                                                                                                                                                  = null;
          clips = new Map                   ();
          warned = new Set        ();
           errors           = [];
  /** Debug hook: called after a frame has been entered and drawn. */
  onFrame                                                  = null;
           audioCtx                     ;

  constructor(container             , assets        , registry                , audioCtx                     , backend               ) {
    this.assets = assets;
    this.registry = registry;
    this.audioCtx = audioCtx;
    this.stage = new Stage(container);
    const be               = backend ?? (audioCtx ? new WebAudioBackend(audioCtx) : { now: () => performance.now() / 1000, start: () => ({ stop() {}, setLoop() {}, setGain() {} }) });
    this.ds = new DirectSound(be, (f) => this.assets.sound(f));
    this.dos = new DirectOS(assets, (x, y) => this.setCursorPos(x, y));
    for (let i = 0; i <= NUM_CHANNELS; i++) this.channels.push(new Channel(this, i));
    this.bindInput();
  }

  // ---- start / loop -----------------------------------------------------------------------
  /** `go(frame, movie)` at start-up: the projector's start movie (RCK1 STUP_BLANK) opens MAIN. */
  async start(movie        , frame        = 1)                {
    this.pendingMovie = { name: movie, frame };
    const loop = async ()                => {
      if (this.stopped) return;
      await this.tick();
      this.videoStep();
      requestAnimationFrame(() => { void loop(); });
    };
    await loop();
  }
  stop()       { this.stopped = true; }

  get ticks()         { return Math.floor((performance.now() - this.t0) * 60 / 1000); }

          async tick()                {
    if (this.busy) return;
    this.busy = true;
    try {
      if (this.ticksSinceDown >= 0) this.ticksSinceDown++;
      while (this.input.length) {
        // The original runs `idle` many times between frames, so scripts that poll `the mouseDown`
        // there (MAIN #74, INTRO #122) see every press. The port runs idle once per tick, and a
        // short tap's press and release can arrive in one tick: the release waits until an idle
        // event has run with the button down (at most 3 ticks, for frames with no idle time).
        if (this.input[0].type === 'up' && this.ticksSinceDown >= 0 && this.ticksSinceDown < 3) break;
        this.handleInput(this.input.shift() );
        if (this.pendingMovie) break;
      }
      if (this.pendingMovie) { await this.switchMovie(); return; }
      this.updateHover();
      // A jump requested outside exitFrame is taken at once, without exitFrame.
      if (this.pendingFrame !== null) { this.takeJump(); return; }
      if (!this.atEnd && this.ticks >= this.nextFrameTick) {
        this.event(() => this.frameEvent('exitFrame'));
        if (this.pendingMovie) { await this.switchMovie(); return; }
        if (this.pendingFrame !== null) { this.takeJump(); return; }
        if (this.frameNum >= this.movie.frameCount) {
          this.atEnd = true;
          this.warnOnce('end:' + this.movie.name, '[score] ' + this.movie.name + ': end of score reached, playback holds on the last frame');
          return;
        }
        this.enterFrame(this.frameNum + 1);
        return;
      }
      this.event(() => this.idleEvent());
      if (this.mouseIsDown) this.ticksSinceDown = -1;
    } finally {
      this.busy = false;
    }
  }

          takeJump()       {
    const f = this.pendingFrame ;
    this.pendingFrame = null;
    this.enterFrame(f);
  }

  // ---- frames -----------------------------------------------------------------------------
  /** Enters frame `n` (score.cpp update): endSprite, load sprites, beginSprite, tempo,
   * prepareFrame, draw, [startMovie], enterFrame. */
          enterFrame(n        , onStartMovie             )       {
    const mv = this.movie;
    n = Math.max(1, Math.min(n, mv.frameCount));
    this.atEnd = false;
    // endSprite: frame behaviour first, then channels ascending.
    const frameSpan = mv.spanId(0, n);
    if (this.frameInstance && frameSpan !== this.frameSpan) {
      const inst = this.frameInstance;
      this.event(() => { callHandler(inst, 'endSprite', []); });
      this.frameInstance = null;
    }
    const ending            = [];
    for (let ch = 1; ch <= NUM_CHANNELS; ch++) {
      const c = this.channels[ch];
      if (c.span !== -1 && c.span !== mv.spanId(ch, n)) ending.push(c);
    }
    for (const c of ending) this.sendSpriteEvent(c, 'endSprite');
    for (const c of ending) { c.instances = []; if (this.video?.channel === c) this.stopVideo(); }

    this.frameNum = n;
    const fd = mv.frame(n);
    // Load the frame; new spans get their behaviour instances.
    const beginning            = [];
    let newFrameScript = false;
    if (frameSpan !== this.frameSpan) {
      this.frameSpan = frameSpan;
      if (fd.script) {
        this.frameInstance = this.instantiate(fd.script, 0);
        newFrameScript = !!this.frameInstance;
      }
    }
    for (let ch = 1; ch <= NUM_CHANNELS; ch++) {
      const c = this.channels[ch];
      const span = mv.spanId(ch, n);
      const isNew = span !== c.span;
      c.span = span;
      c.applyScore(mv.sprite(n, ch), isNew);
      if (isNew && span !== -1) {
        c.instances = (c.score?.behaviors ?? []).map((b) => this.instantiate(b.member, ch)).filter((x)                   => !!x);
        beginning.push(c);
      }
      if (c.member?.type === 'digitalVideo') this.ensureVideo(c);
    }
    if (newFrameScript) { const inst = this.frameInstance ; this.event(() => { callHandler(inst, 'beginSprite', []); }); }
    for (const c of beginning) this.sendSpriteEvent(c, 'beginSprite');
    // The projector times frames in ticks from the tick the frame was entered (12 fps = 5 ticks,
    // 15 fps = 4). Timing from the exact entry time instead adds each frame's lateness (up to one
    // display refresh) to the next: ~100 ms frames instead of 83 ms at 60 Hz.
    this.nextFrameTick = this.ticks + 60 / mv.tempo[n - 1];
    this.event(() => this.frameEvent('prepareFrame'));
    this.render();
    onStartMovie?.();
    this.event(() => this.frameEvent('enterFrame'));
    this.onFrame?.(mv.name, n);
  }

  /** Ported class of a script member of the current movie (`script "name"`). */
  scriptClass(member        )                          { return this.scripts.scripts[member]; }

          instantiate(member        , spriteNum        )                     {
    const cls                          = this.scripts.scripts[member];
    if (!cls) {
      this.warnOnce('script:' + this.movie.name + ':' + member, '[scripts] ' + this.movie.name + ' script member ' + member + ' not ported yet (Phase 6)');
      return null;
    }
    const inst = new cls();
    inst.spriteNum = spriteNum;
    return inst;
  }

  // ---- movies -----------------------------------------------------------------------------
          async switchMovie()                {
    const req = this.pendingMovie ;
    this.pendingMovie = null;
    this.pendingFrame = null;
    if (this.movie) {
      this.event(() => this.movieEvent('stopMovie'));
      if (this.frameInstance) { const inst = this.frameInstance; this.event(() => { callHandler(inst, 'endSprite', []); }); }
      for (let ch = 1; ch <= NUM_CHANNELS; ch++) if (this.channels[ch].span !== -1) this.sendSpriteEvent(this.channels[ch], 'endSprite');
      this.stopVideo();
    }
    await this.loadMovie(req.name.toUpperCase());
    let f = 1;
    if (typeof req.frame === 'string') { f = this.movie.label(req.frame); if (!f) { console.warn('[go] label not found:', req.frame); f = 1; } }
    else f = num(req.frame) || 1;
    // The channels already hold the start frame's sprite data in prepareMovie (no spans, no
    // beginSprite yet): MAIN #3 prepareMovie -> Class_Cursor new reads sprite 119 (runtime.md).
    for (let ch = 1; ch <= NUM_CHANNELS; ch++) this.channels[ch].applyScore(this.movie.sprite(f, ch), true);
    this.event(() => this.movieEvent('prepareMovie'));
    this.enterFrame(f, () => this.event(() => this.movieEvent('startMovie')));
  }

          async loadMovie(name        )                {
    const conv = await this.assets.movie(name);
    const { cast, score } = conv;
    const palette = conv.palettes['1']         ;
    const movie = new Movie(name, cast, score, palette);
    const loads                  = [];
    this.clips.clear();
    for (const m of movie.members.values()) {
      const file = m.type === 'bitmap' ? m.data.file : m.type === 'text' ? m.data.rte2?.file : null;
      const img = file ? conv.images.get(file) : undefined;
      if (img && m.type === 'text') m.image = textImage(img);
      else if (img) loads.push(this.loadImage(img).then((b) => { m.image = b; }));
      if (m.type === 'digitalVideo') {
        loads.push(this.assets.video(PATH_NAME + (m.data.filename ?? '')).then((clip) => {
          if (clip) { this.clips.set(m, clip); m.duration = clip.durationTicks; }
        }));
      }
    }
    await Promise.all([...loads, this.assets.preload(name)]);
    const loader = this.registry[name];
    if (loader) this.scripts = await loader();
    else { this.scripts = { scripts: {}, movieScripts: [] }; console.warn('[scripts] movie ' + name + ' not ported yet (Phase 6): score only'); }
    this.movie = movie;
    this.frameNum = 0;
    this.frameSpan = -1;
    this.frameInstance = null;
    for (const c of this.channels) { c.span = -1; c.instances = []; c.applyScore(undefined, true); }
    this.hovered = 0; this.downTarget = 0;
    this.stage.clearCache();
    this.stage.stageColor = palette[cast.config.stageColor] ?? [0, 0, 0];
  }

          loadImage(img           )                       {
    // No colour-space conversion: the inks compare exact palette RGB values.
    return createImageBitmap(new ImageData(img.rgba, img.w, img.h), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  }

  // ---- events -----------------------------------------------------------------------------
  /** Runs one top-level event; `abort` ends it, a script error is logged and ends it. */
  event(fn            )       {
    try { fn(); } catch (e) {
      if (e instanceof LingoAbort) return;
      const msg = '[lingo] ' + (e instanceof Error ? e.stack ?? e.message : String(e));
      console.error(msg);
      this.errors.push(msg);
    }
  }

  /** All behaviours of one sprite; returns whether one handled it. Sprite 0 is the frame script
   * (`sendSprite(0, #addChannel, ...)`, MAIN #8 BTN). */
  sendToSprite(c         , handler        , args         )                                      {
    let handled = false, result        = VOID;
    const list = c.spriteNum === 0 ? (this.frameInstance ? [this.frameInstance] : []) : c.instances.slice();
    for (const inst of list) {
      const r = callHandler(inst, handler, args);
      if (r.handled) { handled = true; result = r.result; }
    }
    return { handled, result };
  }
          sendSpriteEvent(c         , ev        )       { this.event(() => { this.sendToSprite(c, ev, []); }); }

  /** prepareFrame/enterFrame/exitFrame: every sprite's behaviours, the frame behaviour, then the
   * movie scripts if no one handled it. */
          frameEvent(ev        )       {
    let handled = false;
    for (let ch = 1; ch <= NUM_CHANNELS; ch++) {
      const c = this.channels[ch];
      if (c.instances.length && this.sendToSprite(c, ev, []).handled) handled = true;
    }
    if (this.frameInstance && callHandler(this.frameInstance, ev, []).handled) handled = true;
    if (!handled) this.movieEvent(ev);
  }
          idleEvent()       {
    if (this.frameInstance && callHandler(this.frameInstance, 'idle', []).handled) return;
    this.movieEvent('idle');
  }
  /** Movie scripts: the first one that defines the handler. */
  movieEvent(ev        , args          = [])                                      {
    for (const ms of this.scripts.movieScripts) {
      if (hasHandler(ms, ev)) return callHandler(ms, ev, args);
    }
    return { handled: false, result: VOID };
  }
  /** Mouse event: target sprite's behaviours, else the frame behaviour, else movie scripts. */
          mouseEvent(ev        , target        )       {
    if (target && this.sendToSprite(this.channels[target], ev, []).handled) return;
    if (this.frameInstance && callHandler(this.frameInstance, ev, []).handled) return;
    this.movieEvent(ev);
  }

  // ---- navigation (`go`) -------------------------------------------------------------------
  /** `go(frame)` / `go(frame, movie)`: decomp/notes/runtime.md "go semantics". */
  go(frame       , movieName        )       {
    if (movieName !== undefined && movieName !== VOID) { this.pendingMovie = { name: string(movieName), frame }; return; }
    let n        ;
    if (typeof frame === 'string') {
      n = this.movie.label(frame);
      if (!n) { console.warn('[go] label not found:', frame); return; }
    } else n = num(frame);
    this.pendingFrame = Math.max(1, Math.min(n, this.movie.frameCount));
  }
  /** `the frame`: the jump target as soon as `go` was called. */
  get theFrame()         { return this.pendingFrame ?? this.frameNum; }

  // ---- drawing ----------------------------------------------------------------------------
  render()       {
    const list               = [];
    for (let ch = 1; ch <= NUM_CHANNELS; ch++) {
      const c = this.channels[ch];
      const m = c.member;
      if (!m || m.type === 'digitalVideo') continue;
      if (ch === CURSOR_CHANNEL && this.touchInput) continue;
      list.push({ member: m, locH: c.locH, locV: c.locV, ink: c.ink, fore: c.fore, back: c.back });
    }
    const v = this.video;
    this.stage.render(list, this.movie.palette, v ? { image: v.clip.frames[v.shown], member: v.member, locH: v.channel.locH, locV: v.channel.locV } : null);
  }
  /** Called when Lingo changes a sprite's member. */
  memberChanged(c         )       {
    if (c.member?.type === 'digitalVideo') this.ensureVideo(c);
    else if (this.video?.channel === c) this.stopVideo();
  }

  // ---- video (MAIN #73 Video, decomp/notes/video.md) -----------------------------------------
  // The AVI is decoded when the movie loads (import/video.ts). Direct to stage: the frame due at
  // the clip's clock is drawn over the stage between score frames, the sound plays with Web Audio
  // and is the clock while the audio context runs.
          ensureVideo(c         )       {
    if (this.video?.channel === c && this.video.member === c.member) return;
    this.stopVideo();
    const m = c.member ;
    const clip = this.clips.get(m);
    if (!clip || clip.frames.length === 0) { console.warn('[video] missing', m.data.filename); return; }
    const ctx = this.audioCtx;
    let src                               = null;
    let clock = ()         => performance.now() / 1000;
    if (ctx && ctx.state === 'running') {
      clock = () => ctx.currentTime;
      if (clip.audio) {
        src = ctx.createBufferSource();
        src.buffer = clip.audio;
        src.connect(ctx.destination);
        src.start();
      }
    }
    this.video = { clip, member: m, channel: c, clock, t0: clock(), shown: 0, src };
    this.render();
  }
  /** Seconds since the video started. */
          videoElapsed(v                              )         { return Math.max(0, v.clock() - v.t0); }
  /** Draws the stage again when the video's next frame is due (called every animation frame). */
          videoStep()       {
    const v = this.video;
    if (!v) return;
    const f = Math.min(Math.floor(this.videoElapsed(v) * v.clip.fps), v.clip.frames.length - 1);
    if (f !== v.shown) { v.shown = f; this.render(); }
  }
          stopVideo()       {
    if (!this.video) return;
    try { this.video.src?.stop(); } catch { /* not started */ }
    this.video = null;
  }
  videoTime(c         )         {
    const v = this.video;
    if (!v || v.channel !== c) return 0;
    return Math.min(Math.floor(this.videoElapsed(v) * 60), v.member.duration);
  }
  /** `preLoad(member)`: the video is already decoded when the movie loads. */
  preLoad(_m       )       {}

  // ---- mouse ------------------------------------------------------------------------------
  // The original confines the OS pointer to the stage (DirectOS SetCursorPos in `idle`,
  // DECISIONS.md "Cursor confinement", decided: Pointer Lock). With a mouse, the page locks the
  // pointer and moves an emulated OS pointer: relative movement, 1 CSS px = 1 stage px (the
  // original screen was the 640x480 stage), clamped to the screen, and SetCursorPos really moves
  // it. Touch and pen, and a mouse while the lock is released (Esc), use absolute positions.
          bindInput()       {
    const cv = this.stage.canvas;
    cv.style.touchAction = 'none';
    const push = (type                    , e              )       => {
      this.touchInput = e.pointerType === 'touch';
      if (this.locked && e.pointerType === 'mouse') { this.input.push({ type, x: Math.round(this.pointerX), y: Math.round(this.pointerY) }); return; }
      // Absolute position, clipped to the screen: the original's OS pointer cannot leave the
      // 640x480 screen (= the stage), so neither can `the mouseH/V`.
      const [x, y] = this.stage.toStage(e.clientX, e.clientY);
      this.input.push({ type, x: Math.min(Math.max(x, 0), STAGE_W - 1), y: Math.min(Math.max(y, 0), STAGE_H - 1) });
    };
    // Only the primary pointer is the mouse: a second finger on a touch screen is ignored (the
    // original has one OS pointer). A release counts only after a press on the stage (a touch
    // that starts on the black border is not a click).
    let pressed = false;
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (e.button !== 0 || !e.isPrimary) return;
      if (e.pointerType !== 'mouse' && !this.locked) cv.setPointerCapture(e.pointerId);
      pressed = true;
      push('move', e); push('down', e);
    });
    // A mouse press anywhere on the page locks the mouse again once the browser has released it
    // (Esc, another window): on the stage or on the black border around it. Not on the overlay
    // (start click: main.ts; the black page after quit).
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || this.locked || this.stopped) return;
      if (e.target instanceof Node && document.getElementById('overlay')?.contains(e.target)) return;
      this.lockPointer(e.clientX, e.clientY);
    });
    window.addEventListener('pointermove', (e) => {
      if (!e.isPrimary) return;
      if (this.locked && e.pointerType === 'mouse') {
        this.pointerX = Math.min(Math.max(this.pointerX + e.movementX, 0), STAGE_W - 1);
        this.pointerY = Math.min(Math.max(this.pointerY + e.movementY, 0), STAGE_H - 1);
      }
      push('move', e);
    });
    window.addEventListener('pointerup', (e) => { if (e.button === 0 && e.isPrimary && pressed) { pressed = false; push('move', e); push('up', e); } });
    window.addEventListener('pointercancel', (e) => { if (e.isPrimary && pressed) { pressed = false; push('up', e); } });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === cv; });
  }

  /** Locks the mouse to the stage, starting the emulated pointer where the real one is. Needs a
   * user gesture (the start click, or a click after Esc released the lock). */
  lockPointer(clientX        , clientY        )       {
    const cv = this.stage.canvas;
    if (!cv.requestPointerLock || document.pointerLockElement === cv) return;
    const [x, y] = this.stage.toStage(clientX, clientY);
    this.pointerX = Math.min(Math.max(x, 0), STAGE_W - 1);
    this.pointerY = Math.min(Math.max(y, 0), STAGE_H - 1);
    try { void Promise.resolve(cv.requestPointerLock()).catch(() => {}); } catch { /* not supported */ }
  }

  /** DirectOS `SetCursorPos(x, y)` (screen = stage coordinates, `the stageLeft/Top` = 0): moves
   * the emulated pointer; without the lock only the game's view of the mouse moves until the next
   * real pointer event. */
  setCursorPos(x        , y        )       {
    // Win32 SetCursorPos clips to the screen.
    const cx = Math.min(Math.max(x, 0), STAGE_W - 1), cy = Math.min(Math.max(y, 0), STAGE_H - 1);
    if (this.locked) { this.pointerX = cx; this.pointerY = cy; }
    this.mouseH = cx; this.mouseV = cy;
  }

          handleInput(e            )       {
    this.mouseH = e.x; this.mouseV = e.y;
    if (e.type === 'move') { this.updateHover(); return; }
    if (e.type === 'down') {
      this.mouseIsDown = true;
      this.ticksSinceDown = 0;
      this.updateHover();
      this.downTarget = this.mouseTarget(e.x, e.y);
      // Port only: a press may skip Redcat's talking intro (port/src/movies/skipIntro.ts).
      this.event(() => { this.sendToSprite(this.channels[0], 'skipIntro', []); });
      this.event(() => this.mouseEvent('mouseDown', this.downTarget));
      return;
    }
    // up
    this.mouseIsDown = false;
    this.ticksSinceDown = -1;
    const target = this.mouseTarget(e.x, e.y);
    const down = this.downTarget;
    this.downTarget = 0;
    if (down && target !== down) this.event(() => { this.sendToSprite(this.channels[down], 'mouseUpOutSide', []); });
    else this.event(() => this.mouseEvent('mouseUp', target));
  }

          updateHover()       {
    const t = this.mouseTarget(this.mouseH, this.mouseV);
    if (t === this.hovered) return;
    const old = this.hovered;
    this.hovered = t;
    if (old) this.event(() => { this.sendToSprite(this.channels[old], 'mouseLeave', []); });
    if (t) this.event(() => { this.sendToSprite(this.channels[t], 'mouseEnter', []); });
  }

  /** Highest channel under the point that has behaviours (score.cpp getMouseSpriteIDFromPos). */
  mouseTarget(x        , y        )         {
    if (!this.movie) return 0;
    for (let ch = NUM_CHANNELS; ch >= 1; ch--) {
      const c = this.channels[ch];
      if (!c.instances.length || !c.contains(x, y)) continue;
      if (c.ink === INK_MATTE && c.member?.type === 'bitmap') {
        const mask = this.stage.matte(c.member, this.movie.palette);
        if (mask && !mask[(y - c.top) * c.member.width + (x - c.left)]) continue;
      }
      return ch;
    }
    return 0;
  }
  /** `rollOver(n)`: the pointer is inside sprite n's rect. */
  rollOver(n       )         { const c = this.channels[num(n)]; return c && c.contains(this.mouseH, this.mouseV) ? 1 : 0; }

  /** `cursor(200)` hides the system pointer (the game draws its own cursor sprite). */
  cursor(n       )       { this.stage.canvas.style.cursor = num(n) === 200 ? 'none' : 'default'; }

  warnOnce(key        , msg        )       { if (!this.warned.has(key)) { this.warned.add(key); console.warn(msg); } }
}
