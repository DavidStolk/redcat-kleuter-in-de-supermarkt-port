// MENU.dxr BehaviorScript 32 - MNU_FRAME (decomp/MENU/scripts/BehaviorScript 32 - MNU_FRAME.ls)
import {
  abort, alert, call, dsClose, dsDelSound, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G, go,
  movieCall, newObject, script, sendSprite, SetCursorPos, sprite, the, updateStage,
} from '../../runtime/api.js';
import {
  add, cat, count, eq, getAt, getPos, getaProp, gt, integer, listp, lt, max, min, neq, setaProp, sym,
  truthy, value, VOID, voidp,            
} from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Globals gCursor, gAppSettings, gSND_MenuMusic, gSND_MenuBTN are `G.*`.
// `get(pRIU, #X)` is sent to the RandomIndexUnit instance: `call(sym('get'), pRIU, ...)`.
export class MNU_FRAME extends LingoScript {
  static scriptName = 'MNU_FRAME';
  pFS        = VOID; pFH        = VOID; pNextFS        = VOID; pFR        = VOID;
  pBTN_NAV_Channels        = VOID; pRollSndID        = VOID; pSND_BTN_1        = VOID; pSND_BTN_2        = VOID;
  pRCUL_Channel        = VOID; pPath_Audio_Music        = VOID; pPath_Audio_Voice        = VOID;
  pPath_Audio_SndFx        = VOID; pLevel_Audio_Music        = VOID; pLevel_Audio_Voice        = VOID;
  pLevel_Audio_SndFx        = VOID; pSelected_GameID        = VOID; pRIU        = VOID;
  pAudioCueList        = VOID; pAudioCueChannel        = VOID; pTalkFile_Flag        = VOID;
  pTalkFile        = VOID; pCP_Flag        = VOID; pCP_Frame        = VOID; pCP_Index        = VOID;
  pCP_Count        = VOID; pCP_NextTime        = VOID; pCP_NextName        = VOID;
  pCP_Time_List        = VOID; pCP_Name_List        = VOID; pCPD_NameList        = VOID;
  pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID; pCPD_CPTimesList        = VOID;
  pVScale_Music        = VOID; pVScale_Count        = VOID; pVScale_Index        = VOID;
  pCRS_L        = VOID; pCRS_T        = VOID; pCRS_R        = VOID; pCRS_B        = VOID;

  // MENU.dxr #32 on endSprite me
  endSprite()        {
    this.pRIU = VOID;
  }

  // MENU.dxr #32 on beginSprite me
  beginSprite()        {
    this.pSelected_GameID = 0;
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('MNU_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('MNU_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('MNU_PATH_SNDFX'));
    this.pLevel_Audio_Music = getaProp(G.gAppSettings, sym('VOLUME_MUSIC'));
    this.pLevel_Audio_Voice = getaProp(G.gAppSettings, sym('VOLUME_VOICE'));
    this.pLevel_Audio_SndFx = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pVScale_Music = getaProp(G.gAppSettings, sym('VSCALE_MUSIC'));
    this.pVScale_Count = count(this.pVScale_Music);
    this.pVScale_Index = getPos(this.pVScale_Music, this.pLevel_Audio_Music);
    this.pCRS_L = getaProp(G.gAppSettings, sym('CURSOR_LEFT'));
    this.pCRS_T = getaProp(G.gAppSettings, sym('CURSOR_TOP'));
    this.pCRS_R = getaProp(G.gAppSettings, sym('CURSOR_RIGHT'));
    this.pCRS_B = getaProp(G.gAppSettings, sym('CURSOR_BOTTOM'));
    const myData = value(movieCall('readTextFile', cat(this.pPath_Audio_Voice, 'voice.cpd')));
    this.pCPD_NameList = getAt(myData, 1);
    this.pCPD_FileList = getAt(myData, 2);
    this.pCPD_CPNamesList = getAt(myData, 3);
    this.pCPD_CPTimesList = getAt(myData, 4);
    this.pBTN_NAV_Channels = [];
    dsOpen();
    if (truthy(voidp(G.gSND_MenuMusic))) {
      const myFile = getaProp(G.gAppSettings, sym('MNU_FILE_MUSIC'));
      G.gSND_MenuMusic = dsNewSound(cat(this.pPath_Audio_Music, myFile), 0);
      dsSetLoop(G.gSND_MenuMusic, 1);
      dsSetVolume(G.gSND_MenuMusic, this.pLevel_Audio_Music);
      dsPlay(G.gSND_MenuMusic);
    }
    this.pRIU = newObject(script('RandomIndexUnit'));
    add(this.pRIU, sym('MS1R'), 2);
    add(this.pRIU, sym('MS2R'), 2);
    add(this.pRIU, sym('MS3R'), 2);
    add(this.pRIU, sym('MS4R'), 2);
    add(this.pRIU, sym('MS5R'), 2);
    add(this.pRIU, sym('MSTOP'), 2);
    add(this.pRIU, sym('MOPT'), 2);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = 0;
  }

