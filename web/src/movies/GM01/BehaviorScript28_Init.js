// GM01.dxr BehaviorScript 28 - Init (decomp/GM01/scripts/BehaviorScript 28 - Init.ls)
import { sendSprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Init extends LingoScript {
  static scriptName = 'Init';

  // GM01.dxr #28 on beginSprite me
  beginSprite()        {
    sendSprite(0, sym('InitFrame'));
  }
}
