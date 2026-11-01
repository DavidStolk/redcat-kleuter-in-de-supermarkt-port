// GM02.dxr BehaviorScript 19 - FrameRate_System1 (decomp/GM02/scripts/BehaviorScript 19 - FrameRate_System1.ls)
import { putField, the } from '../../runtime/api.js';
import { plus, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FrameRate_System1 extends LingoScript {
  static scriptName = 'FrameRate_System1';
  pTimer        = VOID; pFR        = VOID;

  // GM02.dxr #19 on beginSprite me
  beginSprite()        {
    this.pTimer = the.timer + 60;
  }

  // GM02.dxr #19 on exitFrame me
  exitFrame()        {
    if (the.timer > this.pTimer) {
      putField('FrameRate', this.pFR);
      this.pTimer = the.timer + 60;
      this.pFR = 1;
      return;
    } else {
      this.pFR = plus(this.pFR, 1);
    }
  }
}
