// INTRO.dxr MovieScript 121 - MOVIE (decomp/INTRO/scripts/MovieScript 121 - MOVIE.ls)
import { cursor, dsClose, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G, the } from '../../runtime/api.js';
import { cat, getaProp, propList, setaProp, sym, truthy, voidp } from '../../runtime/lingo.js';
                                                            

export const MovieScript121_MOVIE              = {
  // INTRO.dxr #121 on prepareMovie
  prepareMovie() {
    cursor(200);
    if (truthy(voidp(G.gAppSettings))) {
      G.gAppSettings = propList();
      setaProp(G.gAppSettings, sym('INTRO_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
      setaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'), cat(the.pathName, 'DATA2\\'));
      setaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'), cat(the.pathName, 'DATA2\\'));
      setaProp(G.gAppSettings, sym('INTRO_VOLUME_MUSIC'), -450);
      setaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'), 0);
      setaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'), 0);
    }
    dsOpen();
    G.gChannel_MUSIC = dsNewSound(cat(getaProp(G.gAppSettings, sym('INTRO_PATH_MUSIC')), 'MUSIC_IN.wav'), 0);
    dsSetVolume(G.gChannel_MUSIC, getaProp(G.gAppSettings, sym('INTRO_VOLUME_MUSIC')));
    dsSetLoop(G.gChannel_MUSIC, 1);
    dsPlay(G.gChannel_MUSIC);
  },

  // INTRO.dxr #121 on stopMovie
  stopMovie() {
    dsClose();
  },
};
