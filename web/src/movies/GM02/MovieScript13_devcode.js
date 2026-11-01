// GM02.dxr MovieScript 13 - devcode (decomp/GM02/scripts/MovieScript 13 - devcode.ls)
import { field, member } from '../../runtime/api.js';
import { cat, lineCount, lineOf,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript13_devcode              = {
  // GM02.dxr #13 on setIMGMEMNAMES wMem, wField
  setIMGMEMNAMES(wMem       , wField       ) {
    const myC = lineCount(field(wField));
    for (let i = 1; i <= myC; i++) {
      member(wMem + i - 1).name = cat('BI_', lineOf(field(wField), i));
    }
  },
};
