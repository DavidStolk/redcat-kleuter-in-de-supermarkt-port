// INTRO.dxr BehaviorScript 140 - Rintr_03 (decomp/INTRO/scripts/BehaviorScript 140 - Rintr_03.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, truthy, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Called as `play(script "Rintr_03")` by BehaviorScript 122 (exitFrame cue list).
export class Rintr_03 extends LingoScript {
  static scriptName = 'Rintr_03';

  // INTRO.dxr #140 on play
  play()        {
    const myP_VOICE = getaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'));
    const myP_SNDFX = getaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'));
    const myV_VOICE = getaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'));
    const myV_SNDFX = getaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'));
    if (!truthy(voidp(G.gChannel_VOICE))) {
      dsDelSound(G.gChannel_VOICE);
    }
    G.gChannel_VOICE = dsNewSound(cat(myP_VOICE, 'Rintr_03.wav'), 0);
    dsSetVolume(G.gChannel_VOICE, myV_VOICE);
    dsPlay(G.gChannel_VOICE);
  }
}
