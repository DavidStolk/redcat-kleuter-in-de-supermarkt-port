// INTRO.dxr BehaviorScript 145 - BRZF_02 (decomp/INTRO/scripts/BehaviorScript 145 - BRZF_02.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, truthy, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Called as `play(script "BRZF_02")` by BehaviorScript 122 (exitFrame cue list).
export class BRZF_02 extends LingoScript {
  static scriptName = 'BRZF_02';

  // INTRO.dxr #145 on play
  play()        {
    const myP_VOICE = getaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'));
    const myP_SNDFX = getaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'));
    const myV_VOICE = getaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'));
    const myV_SNDFX = getaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'));
    if (!truthy(voidp(G.gChannel_SNDFX))) {
      dsDelSound(G.gChannel_SNDFX);
    }
    G.gChannel_SNDFX = dsNewSound(cat(myP_SNDFX, 'BRZF_02.wav'), 0);
    dsSetVolume(G.gChannel_SNDFX, myV_SNDFX);
    dsPlay(G.gChannel_SNDFX);
  }
}
