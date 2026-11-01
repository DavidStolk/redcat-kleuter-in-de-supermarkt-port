// GM01.dxr BehaviorScript 40 - FE01_KS (decomp/GM01/scripts/BehaviorScript 40 - FE01_KS.ls)
import { call, dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, rollOver, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getAt, getaProp, random, plus, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Active(gCursor)` etc. are sent to the cursor object (gCursor is the global, not declared here).
export class FE01_KS extends LingoScript {
  static scriptName = 'FE01_KS';
  pFS        = VOID; pFrame        = VOID; pEnable        = VOID; pSprite        = VOID; pMem        = VOID;
  pLocH        = VOID; pCheckPairFlag        = VOID; pAnimDoneFlag        = VOID; pSND_Show        = VOID;
  pSND_Hide        = VOID; pSND_Remove        = VOID; pCallBack        = VOID; pPlankMemList        = VOID;
  pStippenMemList        = VOID; pKaasMemList        = VOID;

  // GM01.dxr #40 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pLocH = sprite(this.pSprite).locH;
    this.pPlankMemList = plus([10, 11, 12], this.pMem);
    this.pStippenMemList = plus([15, 21, 27], this.pMem);
    sprite(this.pSprite).locH = -100;
    sprite(this.pSprite + 1).locH = -100;
    const myPath = getaProp(G.gAppSettings, sym('FE01_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_Show = dsNewSound(cat(myPath, 'KAAS_02.wav'), 0);
    this.pSND_Hide = dsNewSound(cat(myPath, 'KAAS_03.wav'), 0);
    this.pSND_Remove = dsNewSound(cat(myPath, 'KAAS_04.wav'), 0);
    dsSetVolume(this.pSND_Show, myVolume);
    dsSetVolume(this.pSND_Hide, myVolume);
    dsSetVolume(this.pSND_Remove, myVolume);
    this.pCallBack = 0;
    sendSprite(0, sym('addChannel'), sym('Kaas'), this.pSprite);
  }

  // GM01.dxr #40 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_Show);
    dsDelSound(this.pSND_Hide);
    dsDelSound(this.pSND_Remove);
  }

  // GM01.dxr #40 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFrame, 1)) {
          dsPlay(this.pSND_Show);
          sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 2);
        } else {
          if (eq(this.pFrame, 2)) {
            sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 3);
          } else {
            if (eq(this.pFrame, 3)) {
              sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 4);
              sprite(this.pSprite + 1).locH = this.pLocH;
            } else {
              if (eq(this.pFrame, 4)) {
                this.pFS = 0;
                if (truthy(this.pCallBack)) {
                  sendSprite(0, sym('EventDone'));
                  this.pCallBack = 0;
                }
                return;
              }
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          if (eq(this.pFrame, 1)) {
            dsPlay(this.pSND_Hide);
            sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 3);
            sprite(this.pSprite + 1).locH = -100;
          } else {
            if (eq(this.pFrame, 2)) {
              sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 2);
            } else {
              if (eq(this.pFrame, 3)) {
                sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 1);
                this.pFS = 0;
                sendSprite(0, sym('EventDone'));
                return;
              }
            }
          }
        } else {
          if (eq(this.pFS, 3)) {
            if (eq(this.pFrame, 1)) {
              dsPlay(this.pSND_Remove);
              sprite(this.pSprite).memberNum = getAt(this.pPlankMemList, 1);
              sprite(this.pSprite + 1).locH = -100;
            } else {
              if (eq(this.pFrame, 2)) {
                sprite(this.pSprite).memberNum = getAt(this.pPlankMemList, 2);
              } else {
                if (eq(this.pFrame, 3)) {
                  sprite(this.pSprite).memberNum = getAt(this.pPlankMemList, 3);
                } else {
                  if (eq(this.pFrame, 4)) {
                    sprite(this.pSprite).locH = -100;
                    this.pFS = 0;
                    sendSprite(0, sym('EventDone'));
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM01.dxr #40 on enable me
  enable()        {
    if (eq(this.pEnable, 1)) {
      return;
    }
    this.pEnable = 1;
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Active'), G.gCursor);
    }
  }

  // GM01.dxr #40 on Disable me
  Disable()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    this.pEnable = 0;
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Default'), G.gCursor);
    }
  }

  // GM01.dxr #40 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
  }

  // GM01.dxr #40 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
  }

  // GM01.dxr #40 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    this.pEnable = 0;
    call(sym('setState_Default'), G.gCursor);
    sendSprite(0, sym('SelectCheese'), this.pSprite);
  }

  // GM01.dxr #40 on show me
  show()        {
    this.pFrame = 1;
    this.pFS = 1;
  }

  // GM01.dxr #40 on hide me
  hide()        {
    this.pFrame = 1;
    this.pFS = 2;
  }

  // GM01.dxr #40 on remove me
  remove()        {
    this.pFrame = 1;
    this.pFS = 3;
  }

  // GM01.dxr #40 on place me
  place()        {
    sprite(this.pSprite).memberNum = getAt(this.pKaasMemList, 1);
    sprite(this.pSprite).locH = this.pLocH;
  }

  // GM01.dxr #40 on reset me, wLevel, wIndex
  reset(wLevel       , wIndex       )        {
    sprite(this.pSprite + 1).memberNum = plus(getAt(this.pStippenMemList, wLevel), plus(wIndex, -1));
    const myT = random(3);
    if (eq(myT, 1)) {
      this.pKaasMemList = plus([0, 1, 4, 5], this.pMem);
    } else {
      if (eq(myT, 2)) {
        this.pKaasMemList = plus([2, 3, 4, 5], this.pMem);
      } else {
        if (eq(myT, 3)) {
          this.pKaasMemList = plus([6, 7, 8, 9], this.pMem);
        }
      }
    }
  }

  // GM01.dxr #40 on halt me
  halt()        {
    this.pFS = 0;
  }

  // GM01.dxr #40 on callBackOn me
  callBackOn()        {
    this.pCallBack = 1;
  }
}
