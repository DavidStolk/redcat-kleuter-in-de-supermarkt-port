// INTRO.dxr BehaviorScript 123 (decomp/INTRO/scripts/BehaviorScript 123.ls)
import { go, the } from '../../runtime/api.js';
import { eq, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class BehaviorScript123 extends LingoScript {
  static scriptName = '';
  pFR        = VOID; pStopFlag        = VOID;

  // INTRO.dxr #123 on beginSprite me
  beginSprite()        {
    this.pFR = 1;
    this.pStopFlag = 0;
  }

  // INTRO.dxr #123 on exitFrame
  exitFrame()        {
    if (!truthy(this.pStopFlag)) {
      if (eq(this.pFR, 24)) {
        this.pStopFlag = 1;
        go(1, 'MENU');
      }
      this.pFR = this.pFR + 1;
    }
    go(the.frame);
  }
}
