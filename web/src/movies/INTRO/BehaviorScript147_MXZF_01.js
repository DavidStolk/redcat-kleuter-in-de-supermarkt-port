// INTRO.dxr BehaviorScript 147 - MXZF_01 (decomp/INTRO/scripts/BehaviorScript 147 - MXZF_01.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, truthy, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Called as `play(script "MXZF_01")` by BehaviorScript 122 (exitFrame cue list).
export class MXZF_01 extends LingoScript {
  static scriptName = 'MXZF_01';

  // INTRO.dxr #147 on play
  play()        {
    const myP_VOICE = getaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'));
    const myP_SNDFX = getaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'));
    const myV_VOICE = getaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'));
    const myV_SNDFX = getaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'));
    if (!truthy(voidp(G.gChannel_SNDFX))) {
      dsDelSound(G.gChannel_SNDFX);
    }
    G.gChannel_SNDFX = dsNewSound(cat(myP_SNDFX, 'MXZF_01.wav'), 0);
    dsSetVolume(G.gChannel_SNDFX, myV_SNDFX);
    dsPlay(G.gChannel_SNDFX);
  }
}
