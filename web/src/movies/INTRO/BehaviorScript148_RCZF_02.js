// INTRO.dxr BehaviorScript 148 - RCZF_02 (decomp/INTRO/scripts/BehaviorScript 148 - RCZF_02.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, truthy, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Called as `play(script "RCZF_02")` by BehaviorScript 122 (exitFrame cue list).
export class RCZF_02 extends LingoScript {
  static scriptName = 'RCZF_02';

  // INTRO.dxr #148 on play
  play()        {
    const myP_VOICE = getaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'));
    const myP_SNDFX = getaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'));
    const myV_VOICE = getaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'));
    const myV_SNDFX = getaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'));
    if (!truthy(voidp(G.gChannel_SNDFX))) {
      dsDelSound(G.gChannel_SNDFX);
    }
    G.gChannel_SNDFX = dsNewSound(cat(myP_SNDFX, 'RCZF_02.wav'), 0);
    dsSetVolume(G.gChannel_SNDFX, myV_SNDFX);
    dsPlay(G.gChannel_SNDFX);
  }
}
