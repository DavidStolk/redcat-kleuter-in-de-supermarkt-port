// Debug entry (PORT_INVENTORY.md Phase 5): URL parameters
//   ?movie=GM03            start in that movie instead of MAIN (the projector start movie RCK1
//                          STUP_BLANK opens MAIN, decomp/notes/projector.md)
//   &frame=A | &frame=12   label or frame number to start at (default 1)
//   &shot=1                when that frame has been entered and drawn: freeze the player, show
//                          the stage PNG and download it (<movie>_<frame>.png)
//   &seed=1234             repeatable random() sequence
//   &noclick=1             skip the start click (audio stays locked until a click)
//   &cd=cd/                read the game files from that URL instead of asking for them
//                          (tools/serve.mjs serves cd/RCKSETUP there); nothing is stored
//   &reset=1               forget the stored game files and ask for them again
                                                                                                                                                               

export function readDebugParams(search        )              {
  const q = new URLSearchParams(search);
  const f = q.get('frame');
  const seed = q.get('seed');
  return {
    movie: (q.get('movie') ?? 'MAIN').toUpperCase(),
    frame: f === null || f === '' ? 1 : /^\d+$/.test(f) ? Number(f) : f,
    shot: q.get('shot') === '1',
    seed: seed !== null && /^-?\d+$/.test(seed) ? Number(seed) : null,
    noclick: q.get('noclick') === '1' || q.get('shot') === '1',
    cd: q.get('cd') || null,
    reset: q.get('reset') === '1',
  };
}
