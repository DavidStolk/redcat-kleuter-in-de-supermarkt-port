// MAIN.dxr BehaviorScript 8 - BTN (decomp/MAIN/scripts/BehaviorScript 8 - BTN.ls)
import { call, G, sendSprite, sprite } from '../../runtime/api.js';
import { sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Active(gCursor)` here has no `global gCursor`: it compiles to `objcallv4` with the
// variable name #gCursor, which resolves to the global (decomp/notes/runtime.md).
export class BTN extends LingoScript {
  static scriptName = 'BTN';
  pLabel        = VOID; pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID;
  pLoc        = VOID; pMemList        = VOID; pEnable        = VOID; pPlace_Flag        = VOID;

  // MAIN.dxr #8 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pMemList = [this.pMem + 1, this.pMem + 2];
    this.pEnable = 1;
    sendSprite(0, sym('addChannel'), sym('BTN'), this.pSprite);
  }

  // MAIN.dxr #8 on enable me
  enable()        {
    this.pEnable = 1;
  }

  // MAIN.dxr #8 on Disable me
  Disable()        {
    this.pEnable = 0;
  }

  // MAIN.dxr #8 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // MAIN.dxr #8 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // MAIN.dxr #8 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
    sendSprite(0, sym('BTN_CLICK'), this.pSprite);
  }
}
