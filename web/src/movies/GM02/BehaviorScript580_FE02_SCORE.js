// GM02.dxr BehaviorScript 580 - FE02_SCORE (decomp/GM02/scripts/BehaviorScript 580 - FE02_SCORE.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { eq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Score light flashing (identical script text in GM03 #51, GM04 #81, GM05 #34).
export class FE02_SCORE extends LingoScript {
  static scriptName = 'FE02_SCORE';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;

  // GM02.dxr #580 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('SCLT'), this.pSprite);
  }

  // GM02.dxr #580 on exitFrame me
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

  // GM02.dxr #580 on startflash me
  startflash()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM02.dxr #580 on stopFlash me
  stopFlash()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
    this.pFS = 0;
  }

  // GM02.dxr #580 on setOFF me
  setOFF()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM02.dxr #580 on halt me
  halt()        {
    this.pFS = 0;
  }
}
