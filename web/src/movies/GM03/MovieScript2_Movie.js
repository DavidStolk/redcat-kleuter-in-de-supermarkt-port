// GM03.dxr MovieScript 2 - Movie (decomp/GM03/scripts/MovieScript 2 - Movie.ls)
import { cursor, G, newObject, script } from '../../runtime/api.js';
import { VOID } from '../../runtime/lingo.js';
                                                            

export const MovieScript2_Movie              = {
  // GM03.dxr #2 on prepareMovie
  prepareMovie() {
    cursor(200);
    G.gCursor = newObject(script('Class_Cursor'));
  },

  // GM03.dxr #2 on stopMovie
  stopMovie() {
    G.gCursor = VOID;
  },
};
