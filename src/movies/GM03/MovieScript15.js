// GM03.dxr MovieScript 15 (decomp/GM03/scripts/MovieScript 15.ls)
import { member } from '../../runtime/api.js';
import { plus,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript15              = {
  // GM03.dxr #15 on setregP wStartMem, wStopMem, wOffset
  setregP(wStartMem       , wStopMem       , wOffset       ) {
    for (let myMem = wStartMem, n = wStopMem; myMem <= n; myMem++) {
      const myRegP = member(myMem).regPoint;
      member(myMem).regPoint = plus(myRegP, wOffset);
    }
  },
};
