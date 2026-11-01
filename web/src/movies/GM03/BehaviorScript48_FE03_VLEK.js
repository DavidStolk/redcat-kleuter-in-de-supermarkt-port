// GM03.dxr BehaviorScript 48 - FE03_VLEK (decomp/GM03/scripts/BehaviorScript 48 - FE03_VLEK.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { eq, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE03_VLEK extends LingoScript {
  static scriptName = 'FE03_VLEK';
  pFS        = VOID; pSprite        = VOID;

  // GM03.dxr #48 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('VLEK'), this.pSprite);
  }

  // GM03.dxr #48 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        let myLocH = sprite(this.pSprite).locH;
        if (gt(myLocH, 480)) {
          myLocH = -480;
        } else {
          myLocH = myLocH + 6;
        }
        sprite(this.pSprite).locH = myLocH;
      }
    }
  }

  // GM03.dxr #48 on Start me
  Start()        {
    this.pFS = 1;
  }

  // GM03.dxr #48 on stop me
  stop()        {
    this.pFS = 0;
  }
}
