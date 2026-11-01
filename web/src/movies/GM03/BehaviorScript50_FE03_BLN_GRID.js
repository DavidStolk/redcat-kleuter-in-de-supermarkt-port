// GM03.dxr BehaviorScript 50 - FE03_BLN_GRID (decomp/GM03/scripts/BehaviorScript 50 - FE03_BLN_GRID.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { sym,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE03_BLN_GRID extends LingoScript {
  static scriptName = 'FE03_BLN_GRID';

  // GM03.dxr #50 on beginSprite me
  beginSprite()        {
    const mySprite = this.spriteNum;
    sendSprite(0, sym('addGrid_BLN'), sprite(mySprite).loc);
    sprite(mySprite).locH = -200;
  }
}
