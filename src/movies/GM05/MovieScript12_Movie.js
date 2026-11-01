// GM05.dxr MovieScript 12 - Movie (decomp/GM05/scripts/MovieScript 12 - Movie.ls)
import { cursor, G, newObject, script } from '../../runtime/api.js';
import { VOID } from '../../runtime/lingo.js';
                                                            

export const MovieScript12_Movie              = {
  // GM05.dxr #12 on prepareMovie
  prepareMovie() {
    cursor(200);
    G.gCursor = newObject(script('Class_Cursor'));
  },

  // GM05.dxr #12 on stopMovie
  stopMovie() {
    G.gCursor = VOID;
  },
};
