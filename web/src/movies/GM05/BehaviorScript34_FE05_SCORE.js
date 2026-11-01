// GM05.dxr BehaviorScript 34 - FE05_SCORE (decomp/GM05/scripts/BehaviorScript 34 - FE05_SCORE.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { eq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Score light flashing (identical script text in GM03 #51, GM04 #81, GM05 #34).
export class FE05_SCORE extends LingoScript {
  static scriptName = 'FE05_SCORE';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;

  // GM05.dxr #34 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('SCLT'), this.pSprite);
  }

  // GM05.dxr #34 on exitFrame me
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

  // GM05.dxr #34 on startflash me
  startflash()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM05.dxr #34 on stopFlash me
  stopFlash()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
    this.pFS = 0;
  }

  // GM05.dxr #34 on setOFF me
  setOFF()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM05.dxr #34 on halt me
  halt()        {
    this.pFS = 0;
  }
}
