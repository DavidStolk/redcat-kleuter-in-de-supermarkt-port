// GM02.dxr BehaviorScript 161 - FC_BODY (decomp/GM02/scripts/BehaviorScript 161 - FC_BODY.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { add, cat, count, eq, getAt, getLast, getaProp, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Bottle-holding character ("FC", #RC / #BR / #MX): walks in, holds two bottles, walks out.
export class FC_BODY extends LingoScript {
  static scriptName = 'FC_BODY';
  pSprite        = VOID; pChannels        = VOID; pMem        = VOID; pPosList        = VOID; pFles_Mem        = VOID;
  pMemList        = VOID; pFS        = VOID; pFR        = VOID; pFirstDropSide        = VOID; pAlfabetList        = VOID;
  pFlesLetterList        = VOID; pSND_GoIn_List        = VOID; pSND_GoIn_Count        = VOID; pSND_GoIn        = VOID;
  pSND_GoOut_List        = VOID; pSND_GoOut_Count        = VOID; pSND_GoOut        = VOID; pOtherCharList        = VOID;
  pSoundFlag        = VOID; pCallBackFlag        = VOID;

  // GM02.dxr #161 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pChannels = [this.pSprite, this.pSprite + 2, this.pSprite + 5, this.pSprite + 6, this.pSprite + 1];
    this.pPosList = [];
    for (const myChannel of this.pChannels.slice()) {
      add(this.pPosList, sprite(myChannel).loc);
    }
    const myPath = getaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_GoIn_List = [];
    add(this.pSND_GoIn_List, dsNewSound(cat(myPath, 'FCZF_01.wav'), 0));
    add(this.pSND_GoIn_List, dsNewSound(cat(myPath, 'FCZF_02.wav'), 0));
    add(this.pSND_GoIn_List, dsNewSound(cat(myPath, 'FCZF_03.wav'), 0));
    for (const myID of this.pSND_GoIn_List.slice()) {
      dsSetVolume(myID, myVolume);
    }
    this.pSND_GoIn_Count = count(this.pSND_GoIn_List);
    this.pSND_GoIn = getAt(this.pSND_GoIn_List, 1);
    this.pSND_GoOut_List = [];
    add(this.pSND_GoOut_List, dsNewSound(cat(myPath, 'RCZF_02.wav'), 0));
    add(this.pSND_GoOut_List, dsNewSound(cat(myPath, 'RCZF_03.wav'), 0));
    for (const myID of this.pSND_GoOut_List.slice()) {
      dsSetVolume(myID, myVolume);
    }
    this.pSND_GoOut_Count = count(this.pSND_GoOut_List);
    this.pSND_GoOut = getAt(this.pSND_GoOut_List, 1);
    this.pFS = 0;
    this.hide();
    sendSprite(0, sym('addChannel'), sym('FlesChar'), this.pSprite);
  }

  // GM02.dxr #161 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          sprite(this.pSprite).loc = getAt(this.pPosList, 1);
          sprite(this.pSprite).memberNum = this.pMem;
        } else {
          if (eq(this.pFR, 2)) {
            if (truthy(this.pSoundFlag)) {
              dsPlay(this.pSND_GoIn);
            }
            sprite(this.pSprite).memberNum = this.pMem + 3;
          } else {
            if (eq(this.pFR, 3)) {
              let i = 1;
              for (const myChannel of this.pChannels.slice()) {
                sprite(myChannel).loc = getAt(this.pPosList, i);
                sprite(myChannel).memberNum = getAt(this.pMemList, i);
                i = i + 1;
              }
              sendSprite(getLast(this.pChannels), sym('setMem'));
              sendSprite(getAt(this.pChannels, 2), sym('Start'));
              this.pFS = 0;
              if (truthy(this.pCallBackFlag)) {
                sendSprite(0, sym('EventDone'));
              }
              return;
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          if (eq(this.pFR, 1)) {
            if (truthy(this.pSoundFlag)) {
              dsPlay(this.pSND_GoOut);
            }
            sendSprite(getAt(this.pChannels, 2), sym('stop'));
            sprite(this.pSprite).memberNum = this.pMem + 4;
            sprite(getAt(this.pChannels, 2)).locH = -100;
            sprite(getAt(this.pChannels, 3)).locH = -100;
            sprite(getAt(this.pChannels, 4)).locH = -100;
            sprite(getAt(this.pChannels, 5)).locH = -100;
          } else {
            if (eq(this.pFR, 2)) {
              sprite(this.pSprite).memberNum = this.pMem;
              sprite(getAt(this.pChannels, 2)).memberNum = this.pMem + 1;
              sprite(getAt(this.pChannels, 2)).loc = getAt(this.pPosList, 2);
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pSprite).locH = -100;
                sprite(getAt(this.pChannels, 2)).memberNum = this.pMem + 2;
              } else {
                if (eq(this.pFR, 4)) {
                  sprite(getAt(this.pChannels, 2)).locH = -100;
                } else {
                  if (eq(this.pFR, 5)) {
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
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM02.dxr #161 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(getLast(this.pChannels), sym('stop'));
    sendSprite(getAt(this.pChannels, 2), sym('stop'));
  }

  // GM02.dxr #161 on setSound me
  setSound()        {
    this.pSoundFlag = 1;
  }

  // GM02.dxr #161 on setCallBack me
  setCallBack()        {
    this.pCallBackFlag = 1;
  }

  // GM02.dxr #161 on GoIn me, wSoundFlag, wCallBackFlag
  // (the parameters are ignored in the original; the flags are reset to 0)
  GoIn(_wSoundFlag        , _wCallBackFlag        )        {
    this.pSoundFlag = 0;
    this.pCallBackFlag = 0;
    this.pSND_GoIn = getAt(this.pSND_GoIn_List, random(this.pSND_GoIn_Count));
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM02.dxr #161 on GoOut me, wSoundFlag, wCallBackFlag
  GoOut(_wSoundFlag        , _wCallBackFlag        )        {
    this.pSoundFlag = 0;
    this.pCallBackFlag = 0;
    this.pSND_GoOut = getAt(this.pSND_GoOut_List, random(this.pSND_GoOut_Count));
    this.pFS = 2;
    this.pFR = 1;
    sendSprite(getAt(this.pChannels, 2), sym('stop'));
  }

  // GM02.dxr #161 on HandsOpen me
  HandsOpen()        {
    const myMem = sprite(getAt(this.pChannels, 3)).memberNum;
    sprite(getAt(this.pChannels, 3)).memberNum = myMem + 1;
    sprite(getAt(this.pChannels, 4)).memberNum = myMem + 3;
  }

  // GM02.dxr #161 on leave me
  leave()        {
    this.pFS = 4;
    this.pFR = 1;
  }

  // GM02.dxr #161 on hide me
  hide()        {
    for (const myChannel of this.pChannels.slice()) {
      sprite(myChannel).locH = -100;
    }
  }

  // GM02.dxr #161 on setData me, wLabel
  // `the memberNum of myMem + 1` is read as (the memberNum of myMem) + 1.
  setData(wLabel       )        {
    let myMem       ;
    if (eq(wLabel, sym('RC'))) {
      myMem = member('MIDX_FE02_FCRC');
    } else {
      if (eq(wLabel, sym('BR'))) {
        myMem = member('MIDX_FE02_FCBR');
      } else {
        if (eq(wLabel, sym('MX'))) {
          myMem = member('MIDX_FE02_FCMX');
        }
      }
    }
    this.pMem = myMem.memberNum + 1;
    this.pMemList = [this.pMem + 5, this.pMem + 6, this.pMem + 9, this.pMem + 11, this.pMem + 15];
  }

  // GM02.dxr #161 on MX me
  MX()        {
    sendSprite(getLast(this.pChannels), sym('stop'));
  }

  // GM02.dxr #161 on M1 me
  M1()        {
    sendSprite(getLast(this.pChannels), sym('open'));
  }

  // GM02.dxr #161 on M2 me
  M2()        {
    sendSprite(getLast(this.pChannels), sym('Talk'));
  }
}
