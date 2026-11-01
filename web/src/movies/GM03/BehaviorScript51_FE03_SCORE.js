// GM03.dxr BehaviorScript 51 - FE03_SCORE (decomp/GM03/scripts/BehaviorScript 51 - FE03_SCORE.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { eq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Score light flashing (identical script text in GM03 #51, GM04 #81, GM05 #34).
export class FE03_SCORE extends LingoScript {
  static scriptName = 'FE03_SCORE';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;

  // GM03.dxr #51 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('SCLT'), this.pSprite);
  }

  // GM03.dxr #51 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    }
    if (eq(this.pFS, 1)) {
      if (eq(this.pFR, 1)) {
        sprite(this.pSprite).memberNum = this.pMem + 1;
      } else {
        if (eq(this.pFR, 2)) {
          sprite(this.pSprite).memberNum = this.pMem + 2;
          this.pFR = 0;
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM03.dxr #51 on startflash me
  startflash()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM03.dxr #51 on stopFlash me
  stopFlash()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
    this.pFS = 0;
  }

  // GM03.dxr #51 on setOFF me
  setOFF()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM03.dxr #51 on halt me
  halt()        {
    this.pFS = 0;
  }
}
