// MENU.dxr BehaviorScript 34 - MNU_BTN_NAV (decomp/MENU/scripts/BehaviorScript 34 - MNU_BTN_NAV.ls)
import { call, G, rollOver, sendSprite, sprite } from '../../runtime/api.js';
import { eq, getaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Active(gCursor)` has no `global gCursor` here: resolves to the global (see MENU BTN).
export class MNU_BTN_NAV extends LingoScript {
  static scriptName = 'MNU_BTN_NAV';
  pSprite        = VOID; pMem        = VOID; pEnable        = VOID; pMouseEnter_Flag        = VOID;
  pFeedback_Delay        = VOID; pFeedBack_Flag        = VOID; pFR        = VOID;

  // MENU.dxr #34 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pEnable = 0;
    this.pMouseEnter_Flag = 0;
    this.pFeedBack_Flag = 0;
    this.pFeedback_Delay = getaProp(G.gAppSettings, sym('BTN_FB_DELAY'));
    sendSprite(0, sym('addChannel'), sym('BTN_NAV'), this.pSprite);
  }

  // MENU.dxr #34 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    if (!truthy(this.pMouseEnter_Flag)) {
      return;
    }
    if (eq(this.pFeedBack_Flag, 1)) {
      return;
    }
    if (eq(this.pFR, this.pFeedback_Delay)) {
      this.pFeedBack_Flag = 1;
      sendSprite(0, sym('BTN_ROLLOVER'), this.pSprite);
    }
    this.pFR = this.pFR + 1;
  }

  // MENU.dxr #34 on Disable me
  Disable()        {
    this.pEnable = 0;
  }

  // MENU.dxr #34 on enable me
  enable()        {
    this.pEnable = 1;
    if (truthy(rollOver(this.pSprite))) {
      this.mouseEnter();
    }
  }

  // MENU.dxr #34 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    sprite(this.pSprite).memberNum = this.pMem + 1;
    call(sym('setState_Active'), G.gCursor);
    this.pFR = 1;
    this.pFeedBack_Flag = 0;
    this.pMouseEnter_Flag = 1;
  }

  // MENU.dxr #34 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    sprite(this.pSprite).memberNum = this.pMem;
    call(sym('setState_Default'), G.gCursor);
    if (eq(this.pMouseEnter_Flag, 1)) {
      sendSprite(0, sym('BTN_ROLLOFF'), this.pSprite);
      this.pMouseEnter_Flag = 0;
    }
  }

  // MENU.dxr #34 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    if (eq(this.pMouseEnter_Flag, 1)) {
      sendSprite(0, sym('BTN_ROLLOFF'), this.pSprite);
      this.pMouseEnter_Flag = 0;
    }
    this.pEnable = 0;
    sprite(this.pSprite).memberNum = this.pMem;
    call(sym('setState_Default'), G.gCursor);
    sendSprite(0, sym('BTN_NAV'), this.pSprite);
  }
}
