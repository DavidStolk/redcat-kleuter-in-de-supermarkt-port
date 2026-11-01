// MENU.dxr BehaviorScript 23 - Init (decomp/MENU/scripts/BehaviorScript 23 - Init.ls)
import { sendSprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Init extends LingoScript {
  static scriptName = 'Init';

  // MENU.dxr #23 on beginSprite me
  beginSprite()        {
    sendSprite(0, sym('InitFrame'));
  }
}
