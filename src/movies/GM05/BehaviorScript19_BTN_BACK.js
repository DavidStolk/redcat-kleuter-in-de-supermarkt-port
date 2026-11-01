// GM05.dxr BehaviorScript 19 - BTN_BACK (decomp/GM05/scripts/BehaviorScript 19 - BTN_BACK.ls)
import { call, G, sendSprite, sprite } from '../../runtime/api.js';
import { eq, getAt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Active(gCursor)` without `global gCursor` resolves to the global (MAIN BTN,
// decomp/notes/runtime.md).
export class BTN_BACK extends LingoScript {
  static scriptName = 'BTN_BACK';
  pLabel        = VOID; pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;
  pLoc        = VOID; pMemList        = VOID; pEnable        = VOID; pPlace_Flag        = VOID;

  // GM05.dxr #19 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pMemList = [this.pMem + 1, this.pMem + 2];
    this.pEnable = 1;
    sendSprite(0, sym('addChannel'), sym('BTN_BACK'), this.pSprite);
  }

  // GM05.dxr #19 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          if (!truthy(this.pPlace_Flag)) {
            this.pPlace_Flag = 1;
            sprite(this.pSprite).loc = this.pLoc;
          }
          sprite(this.pSprite).memberNum = getAt(this.pMemList, 1);
          this.pFR = 2;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).memberNum = getAt(this.pMemList, 2);
            this.pFR = 1;
          }
        }
      }
    }
  }

  // GM05.dxr #19 on startflash me
  startflash()        {
    this.pFR = 1;
    this.pFS = 1;
  }

  // GM05.dxr #19 on stopFlash me
  stopFlash()        {
    sprite(this.pSprite).memberNum = this.pMem;
    this.pFS = 0;
  }

  // GM05.dxr #19 on enable me
  enable()        {
    this.pEnable = 1;
  }

  // GM05.dxr #19 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // GM05.dxr #19 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM05.dxr #19 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
    sendSprite(0, sym('BTN_BACK'));
  }
}
