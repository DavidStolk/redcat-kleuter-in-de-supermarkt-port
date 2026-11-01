// Redcat Kleuter 1 (Supermarkt) web port: boots the Director runtime with the ported movies.
import { bindPlayer } from './runtime/api.js';
import { Assets } from './runtime/assets.js';
import { setRandomSeed } from './runtime/lingo.js';
import { Player } from './runtime/player.js';
import { MOVIE_SCRIPTS } from './movies/index.js';
import { readDebugParams } from './debug.js';
import { exeIcon, useGameIcon } from './import/icon.js';
import { askForFiles } from './import/picker.js';
import { fromUrl } from './import/sources.js';
import { clearStored, openStored } from './import/store.js';

async function boot()                {
  const params = readDebugParams(location.search);
  if (params.seed !== null) setRandomSeed(params.seed);
  const app = document.getElementById('app') ;
  const overlay = document.getElementById('overlay') ;

  // Tablets: no page zoom, scroll or long-press menu over the game (also index.html CSS). iOS Safari
  // ignores user-scalable=no, so pinch and double-tap zoom are blocked here.
  for (const ev of ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu']) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  overlay.textContent = 'Laden...';
  // Safari (iOS 17+): play through the ringer switch, like a game, not like a notification sound.
  const nav = navigator                                                   ;
  if (nav.audioSession) nav.audioSession.type = 'playback';
  // Created suspended; resumed in the start gesture. Touch browsers count only a release
  // (pointerup/touchend/click) as a user gesture, not a press; resume again after the system
  // suspended it (tablet put away, tab hidden).
  const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
  const resume = ()       => { if (audioCtx && audioCtx.state !== 'running') void audioCtx.resume().catch(() => {}); };
  for (const ev of ['pointerdown', 'pointerup', 'touchend', 'click']) window.addEventListener(ev, resume);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) resume(); });

  // The game files come from the player's own CD (README.md "Game data"): asked for once, then
  // kept in the browser. `?cd=` (debug) reads them from a URL instead.
  if (params.reset) await clearStored();
  let cd = params.cd ? await fromUrl(params.cd) : await openStored();
  if (!cd) cd = await askForFiles(overlay);
  overlay.textContent = 'Laden...';
  const assets = new Assets(cd, audioCtx);
  // The game's own Windows icon (RCK1.exe, Redcat's head) as the home-screen and tab icon.
  if (cd.names.has('local/rck1.exe')) {
    void cd.read('local/rck1.exe').then((b) => { const img = exeIcon(b); if (img) useGameIcon(img); }).catch(() => {});
  }
  const player = new Player(app, assets, MOVIE_SCRIPTS, audioCtx);
  bindPlayer(player);

  // Browsers only allow audio after a user gesture (DEVIATIONS.md, "Start click"). The work below
  // runs inside the click itself, as the browsers require.
  if (!params.noclick) {
    const touch = matchMedia('(pointer: coarse)').matches;
    overlay.textContent = touch ? 'Tik om te beginnen' : 'Klik om te beginnen';
    let down                      = null;
    overlay.addEventListener('pointerdown', (e) => { down = e; });
    await new Promise      ((r) => overlay.addEventListener('click', (e) => {
      resume();
      const type = down?.pointerType ?? 'mouse';
      // The start click locks the mouse to the stage (cursor confinement, DECISIONS.md); if the
      // browser refuses here, the next click on the stage locks it.
      if (type === 'mouse') player.lockPointer(e.clientX, e.clientY);
      // Touch/pen: full screen, so the browser's bars do not shrink the stage (DEVIATIONS.md).
      else enterFullscreen();
      r();
    }, { once: true }));
    overlay.textContent = 'Laden...';
  }
  (window                                 ).player = player;
  document.addEventListener('lingo-quit', () => { overlay.textContent = ''; overlay.hidden = false; overlay.classList.add('quit'); });

  let first = true;
  player.onFrame = (movie, frame) => {
    if (first) { first = false; overlay.hidden = true; }
    if (!params.shot || movie !== params.movie) return;
    const want = typeof params.frame === 'number' ? params.frame : player.movie.label(params.frame);
    if (frame !== want) return;
    player.stop();
    const url = player.stage.toDataURL();
    const a = document.createElement('a');
    a.href = url;
    a.download = movie + '_' + params.frame + '.png';
    a.click();
    document.title = 'shot ' + movie + ' ' + params.frame;
  };
  await player.start(params.movie, params.frame);
}

/** Full screen (and landscape where the browser allows locking it); silently skipped where the
 * browser has no Fullscreen API for pages (iPhone Safari). */
function enterFullscreen()       {
  const de = document.documentElement                                                          ;
  const lock = ()       => {
    const o = screen.orientation                                                               ;
    void o?.lock?.('landscape').catch(() => {});
  };
  try {
    if (de.requestFullscreen) void de.requestFullscreen({ navigationUI: 'hide' }).then(lock, () => {});
    else de.webkitRequestFullscreen?.();
  } catch { /* not allowed */ }
}

boot().catch((e) => {
  console.error(e);
  const overlay = document.getElementById('overlay');
  if (overlay) { overlay.hidden = false; overlay.textContent = String(e instanceof Error ? e.message : e); }
});