  // MENU.dxr #32 on exitFrame me
  exitFrame()        {
    if (eq(this.pTalkFile_Flag, 1)) {
      this.pTalkFile_Flag = 0;
      dsPlay(this.pTalkFile);
    }
    if (truthy(this.pCP_Flag)) {
      if (eq(this.pCP_Frame, this.pCP_NextTime)) {
        this.CP_Passed(this.pCP_NextName);
        if (eq(this.pCP_Index, this.pCP_Count)) {
          this.pCP_Flag = 0;
        } else {
          this.pCP_Index = this.pCP_Index + 1;
          this.pCP_NextTime = integer(getAt(this.pCP_Time_List, this.pCP_Index));
          this.pCP_NextName = getAt(this.pCP_Name_List, this.pCP_Index);
          if (lt(this.pCP_NextTime, this.pCP_Frame + 1)) {
            this.pCP_NextTime = this.pCP_Frame + 1;
          }
        }
      }
      this.pCP_Frame = this.pCP_Frame + 1;
    }
    if (!truthy(this.pFS)) {
    } else {
      if (!truthy(this.pFH)) {
        call(this.pFS, this);
      } else {
        this.pFH = this.pFH - 1;
      }
    }
    go(the.frame);
  }

  // MENU.dxr #32 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // MENU.dxr #32 on idle me
  idle()        {
    const myMH = the.mouseH;
    const myMV = the.mouseV;
    const myRH = min(this.pCRS_R, max(this.pCRS_L, myMH));
    const myRV = min(this.pCRS_B, max(this.pCRS_T, myMV));
    if (neq(myMH, myRH) || neq(myMV, myRV)) {
      SetCursorPos(the.stageLeft + myRH, the.stageTop + myRV);
    }
    sprite(119).locH = the.mouseH;
    sprite(119).locV = the.mouseV;
    updateStage();
  }

