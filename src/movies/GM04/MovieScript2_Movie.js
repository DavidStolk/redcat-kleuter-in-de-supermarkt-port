// GM04.dxr MovieScript 2 - Movie (decomp/GM04/scripts/MovieScript 2 - Movie.ls)
import { cursor, G, newObject, script } from '../../runtime/api.js';
import { VOID } from '../../runtime/lingo.js';
                                                            

export const MovieScript2_Movie              = {
  // GM04.dxr #2 on prepareMovie
  prepareMovie() {
    cursor(200);
    G.gCursor = newObject(script('Class_Cursor'));
  },

  // GM04.dxr #2 on stopMovie
  stopMovie() {
    G.gCursor = VOID;
  },
};
