// MENU.dxr ParentScript 6 - SND_MODULE (decomp/MENU/scripts/ParentScript 6 - SND_MODULE.ls)
import { dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G } from '../../runtime/api.js';
import { cat, getaProp, sym, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gAppSettings` is not declared global here: resolves to the global.
export class SND_MODULE extends LingoScript {
  static scriptName = 'SND_MODULE';
  pPath_Audio_Music        = VOID; pPath_Audio_Voice        = VOID; pPath_Audio_SndFx        = VOID;
  pLevel_Audio_Music        = VOID; pLevel_Audio_Voice        = VOID; pLevel_Audio_SndFx        = VOID;
  pMusic        = VOID;

  // MENU.dxr #6 on new me
  new()        {
    return this;
  }

  // MENU.dxr #6 on init me
  init()        {
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('MNU_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('MNU_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('MNU_PATH_SNDFX'));
    this.pLevel_Audio_Music = getaProp(G.gAppSettings, sym('VOLUME_MUSIC'));
    this.pLevel_Audio_Voice = getaProp(G.gAppSettings, sym('VOLUME_VOICE'));
    this.pLevel_Audio_SndFx = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    dsOpen();
    this.pMusic = dsNewSound(cat(this.pPath_Audio_Music, getaProp(G.gAppSettings, sym('MNU_FILE_MUSIC'))), 0);
    dsSetLoop(this.pMusic, 1);
    dsSetVolume(this.pMusic, this.pLevel_Audio_Music);
    dsPlay(this.pMusic);
  }
}
