// GM02.dxr BehaviorScript 51 - Fles_Behavior (decomp/GM02/scripts/BehaviorScript 51 - Fles_Behavior.ls)
import { call, dsNewSound, dsPlay, dsSetVolume, G, rollOver, sendSprite, sprite } from '../../runtime/api.js';
import { add, cat, charToNum, count, eq, getAt, getaProp, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// A bottle with a letter: falls (pFS 1), plofs into a cloud (pFS 2), can be clicked (mouseDown).
// `setState_Active(gCursor)` without `global gCursor` resolves to the global.
export class Fles_Behavior extends LingoScript {
  static scriptName = 'Fles_Behavior';
  pSprite        = VOID; pLoc        = VOID; pMemList        = VOID; pMem        = VOID; pInGame        = VOID;
  pSND_1        = VOID; pEnable        = VOID; pMemOffsetList        = VOID; pSequenceList        = VOID;
  pSequenceCount        = VOID; pFS        = VOID; pFrame        = VOID; pFrameCount        = VOID;
  pWolkMem        = VOID; pMasterChannel        = VOID; pMasterHandler        = VOID; pFlag        = VOID;
  pLetter        = VOID; pLetterMem        = VOID; pSoundFlag        = VOID; pCallBackFlag        = VOID;
  pSND_Fall_List        = VOID; pSND_Fall_Count        = VOID; pSND_Fall        = VOID;
  pSND_Plof_List        = VOID; pSND_Plof_Count        = VOID; pSND_Plof        = VOID;

  // GM02.dxr #51 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pLoc = sprite(this.pSprite).loc;
    this.pEnable = 0;
    this.pWolkMem = this.pMem + 26;
    this.pFlag = 0;
    this.pFS = 0;
    this.pInGame = 0;
    const myPath = getaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_Fall = dsNewSound(cat(myPath, 'FLFL_01.wav'), 0);
    dsSetVolume(this.pSND_Fall, myVolume);
    this.pSND_Plof_List = [];
    add(this.pSND_Plof_List, dsNewSound(cat(myPath, 'FLFL_02.wav'), 0));
    add(this.pSND_Plof_List, dsNewSound(cat(myPath, 'FLFL_03.wav'), 0));
    add(this.pSND_Plof_List, dsNewSound(cat(myPath, 'FLFL_04.wav'), 0));
    for (const myID of this.pSND_Plof_List.slice()) {
      dsSetVolume(myID, myVolume);
    }
    this.pSND_Plof_Count = count(this.pSND_Plof_List);
    this.pSND_Plof = getAt(this.pSND_Plof_List, 1);
    this.pSoundFlag = 0;
    sendSprite(0, sym('addChannel'), sym('Fles'), this.pSprite);
    sprite(this.pSprite).locH = -100;
  }

  // GM02.dxr #51 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (truthy(this.pSoundFlag)) {
          dsPlay(this.pSND_Fall);
          this.pSoundFlag = 0;
        }
        sprite(this.pSprite).locV = sprite(this.pSprite).locV + 12;
        if (eq(this.pFrame, this.pFrameCount)) {
          this.pFS = 0;
          if (truthy(this.pCallBackFlag)) {
            sendSprite(0, sym('EventDone'));
          }
          return;
        }
      } else {
        if (eq(this.pFS, 2)) {
          if (eq(this.pFrame, 1)) {
            if (truthy(this.pSoundFlag)) {
              dsPlay(this.pSND_Plof);
            }
            sprite(this.pSprite).memberNum = this.pWolkMem;
          } else {
            if (eq(this.pFrame, 2)) {
              sprite(this.pSprite).memberNum = this.pWolkMem + 1;
            } else {
              if (eq(this.pFrame, 3)) {
                sprite(this.pSprite).locH = -100;
                this.pFS = 0;
                if (truthy(this.pCallBackFlag)) {
                  sendSprite(0, sym('EventDone'));
                }
                return;
              }
            }
          }
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM02.dxr #51 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
  }

  // GM02.dxr #51 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
  }

  // GM02.dxr #51 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    this.pFS = 0;
    sendSprite(0, sym('FL_Select'), this.pLetter, this.pSprite);
    this.pEnable = 0;
  }

  // GM02.dxr #51 on setSound me
  setSound()        {
    this.pSoundFlag = 1;
  }

  // GM02.dxr #51 on setCallBack me
  setCallBack()        {
    this.pCallBackFlag = 1;
  }

  // GM02.dxr #51 on halt me
  halt()        {
    this.pFS = 0;
  }

  // GM02.dxr #51 on Fall me
  Fall()        {
    this.pSoundFlag = 0;
    this.pCallBackFlag = 0;
    this.pFrame = 1;
    this.pFrameCount = 10;
    this.pFS = 1;
  }

  // GM02.dxr #51 on Plof me
  Plof()        {
    this.pSoundFlag = 0;
    this.pCallBackFlag = 0;
    this.pEnable = 0;
    this.pSND_Plof = getAt(this.pSND_Plof_List, random(this.pSND_Plof_Count));
    this.pFrame = 1;
    this.pFS = 2;
  }

  // GM02.dxr #51 on display me
  display()        {
    sprite(this.pSprite).memberNum = this.pLetterMem;
    sprite(this.pSprite).loc = this.pLoc;
  }

  // GM02.dxr #51 on setData me, wLetter
  setData(wLetter       )        {
    this.pLetter = wLetter;
    this.pLetterMem = this.pMem + (charToNum(this.pLetter) - 65);
  }

  // GM02.dxr #51 on enable me
  enable()        {
    this.pEnable = 1;
    if (truthy(rollOver(this.pSprite))) {
      call(sym('setState_Active'), G.gCursor);
    }
  }
}
