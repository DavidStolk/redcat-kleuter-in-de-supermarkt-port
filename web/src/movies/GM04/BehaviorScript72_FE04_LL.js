// GM04.dxr BehaviorScript 72 - FE04_LL (decomp/GM04/scripts/BehaviorScript 72 - FE04_LL.ls)
import { call, G, rollOver, sendSprite, sprite } from '../../runtime/api.js';
import { sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Lollipop; `setState_Active(gCursor)` without `global gCursor` resolves to the global.
export class FE04_LL extends LingoScript {
  static scriptName = 'FE04_LL';
  pSprite        = VOID; pMem        = VOID; pLocH        = VOID; pEnable        = VOID;

  // GM04.dxr #72 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pLocH = sprite(this.pSprite).locH;
    this.pEnable = 0;
    sendSprite(0, sym('addChannel'), sym('LL'), this.pSprite);
  }

  // GM04.dxr #72 on set me, wNum
  set(wNum       )        {
    sprite(this.pSprite).memberNum = this.pMem + wNum - 1;
  }

  // GM04.dxr #72 on place me
  place()        {
    sprite(this.pSprite).locH = this.pLocH;
  }

  // GM04.dxr #72 on hide me
  hide()        {
    sprite(this.pSprite).locH = -400;
  }

  // GM04.dxr #72 on enable me
  enable()        {
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Active'), G.gCursor);
    }
    this.pEnable = 1;
  }

  // GM04.dxr #72 on Disable me
  Disable()        {
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Default'), G.gCursor);
    }
    this.pEnable = 0;
  }

  // GM04.dxr #72 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    sendSprite(0, sym('select'), this.pSprite);
  }

  // GM04.dxr #72 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
  }

  // GM04.dxr #72 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
  }
}
