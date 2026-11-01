// INTRO.dxr BehaviorScript 139 - Rintr_02 (decomp/INTRO/scripts/BehaviorScript 139 - Rintr_02.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, truthy, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Called as `play(script "Rintr_02")` by BehaviorScript 122 (exitFrame cue list).
export class Rintr_02 extends LingoScript {
  static scriptName = 'Rintr_02';

  // INTRO.dxr #139 on play
  play()        {
    const myP_VOICE = getaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'));
    const myP_SNDFX = getaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'));
    const myV_VOICE = getaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'));
    const myV_SNDFX = getaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'));
    if (!truthy(voidp(G.gChannel_VOICE))) {
      dsDelSound(G.gChannel_VOICE);
    }
    G.gChannel_VOICE = dsNewSound(cat(myP_VOICE, 'Rintr_02.wav'), 0);
    dsSetVolume(G.gChannel_VOICE, myV_VOICE);
    dsPlay(G.gChannel_VOICE);
  }
}
