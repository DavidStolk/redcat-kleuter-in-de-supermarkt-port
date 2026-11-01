// GM04.dxr BehaviorScript 14 - Init (decomp/GM04/scripts/BehaviorScript 14 - Init.ls)
import { sendSprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Init extends LingoScript {
  static scriptName = 'Init';

  // GM04.dxr #14 on beginSprite me
  beginSprite()        {
    sendSprite(0, sym('InitFrame'));
  }
}
