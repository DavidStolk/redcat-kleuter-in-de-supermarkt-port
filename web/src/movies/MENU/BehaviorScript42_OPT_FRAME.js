// MENU.dxr BehaviorScript 42 - OPT_FRAME (decomp/MENU/scripts/BehaviorScript 42 - OPT_FRAME.ls)
import {
  abort, alert, call, dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, go, sendSprite, SetCursorPos, sprite,
  the, updateStage,
} from '../../runtime/api.js';
import {
  add, cat, count, deleteOne, eq, getAt, getPos, getaProp, integer, listp, lt, max, min, neq, setaProp, sym,
  truthy, value, VOID, voidp,            
} from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Globals gCursor, gAppSettings, gSND_MenuBTN are `G.*`.
// The pCPD_* lists, pAudioCueList, pTalkFile etc. are never filled in this script (CP_Init and
// CP_Passed are dead code in OPTIONS); ported as is.
export class OPT_FRAME extends LingoScript {
  static scriptName = 'OPT_FRAME';
  pFS        = VOID; pFH        = VOID; pNextFS        = VOID; pBTN_HLP_Channel        = VOID;
  pPLV_BTN_Channels        = VOID; pLastPLV_Channel        = VOID; pBTN_SLD_Channels        = VOID;
  pSND_ID_Voice        = VOID; pSND_ID_SndFx        = VOID; pSND_ID_Music        = VOID;
  pIdleThreadList        = VOID; pPath_Audio_Music        = VOID; pPath_Audio_Voice        = VOID;
  pPath_Audio_SndFx        = VOID; pLevel_Audio_Music        = VOID; pLevel_Audio_Voice        = VOID;
  pLevel_Audio_SndFx        = VOID; pSND_BTN_1        = VOID; pSND_BTN_2        = VOID;
  pRCUL_Channel        = VOID; pAudioCueList        = VOID; pAudioCueChannel        = VOID;
  pTalkFile_Flag        = VOID; pTalkFile        = VOID; pCP_Flag        = VOID; pCP_Frame        = VOID;
  pCP_Index        = VOID; pCP_Count        = VOID; pCP_NextTime        = VOID; pCP_NextName        = VOID;
  pCP_Time_List        = VOID; pCP_Name_List        = VOID; pCPD_NameList        = VOID;
  pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID; pCPD_CPTimesList        = VOID;
  pCRS_L        = VOID; pCRS_T        = VOID; pCRS_R        = VOID; pCRS_B        = VOID;

  // MENU.dxr #42 on endSprite me
  endSprite()        {
    setaProp(G.gAppSettings, sym('MNU_UL'), -1);
  }

  // MENU.dxr #42 on beginSprite me
  beginSprite()        {
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('MNU_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('MNU_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('MNU_PATH_SNDFX'));
    this.pLevel_Audio_Music = getaProp(G.gAppSettings, sym('VOLUME_MUSIC'));
    this.pLevel_Audio_Voice = getaProp(G.gAppSettings, sym('VOLUME_VOICE'));
    this.pLevel_Audio_SndFx = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pCRS_L = getaProp(G.gAppSettings, sym('CURSOR_LEFT'));
    this.pCRS_T = getaProp(G.gAppSettings, sym('CURSOR_TOP'));
    this.pCRS_R = getaProp(G.gAppSettings, sym('CURSOR_RIGHT'));
    this.pCRS_B = getaProp(G.gAppSettings, sym('CURSOR_BOTTOM'));
    this.pIdleThreadList = [];
    this.pBTN_SLD_Channels = [];
    this.pPLV_BTN_Channels = [];
  }

  // MENU.dxr #42 on InitFrame me
  // `BTN_HLP_Channel` (no `p`) is not a property of this script: an undeclared local, always VOID
  // (original bug, kept).
  InitFrame()        {
    for (const myChannel of this.pBTN_SLD_Channels.slice()) {
      sendSprite(myChannel, sym('setSliderStep'), 10);
      sendSprite(myChannel, sym('setSliderPos'), 1);
    }
    const myOnID = getaProp(G.gAppSettings, sym('PLAYER_LEVEL'));
    const BTN_HLP_Channel        = VOID;
    sendSprite(BTN_HLP_Channel, sym('switch'), 1);
    let i = 1;
    for (const myChannel of this.pPLV_BTN_Channels.slice()) {
      if (eq(i, myOnID)) {
        sendSprite(myChannel, sym('Disable'));
        this.pLastPLV_Channel = myChannel;
      }
      i = i + 1;
    }
    sendSprite(this.pRCUL_Channel, sym('init'));
  }

