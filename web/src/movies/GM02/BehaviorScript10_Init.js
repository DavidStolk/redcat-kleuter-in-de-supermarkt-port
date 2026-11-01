// GM02.dxr BehaviorScript 10 - Init (decomp/GM02/scripts/BehaviorScript 10 - Init.ls)
import { sendSprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Init extends LingoScript {
  static scriptName = 'Init';

  // GM02.dxr #10 on beginSprite me
  beginSprite()        {
    sendSprite(0, sym('InitFrame'));
  }
}
