// The Lingo environment for the hand-ported scripts (port/src/movies/): builtins that need the
// player, `the` properties, sprites/members and the Xtra functions. Value builtins (lists,
// strings, math, random, value) are in lingo.ts. Porting pattern: port/PORTING.md.
import { PATH_NAME } from './assets.js';
import { LingoAbort, LSymbol, num, string, VOID,            } from './lingo.js';
                                         
                                                   
import { callHandler, hasHandler,                  } from './scripts.js';
import { FileIO } from './xtras.js';

let P        ;
export function bindPlayer(p        )       { P = p; }

/** Lingo globals (`global gAppSettings` -> `G.gAppSettings`); they survive movie changes. */
export const G                        = {};

/** System and movie properties (`the frame` -> `the.frame`). */
export const the = {
  get frame()         { return P.theFrame; },
  get mouseH()         { return P.mouseH; },
  get mouseV()         { return P.mouseV; },
  get mouseDown()         { return P.mouseIsDown ? 1 : 0; },
  get timer()         { return P.ticks; },
  get ticks()         { return P.ticks; },
  get pathName()         { return PATH_NAME; },
  get stageLeft()         { return 0; },
  get stageTop()         { return 0; },
  get runMode()         { return 'Projector'; },
  get maxinteger()         { return 2147483647; },
  get videoForWindowsPresent()         { return 1; },
  get exitLock()         { return P.exitLock; },
  set exitLock(v       ) { P.exitLock = num(v); },
};

/** `sprite n` */
export function sprite(n       )          {
  const c = P.channels[num(n)];
  if (!c) throw new Error('Lingo: sprite ' + n + ' out of range');
  return c;
}
/** `member n` / `member "name"` (castLib argument accepted and ignored: one internal cast). */
export function member(ref       , _castLib        )         {
  if (ref && typeof ref === 'object' && 'movie' in ref) return ref          ;
  const m = P.movie.member(typeof ref === 'string' ? ref : num(ref));
  if (!m) throw new Error('Lingo: member ' + string(ref) + ' not found in ' + P.movie.name);
  return m;
}
/** `field "name"` text; `put x into field "name"` -> putField. */
export function field(ref       )         { return member(ref).data.text ?? ''; }
export function putField(ref       , text       )       { member(ref).data.text = string(text); }

/** `script "name"` / `script n`: the ported class of that script member. */
export function script(ref       )              {
  const m = member(ref);
  const cls = P.scriptClass(m.number);
  if (!cls) throw new Error('Lingo: script ' + string(ref) + ' (member ' + m.number + ') not ported');
  return cls;
}

/** The script object of a script member, as the first argument of a handler call: Lingo sends
 * `play(script "Rintr_01")` to that script with `me` = the script itself (no `new`). One object
 * per class, so script-level properties persist like Director's. */
const scriptObjects = new WeakMap                     ();
export function scriptObject(ref       )         {
  const cls = script(ref);
  let o = scriptObjects.get(cls);
  if (!o) { o = new cls(); scriptObjects.set(cls, o); }
  return o;
}

class XtraRef {          name        ; constructor(n        ) { this.name = n; } }
/** `xtra("FILEIO")` */
export function xtra(name       )          { return new XtraRef(string(name)); }

/** `new(script "X", args...)`: makes an instance and runs its `new` handler (which returns me);
 * `new(xtra("FILEIO"))` makes a FileIO instance. */
export function newObject(ref       , ...args         )        {
  if (ref instanceof XtraRef) {
    if (ref.name.toUpperCase() === 'FILEIO') return new FileIO(P.assets);
    throw new Error('Lingo: unknown Xtra ' + ref.name);
  }
  const o = new (ref               )();
  if (hasHandler(o, 'new')) { const r = callHandler(o, 'new', args).result; return r === VOID ? o : r; }
  return o;
}

/** `sendSprite(n, #msg, args...)`: every behaviour of sprite n that has the handler. */
export function sendSprite(n       , msg       , ...args         )        {
  const c = P.channels[num(n)];
  if (!c) return VOID;
  return P.sendToSprite(c, msg instanceof LSymbol ? msg.name : string(msg), args).result;
}
/** `call(#handler, objOrList, args...)` */
export function call(handler       , target       , ...args         )        {
  const h = handler instanceof LSymbol ? handler.name : string(handler);
  if (Array.isArray(target)) { let r        = VOID; for (const o of target) if (hasHandler(o, h)) r = callHandler(o, h, args).result; return r; }
  if (!hasHandler(target, h)) { P.warnOnce('call:' + h, '[lingo] call: handler not defined: ' + h); return VOID; }
  return callHandler(target, h, args).result;
}
/** A movie-script handler of the current movie (global handler call from a script). */
export function movieCall(handler        , ...args         )        {
  const r = P.movieEvent(handler, args);
  if (!r.handled) throw new Error('Lingo: handler not defined: ' + handler);
  return r.result;
}

export function go(frame       , movie        )       { P.go(frame, movie); }
export function updateStage()       { P.render(); }
export function rollOver(n       )         { return P.rollOver(n); }
export function cursor(n       )       { P.cursor(n); }
export function preLoad(m       )       { P.preLoad(m); }
export function abort()        { throw new LingoAbort(); }
export function put(...a         )       { console.log('[put]', ...a.map(string)); }
export function alert(msg       )       { window.alert(string(msg)); }
/** `beep()`: TODO(faithful): the Windows default beep sound is not reproduced. */
export function beep()       { console.log('[beep]'); }
/** `quit()`: a page cannot close itself; the player stops and the stage goes black (DEVIATIONS.md). */
export function quit()       {
  P.stop();
  P.ds.dsClose();
  document.dispatchEvent(new CustomEvent('lingo-quit'));
}
/** `getNthFileNameInFolder(path, n)`: "" past the last entry. */
export function getNthFileNameInFolder(path       , n       )         {
  return P.assets.listFolder(string(path))[num(n) - 1] ?? '';
}

// ---- DirectSound Xtra (directsound.ts) ----
export const dsOpen = ()         => P.ds.dsOpen();
export const dsClose = ()         => P.ds.dsClose();
export const dsNewSound = (f       , mode        )         => P.ds.dsNewSound(f, mode);
export const dsDelSound = (id       )         => P.ds.dsDelSound(id);
export const dsPlay = (id       )         => P.ds.dsPlay(id);
export const dsStop = (id       )         => P.ds.dsStop(id);
export const dsSetVolume = (id       , v       )         => P.ds.dsSetVolume(id, v);
export const dsSetLoop = (id       , l       )         => P.ds.dsSetLoop(id, l);
export const dsSetPosition = (id       , p       )         => P.ds.dsSetPosition(id, p);
export const dsIsPlaying = (id       )         => P.ds.dsIsPlaying(id);

// ---- DirectOS Xtra (xtras.ts) ----
export const SetCursorPos = (x       , y       )         => P.dos.SetCursorPos(x, y);
export const KeysBlock = ()         => P.dos.KeysBlock();
export const KeysUnBlock = ()         => P.dos.KeysUnBlock();
export const ReadINI = (f       , s       , k       )         => P.dos.ReadINI(f, s, k);
export const GetDriveType = (r       )         => P.dos.GetDriveType(r);

// ---- FileIO Xtra (xtras.ts): Lingo calls them as OpenFile(obj, ...) ----
export const OpenFile = (o        , name       , mode       )         => o.openFile(name, mode);
export const readFile = (o        )         => o.readFile();
export const closeFile = (o        )         => o.closeFile();
