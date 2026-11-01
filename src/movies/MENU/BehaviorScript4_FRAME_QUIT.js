// MENU.dxr BehaviorScript 4 - FRAME_QUIT (decomp/MENU/scripts/BehaviorScript 4 - FRAME_QUIT.ls)
import { call, go, quit, the } from '../../runtime/api.js';
import { sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FRAME_QUIT extends LingoScript {
  static scriptName = 'FRAME_QUIT';
  pFS        = VOID;

  // MENU.dxr #4 on beginSprite me
  beginSprite()        {
    this.pFS = sym('FS_QUIT');
  }

  // MENU.dxr #4 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
    } else {
      call(this.pFS, this);
    }
    go(the.frame);
  }

  // MENU.dxr #4 on FS_QUIT me
  FS_QUIT()        {
    this.pFS = 0;
    quit();
  }
}
