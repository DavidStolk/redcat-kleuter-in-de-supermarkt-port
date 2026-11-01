// MENU.dxr BehaviorScript 43 - OPT_BTN_PLV (decomp/MENU/scripts/BehaviorScript 43 - OPT_BTN_PLV.ls)
import { call, G, sendSprite, sprite } from '../../runtime/api.js';
import { sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gCursor` is not declared global here: resolves to the global.
export class OPT_BTN_PLV extends LingoScript {
  static scriptName = 'OPT_BTN_PLV';
  pSprite        = VOID; pMem        = VOID; pEnable        = VOID;

  // MENU.dxr #43 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pEnable = 1;
    sendSprite(0, sym('addChannel'), sym('BTN_PLV'), this.pSprite);
  }

  // MENU.dxr #43 on Disable me
  Disable()        {
    this.pEnable = 0;
    sprite(this.pSprite).memberNum = this.pMem + 2;
  }

  // MENU.dxr #43 on enable me
  enable()        {
    this.pEnable = 1;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // MENU.dxr #43 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    sprite(this.pSprite).memberNum = this.pMem + 1;
    call(sym('setState_Active'), G.gCursor);
  }

  // MENU.dxr #43 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    sprite(this.pSprite).memberNum = this.pMem;
    call(sym('setState_Default'), G.gCursor);
  }

  // MENU.dxr #43 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    this.pEnable = 0;
    sprite(this.pSprite).memberNum = this.pMem + 2;
    call(sym('setState_Default'), G.gCursor);
    sendSprite(0, sym('BTN_PLV'), this.pSprite);
  }
}
