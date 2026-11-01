// GM05.dxr BehaviorScript 17 - Init (decomp/GM05/scripts/BehaviorScript 17 - Init.ls)
import { sendSprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Init extends LingoScript {
  static scriptName = 'Init';

  // GM05.dxr #17 on beginSprite me
  beginSprite()        {
    sendSprite(0, sym('InitFrame'));
  }
}
