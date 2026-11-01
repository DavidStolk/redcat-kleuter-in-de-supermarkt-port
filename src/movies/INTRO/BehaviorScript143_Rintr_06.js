// INTRO.dxr BehaviorScript 143 - Rintr_06 (decomp/INTRO/scripts/BehaviorScript 143 - Rintr_06.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, truthy, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Called as `play(script "Rintr_06")` by BehaviorScript 122 (exitFrame cue list).
export class Rintr_06 extends LingoScript {
  static scriptName = 'Rintr_06';

  // INTRO.dxr #143 on play
  play()        {
    const myP_VOICE = getaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'));
    const myP_SNDFX = getaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'));
    const myV_VOICE = getaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'));
    const myV_SNDFX = getaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'));
    if (!truthy(voidp(G.gChannel_VOICE))) {
      dsDelSound(G.gChannel_VOICE);
    }
    G.gChannel_VOICE = dsNewSound(cat(myP_VOICE, 'Rintr_06.wav'), 0);
    dsSetVolume(G.gChannel_VOICE, myV_VOICE);
    dsPlay(G.gChannel_VOICE);
  }
}
