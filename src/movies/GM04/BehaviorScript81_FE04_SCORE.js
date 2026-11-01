// GM04.dxr BehaviorScript 81 - FE04_SCORE (decomp/GM04/scripts/BehaviorScript 81 - FE04_SCORE.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { eq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Score light flashing (identical script text in GM03 #51, GM04 #81, GM05 #34).
export class FE04_SCORE extends LingoScript {
  static scriptName = 'FE04_SCORE';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;

  // GM04.dxr #81 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('SCLT'), this.pSprite);
  }

  // GM04.dxr #81 on exitFrame me
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

  // GM04.dxr #81 on startflash me
  startflash()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM04.dxr #81 on stopFlash me
  stopFlash()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
    this.pFS = 0;
  }

  // GM04.dxr #81 on setOFF me
  setOFF()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM04.dxr #81 on halt me
  halt()        {
    this.pFS = 0;
  }
}
