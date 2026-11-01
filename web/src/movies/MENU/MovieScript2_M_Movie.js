// MENU.dxr MovieScript 2 - M_Movie (decomp/MENU/scripts/MovieScript 2 - M_Movie.ls)
import { cursor, dsClose, G, newObject, script, sprite } from '../../runtime/api.js';
import { eq, getaProp, sym, VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript2_M_Movie              = {
  // MENU.dxr #2 on prepareMovie
  prepareMovie() {
    G.gCursor = newObject(script('Class_Cursor'));
    cursor(200);
  },

  // MENU.dxr #2 on showNiveau
  showNiveau() {
    sprite(16).memberNum = 65;
    sprite(18).memberNum = 65;
    sprite(20).memberNum = 65;
    const myLevel        = getaProp(G.gAppSettings, sym('PLAYER_LEVEL'));
    if (eq(myLevel, 1)) {
      sprite(16).memberNum = 66;
    } else {
      if (eq(myLevel, 2)) {
        sprite(18).memberNum = 66;
      } else {
        sprite(20).memberNum = 66;
      }
    }
  },

  // MENU.dxr #2 on stopMovie
  stopMovie() {
    G.gSND_MenuMusic = VOID;
    G.gCursor = VOID;
    dsClose();
  },
};