  // MENU.dxr #32 on CP_Init me, wFile
  CP_Init(wFile       )        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
      this.pTalkFile = VOID;
    }
    const myPos = getPos(this.pCPD_NameList, wFile);
    if (!truthy(myPos)) {
      alert('MyPos = ZERO');
      abort();
    }
    this.pTalkFile = dsNewSound(cat(this.pPath_Audio_Voice, getAt(this.pCPD_FileList, myPos)), 0);
    dsSetVolume(this.pTalkFile, this.pLevel_Audio_Voice);
    this.pTalkFile_Flag = 1;
    this.pCP_Name_List = getAt(this.pCPD_CPNamesList, myPos);
    this.pCP_NextName = getAt(this.pCP_Name_List, 1);
    this.pCP_Time_List = getAt(this.pCPD_CPTimesList, myPos);
    this.pCP_NextTime = integer(getAt(this.pCP_Time_List, 1));
    this.pCP_Count = count(this.pCP_Name_List);
    this.pCP_Index = 1;
    this.pCP_Frame = 1;
    this.pCP_Flag = 1;
  }

  // MENU.dxr #32 on CP_Passed me, wName
  CP_Passed(wName       )        {
    const myCPList = value(wName);
    if (truthy(listp(myCPList))) {
      for (const myProp of myCPList.slice()) {
        sendSprite(this.pAudioCueChannel, myProp);
      }
    } else {
      this.pFS = this.pNextFS;
      this.pNextFS = 0;
    }
  }

  // MENU.dxr #32 on InitFrame me
  InitFrame()        {
    if (eq(getaProp(G.gAppSettings, sym('MNU_UL')), -1)) {
      setaProp(G.gAppSettings, sym('MNU_UL'), 0);
      sendSprite(this.pRCUL_Channel, sym('default'));
      this.pFS = sym('RCUL_Talk_Done');
    } else {
      this.pFS = sym('RCUL_WalkIn');
    }
  }

  // MENU.dxr #32 on RCUL_WalkIn me
  RCUL_WalkIn()        {
    sendSprite(this.pRCUL_Channel, sym('WalkIn'));
    if (eq(getaProp(G.gAppSettings, sym('MNU_UL')), 1)) {
      setaProp(G.gAppSettings, sym('MNU_UL'), 0);
      this.pNextFS = sym('RCUL_Talk1');
    } else {
      this.pNextFS = sym('RCUL_Talk_Done');
    }
    this.pFS = 0;
  }

  // MENU.dxr #32 on RCUL_Talk1 me
  RCUL_Talk1()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '00RCUL01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Talk2');
  }

  // MENU.dxr #32 on RCUL_Talk2 me
  RCUL_Talk2()        {
    const myFile = '00RCUL02';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Talk_Done');
  }

  // MENU.dxr #32 on RCUL_Talk_Done me
  RCUL_Talk_Done()        {
    for (const myChannel of this.pBTN_NAV_Channels.slice()) {
      sendSprite(myChannel, sym('enable'));
    }
    this.pFS = 0;
  }

  // MENU.dxr #32 on BTN_NAV me, wChannel
  BTN_NAV(wChannel       )        {
    for (const myChannel of this.pBTN_NAV_Channels.slice()) {
      sendSprite(myChannel, sym('Disable'));
    }
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
      this.pTalkFile = VOID;
    }
    sendSprite(this.pRCUL_Channel, sym('default'));
    this.pCP_Flag = 0;
    const myIDX = getPos(this.pBTN_NAV_Channels, wChannel);
    let myFile       ;
    if (gt(myIDX, 5)) {
      if (!truthy(voidp(G.gSND_MenuBTN))) {
        dsDelSound(G.gSND_MenuBTN);
        G.gSND_MenuBTN = VOID;
      }
      if (eq(myIDX, 6)) {
        G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_STOP.wav'), 0);
        this.pFS = sym('GO_END');
        this.pFH = 4;
      } else {
        if (eq(myIDX, 7)) {
          G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_OPT.wav'), 0);
          this.pFS = sym('GO_OPT');
          this.pFH = 4;
        }
      }
      dsSetVolume(G.gSND_MenuBTN, this.pLevel_Audio_Voice);
      dsPlay(G.gSND_MenuBTN);
    } else {
      if (eq(myIDX, 1)) {
        myFile = 'MS1D_01';
      } else {
        if (eq(myIDX, 2)) {
          myFile = 'MS2D_01';
        } else {
          if (eq(myIDX, 3)) {
            myFile = 'MS3D_01';
          } else {
            if (eq(myIDX, 4)) {
              myFile = 'MS4D_01';
            } else {
              if (eq(myIDX, 5)) {
                myFile = 'MS5D_01';
              }
            }
          }
        }
      }
      this.pAudioCueChannel = this.pRCUL_Channel;
      this.CP_Init(myFile);
      this.pSelected_GameID = myIDX;
      this.pFS = 0;
      this.pNextFS = sym('RCUL_WalkOut');
    }
  }

  // MENU.dxr #32 on RCUL_WalkOut me
  RCUL_WalkOut()        {
    sendSprite(this.pRCUL_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pFH = 4;
    this.pNextFS = sym('RCUL_WalkOut_Done');
  }

  // MENU.dxr #32 on RCUL_WalkOut_Done me
  RCUL_WalkOut_Done()        {
    this.pFS = sym('fadeOut');
    this.pFR = this.pVScale_Count;
  }

  // MENU.dxr #32 on BTN_ROLLOVER me, wSprite
  BTN_ROLLOVER(wSprite       )        {
    const myIDX = getPos(this.pBTN_NAV_Channels, wSprite);
    let myFile       ;
    if (eq(myIDX, 1)) {
      myFile = cat('MS1R_0', call(sym('get'), this.pRIU, sym('MS1R')));
    } else {
      if (eq(myIDX, 2)) {
        myFile = cat('MS2R_0', call(sym('get'), this.pRIU, sym('MS2R')));
      } else {
        if (eq(myIDX, 3)) {
          myFile = cat('MS3R_0', call(sym('get'), this.pRIU, sym('MS3R')));
        } else {
          if (eq(myIDX, 4)) {
            myFile = cat('MS4R_0', call(sym('get'), this.pRIU, sym('MS4R')));
          } else {
            if (eq(myIDX, 5)) {
              myFile = cat('MS5R_0', call(sym('get'), this.pRIU, sym('MS5R')));
            } else {
              if (eq(myIDX, 6)) {
                myFile = cat('MSTOP_0', call(sym('get'), this.pRIU, sym('MSTOP')));
              } else {
                if (eq(myIDX, 7)) {
                  myFile = cat('MOPT_0', call(sym('get'), this.pRIU, sym('MOPT')));
                }
              }
            }
          }
        }
      }
    }
    this.pAudioCueChannel = this.pRCUL_Channel;
    this.CP_Init(myFile);
  }

  // MENU.dxr #32 on BTN_ROLLOFF me, wSprite
  BTN_ROLLOFF(wSprite       )        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
      this.pTalkFile = VOID;
    }
    sendSprite(this.pRCUL_Channel, sym('default'));
    this.pCP_Flag = 0;
    this.pFS = 0;
    this.pNextFS = 0;
  }

  // MENU.dxr #32 on GO_OPT me
  GO_OPT()        {
    go('OPTIONS');
    this.pFS = 0;
  }

  // MENU.dxr #32 on GO_END me
  GO_END()        {
    dsClose();
    go('END');
    this.pFS = 0;
  }

  // MENU.dxr #32 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('BTN_NAV'))) {
      add(this.pBTN_NAV_Channels, wChannel);
    } else {
      if (eq(wLabel, sym('RCUL'))) {
        this.pRCUL_Channel = wChannel;
      }
    }
  }

  // MENU.dxr #32 on fadeOut me
  fadeOut()        {
    if (!truthy(this.pFR)) {
      go(1, getAt(['GM01', 'GM02', 'GM03', 'GM04', 'GM05'], this.pSelected_GameID));
      this.pFS = 0;
    } else {
      if (gt(this.pVScale_Index, 0)) {
        const myVolume = getAt(this.pVScale_Music, this.pVScale_Index);
        dsSetVolume(G.gSND_MenuMusic, myVolume);
        this.pVScale_Index = this.pVScale_Index - 1;
      }
      this.pFR = this.pFR - 1;
    }
  }
}
