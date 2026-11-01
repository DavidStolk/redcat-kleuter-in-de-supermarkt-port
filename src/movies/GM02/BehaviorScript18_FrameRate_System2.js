// GM02.dxr BehaviorScript 18 - FrameRate_System2 (decomp/GM02/scripts/BehaviorScript 18 - FrameRate_System2.ls)
import { putField, the } from '../../runtime/api.js';
import { div, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FrameRate_System2 extends LingoScript {
  static scriptName = 'FrameRate_System2';
  pTimer        = VOID;

  // GM02.dxr #18 on beginSprite me
  beginSprite()        {
    this.pTimer = the.timer;
  }

  // GM02.dxr #18 on exitFrame me
  exitFrame()        {
    putField('FrameRate', div(60, the.timer - this.pTimer));
    this.pTimer = the.timer;
  }
}
