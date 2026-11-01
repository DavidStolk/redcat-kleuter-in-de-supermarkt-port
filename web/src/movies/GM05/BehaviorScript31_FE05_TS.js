// GM05.dxr BehaviorScript 31 - FE05_TS (decomp/GM05/scripts/BehaviorScript 31 - FE05_TS.ls)
import { call, dsNewSound, dsPlay, dsSetVolume, G, member, rollOver, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getAt, getaProp, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Active(gCursor)` without `global gCursor` resolves to the global (see BTN_BACK).
export class FE05_TS extends LingoScript {
  static scriptName = 'FE05_TS';
  pFS        = VOID; pFR        = VOID; pWolk_MemList        = VOID; pEnable        = VOID; pSprite        = VOID;
  pLocH        = VOID; pTS_RefMem        = VOID; pLT_RefMem        = VOID; pWLK_RefMem        = VOID;
  pLT_Mem        = VOID; pTS_Mem        = VOID; pSND_1        = VOID; pSND_2        = VOID;

  // GM05.dxr #31 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pLocH = sprite(this.pSprite).locH;
    this.pTS_RefMem = member('MIDX_FE05_TS').memberNum;
    this.pLT_RefMem = member('MIDX_FE05_LT').memberNum;
    const myRef = member('MIDX_FE05_TS_WLK').memberNum;
    const myMem = myRef + getAt([1, 3, 5], random(3));
    this.pWolk_MemList = [myMem, myMem + 1];
    this.pEnable = 0;
    const myPath = getaProp(G.gAppSettings, sym('FE05_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_1 = dsNewSound(cat(myPath, 'TS_01.wav'), 0);
    dsSetVolume(this.pSND_1, myVolume);
    this.pSND_2 = dsNewSound(cat(myPath, 'TS_02.wav'), 0);
    dsSetVolume(this.pSND_2, myVolume);
    sendSprite(0, sym('addChannel'), sym('TS'), this.pSprite);
  }

  // GM05.dxr #31 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_2);
          sprite(this.pSprite + 1).locH = -100;
          sprite(this.pSprite).memberNum = getAt(this.pWolk_MemList, 1);
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).memberNum = getAt(this.pWolk_MemList, 2);
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pSprite).locH = -100;
              this.pFS = 0;
              return;
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM05.dxr #31 on Plof me
  Plof()        {
    this.pFR = 1;
    this.pFS = 1;
  }

  // GM05.dxr #31 on init me, wIndex
  init(wIndex       )        {
    this.pLT_Mem = this.pLT_RefMem + wIndex;
    this.pTS_Mem = this.pTS_RefMem + random(5);
    sprite(this.pSprite + 1).memberNum = this.pLT_Mem;
    sprite(this.pSprite + 1).locH = this.pLocH;
    sprite(this.pSprite).memberNum = this.pTS_Mem;
    sprite(this.pSprite).locH = this.pLocH;
  }

  // GM05.dxr #31 on resetPos me
  resetPos()        {
    sprite(this.pSprite).memberNum = this.pTS_Mem;
    sprite(this.pSprite).locH = this.pLocH;
    sprite(this.pSprite + 1).locH = this.pLocH;
  }

  // GM05.dxr #31 on enable me
  enable()        {
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Active'), G.gCursor);
    }
    this.pEnable = 1;
  }

  // GM05.dxr #31 on Disable me
  Disable()        {
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Default'), G.gCursor);
    }
    this.pEnable = 0;
  }

  // GM05.dxr #31 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
  }

  // GM05.dxr #31 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
  }

  // GM05.dxr #31 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    this.pEnable = 0;
    call(sym('setState_Default'), G.gCursor);
    this.pFR = 1;
    this.pFS = 1;
    sendSprite(0, sym('select'), this.pSprite);
  }
}