  // MENU.dxr #42 on exitFrame me
  exitFrame()        {
    if (eq(this.pTalkFile_Flag, 1)) {
      this.pTalkFile_Flag = 0;
      dsPlay(this.pTalkFile);
    }
    if (truthy(this.pCP_Flag)) {
      if (eq(this.pCP_Frame, this.pCP_NextTime)) {
        call(sym('CP_Passed'), this, this.pCP_NextName);
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

  // MENU.dxr #42 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // MENU.dxr #42 on idle me
  idle()        {
    if (truthy(count(this.pIdleThreadList))) {
      call(sym('update'), this.pIdleThreadList);
    }
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

  // MENU.dxr #42 on CP_Init me, wFile
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

  // MENU.dxr #42 on CP_Passed me, wName
  CP_Passed(wName       )        {
    const myCPList = value(wName);
    if (truthy(listp(myCPList))) {
      for (const myProp of myCPList.slice()) {
        sendSprite(this.pAudioCueChannel, getaProp(this.pAudioCueList, myProp));
      }
    } else {
      this.pFS = this.pNextFS;
      this.pNextFS = 0;
    }
  }

  // MENU.dxr #42 on BTN_NAV me
  BTN_NAV()        {
    if (!truthy(voidp(G.gSND_MenuBTN))) {
      dsDelSound(G.gSND_MenuBTN);
      G.gSND_MenuBTN = VOID;
    }
    G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_BACK.wav'), 0);
    dsSetVolume(G.gSND_MenuBTN, this.pLevel_Audio_Voice);
    dsPlay(G.gSND_MenuBTN);
    this.pFS = sym('GO_MNU');
  }

  // MENU.dxr #42 on GO_MNU me
  GO_MNU()        {
    go('MENU');
    this.pFS = 0;
  }

  // MENU.dxr #42 on BTN_Help me, wSwitch
  BTN_Help(wSwitch       )        {
    if (!truthy(voidp(G.gSND_MenuBTN))) {
      dsDelSound(G.gSND_MenuBTN);
      G.gSND_MenuBTN = VOID;
    }
    if (eq(wSwitch, 1)) {
      G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_Voice, 'OPTHLP02.wav'), 0);
    } else {
      if (eq(wSwitch, 2)) {
        G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_Voice, 'OPTHLP03.wav'), 0);
      }
    }
    dsSetVolume(G.gSND_MenuBTN, this.pLevel_Audio_Voice);
    dsPlay(G.gSND_MenuBTN);
  }

  // MENU.dxr #42 on BTN_NIVEAU me
  BTN_NIVEAU()        {
  }

  // MENU.dxr #42 on BTN_PLV me, wSprite
  BTN_PLV(wSprite       )        {
    const myID = getPos(this.pPLV_BTN_Channels, wSprite);
    sendSprite(this.pLastPLV_Channel, sym('enable'));
    this.pLastPLV_Channel = wSprite;
    setaProp(G.gAppSettings, sym('PLAYER_LEVEL'), myID);
    if (!truthy(voidp(G.gSND_MenuBTN))) {
      dsDelSound(G.gSND_MenuBTN);
      G.gSND_MenuBTN = VOID;
    }
    G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_Voice, 'OPTNVO0', myID, '.wav'), 0);
    dsSetVolume(G.gSND_MenuBTN, this.pLevel_Audio_Voice);
    dsPlay(G.gSND_MenuBTN);
  }

  // MENU.dxr #42 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('BTN_PLV'))) {
      add(this.pPLV_BTN_Channels, wChannel);
    } else {
      if (eq(wLabel, sym('BTN_HLP'))) {
        this.pBTN_HLP_Channel = wChannel;
      } else {
        if (eq(wLabel, sym('BTN_SLD'))) {
          add(this.pBTN_SLD_Channels, wChannel);
        } else {
          if (eq(wLabel, sym('RCUL'))) {
            this.pRCUL_Channel = wChannel;
          }
        }
      }
    }
  }

  // MENU.dxr #42 on startIdleThreading me, wInstance
  startIdleThreading(wInstance       )        {
    add(this.pIdleThreadList, wInstance);
  }

  // MENU.dxr #42 on stopIdleThreading me, wInstance
  stopIdleThreading(wInstance       )        {
    deleteOne(this.pIdleThreadList, wInstance);
  }
}
