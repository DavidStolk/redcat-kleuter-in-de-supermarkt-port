// MENU.dxr BehaviorScript 44 - OPT_BTN_HLP (decomp/MENU/scripts/BehaviorScript 44 - OPT_BTN_HLP.ls)
import { call, G, sendSprite, sprite } from '../../runtime/api.js';
import { eq, getAt, getaProp, plus, setaProp, sym, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gCursor` is not declared global here: resolves to the global.
export class OPT_BTN_HLP extends LingoScript {
  static scriptName = 'OPT_BTN_HLP';
  pSprite        = VOID; pMemList        = VOID; pSwitch        = VOID; pMem1        = VOID; pMem2        = VOID;

  // MENU.dxr #44 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    const myMem = sprite(this.pSprite).memberNum;
    this.pMemList = [[myMem, myMem + 1], [myMem + 2, myMem + 3]];
    this.pSwitch = plus(getaProp(G.gAppSettings, sym('HELP')), 1);
    const myMemList = getAt(this.pMemList, this.pSwitch);
    this.pMem1 = getAt(myMemList, 1);
    this.pMem2 = getAt(myMemList, 2);
    sprite(this.pSprite).memberNum = this.pMem1;
    sendSprite(0, sym('addChannel'), sym('BTN_HLP'), this.pSprite);
  }

  // MENU.dxr #44 on switch me
  switch()        {
    if (eq(this.pSwitch, 1)) {
      this.pSwitch = 2;
    } else {
      this.pSwitch = 1;
    }
    setaProp(G.gAppSettings, sym('HELP'), this.pSwitch - 1);
    const myMemList = getAt(this.pMemList, this.pSwitch);
    this.pMem1 = getAt(myMemList, 1);
    this.pMem2 = getAt(myMemList, 2);
    sprite(this.pSprite).memberNum = this.pMem1;
  }

  // MENU.dxr #44 on mouseEnter me
  mouseEnter()        {
    sprite(this.pSprite).memberNum = this.pMem2;
    call(sym('setState_Active'), G.gCursor);
  }

  // MENU.dxr #44 on mouseLeave me
  mouseLeave()        {
    sprite(this.pSprite).memberNum = this.pMem1;
    call(sym('setState_Default'), G.gCursor);
  }

  // MENU.dxr #44 on mouseDown me
  mouseDown()        {
    sendSprite(0, sym('BTN_Help'), this.pSwitch);
    this.switch();
  }
}
