// GM03.dxr BehaviorScript 44 - FE03_KASSA_BTN (decomp/GM03/scripts/BehaviorScript 44 - FE03_KASSA_BTN.ls)
import { call, G, rollOver, sendSprite, sprite } from '../../runtime/api.js';
import { sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Active(gCursor)` without `global gCursor` resolves to the global (see GM01 BTN_BACK).
export class FE03_KASSA_BTN extends LingoScript {
  static scriptName = 'FE03_KASSA_BTN';
  pSprite        = VOID; pMem        = VOID; pEnable        = VOID;

  // GM03.dxr #44 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pEnable = 0;
    sendSprite(0, sym('addChannel'), sym('KasKey'), this.pSprite);
  }

  // GM03.dxr #44 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
  }

  // GM03.dxr #44 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
  }

  // GM03.dxr #44 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    this.pEnable = 0;
    sprite(this.pSprite).memberNum = this.pMem + 1;
    sendSprite(0, sym('KasKey_Select'), this.pSprite);
  }

  // GM03.dxr #44 on reset me
  reset()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM03.dxr #44 on enable me
  enable()        {
    this.pEnable = 1;
    this.pMem = sprite(this.pSprite).memberNum;
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Active'), G.gCursor);
    }
  }

  // GM03.dxr #44 on Disable me
  Disable()        {
    this.pEnable = 0;
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Default'), G.gCursor);
    }
  }
}
