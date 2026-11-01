// GM03.dxr BehaviorScript 13 - Init (decomp/GM03/scripts/BehaviorScript 13 - Init.ls)
import { sendSprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Init extends LingoScript {
  static scriptName = 'Init';

  // GM03.dxr #13 on beginSprite me
  beginSprite()        {
    sendSprite(0, sym('InitFrame'));
  }
}
