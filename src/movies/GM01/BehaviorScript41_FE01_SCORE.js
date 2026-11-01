// GM01.dxr BehaviorScript 41 - FE01_SCORE (decomp/GM01/scripts/BehaviorScript 41 - FE01_SCORE.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { eq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `global gAppSetting` (sic) is declared but unused.
export class FE01_SCORE extends LingoScript {
  static scriptName = 'FE01_SCORE';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;

  // GM01.dxr #41 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('SCLT'), this.pSprite);
  }

  // GM01.dxr #41 on exitFrame me
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

  // GM01.dxr #41 on startflash me
  startflash()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM01.dxr #41 on stopFlash me
  stopFlash()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
    this.pFS = 0;
  }

  // GM01.dxr #41 on setOFF me
  setOFF()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM01.dxr #41 on halt me
  halt()        {
    this.pFS = 0;
  }
}
