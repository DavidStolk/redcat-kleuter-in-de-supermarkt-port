// MAIN.dxr MovieScript 3 (decomp/MAIN/scripts/MovieScript 3.ls)
import { cursor, G, KeysBlock, newObject, script, the } from '../../runtime/api.js';
import { eq } from '../../runtime/lingo.js';
                                                            

export const MovieScript3              = {
  // MAIN.dxr #3 on prepareMovie
  prepareMovie() {
    if (eq(the.runMode, 'Projector')) {
      KeysBlock();
      the.exitLock = 1;
    }
    G.gCursor = newObject(script('Class_Cursor'));
    cursor(200);
  },
};
