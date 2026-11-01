// Ported Lingo per movie (Phase 6): movie name -> loader of its MovieScripts
// (port/src/runtime/scripts.ts). A movie that is not listed plays its score without scripts.
                                                           

export const MOVIE_SCRIPTS                 = {
  MAIN: () => import('./MAIN/index.js').then((m) => m.default),
  INTRO: () => import('./INTRO/index.js').then((m) => m.default),
  MENU: () => import('./MENU/index.js').then((m) => m.default),
  GM01: () => import('./GM01/index.js').then((m) => m.default),
  GM02: () => import('./GM02/index.js').then((m) => m.default),
  GM03: () => import('./GM03/index.js').then((m) => m.default),
  GM04: () => import('./GM04/index.js').then((m) => m.default),
  GM05: () => import('./GM05/index.js').then((m) => m.default),
};
