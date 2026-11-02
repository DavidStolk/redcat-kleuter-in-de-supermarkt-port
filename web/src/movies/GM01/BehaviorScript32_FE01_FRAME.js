// GM01.dxr BehaviorScript 32 - FE01_FRAME (decomp/GM01/scripts/BehaviorScript 32 - FE01_FRAME.ls)
import {
  abort, alert, call, dsClose, dsDelSound, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G, go,
  movieCall, newObject, script, sendSprite, SetCursorPos, sprite, the, updateStage,
} from '../../runtime/api.js';
import {
  add, addAt, bool, cat, count, deleteOne, div, duplicate, eq, getAt, getPos, getaProp, gt, integer, listp,
  lt, max, min, neq, random, sym, truthy, value, VOID, voidp,            
} from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';
import { cutIntroTalk, requestSkipIntro } from '../skipIntro.js';

// Globals gCursor, gAppSettings are `G.*`. `get(pRIU, #X)` is sent to the RandomIndexUnit instance:
// `call(sym('get'), pRIU, ...)`. `add(pRIU, #X, n)` dispatches to its `add` handler (lingo.ts add).
// pCRS_Left/Right/Top/Bottom in beginSprite are not declared properties: plain locals.
export class FE01_FRAME extends LingoScript {
  static scriptName = 'FE01_FRAME';
  pFS        = VOID; pNextFS        = VOID; pFH        = VOID; pFR        = VOID; pHelpText        = VOID;
  pEC_Channel        = VOID; pPlayerLevel        = VOID; pKaasPlayChannels        = VOID; pKaasChannels        = VOID;
  pHotSpotChannels        = VOID; pHotSpotFocusList        = VOID; pHotSpotPlayList        = VOID; pKaasCount        = VOID;
  pPairList        = VOID; pPickList        = VOID; pLastChannel        = VOID; pSelectChannel1        = VOID;
  pSelectChannel2        = VOID; pSelectIndex1        = VOID; pSelectIndex2        = VOID; pSelectionNum        = VOID;
  pHoldCount        = VOID; pSelectionResult        = VOID; pSND_KaasShow        = VOID; pCuePointList        = VOID;
  pEF_NextStatus        = VOID; pBChar_Channels        = VOID; pBChar_Channel1        = VOID; pBMond_Channel        = VOID;
  pBOog_Channel        = VOID; pBCONT_Channel        = VOID; pBTN_Stop_Channel        = VOID; pAudioCueList        = VOID;
  pAudioCueChannel        = VOID; pRCUL_Channel        = VOID; pBTN_Channels        = VOID; pRIU        = VOID;
  pBC_Channel        = VOID; pBC_Cont_Channel        = VOID; pBC_Type        = VOID; pDSound        = VOID;
  pCPD_NameList        = VOID; pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID; pCPD_CPTimesList        = VOID;
  pCP_Name_List        = VOID; pCP_Time_List        = VOID; pCP_Count        = VOID; pCP_Index        = VOID;
  pCP_Frame        = VOID; pCP_Flag        = VOID; pCP_NextName        = VOID; pCP_NextTime        = VOID;
  pTalkFile        = VOID; pTalkFile_Flag        = VOID; pFixed_B_Type        = VOID; pFixed_PairPos        = VOID;
  pPath_Audio_Voice        = VOID; pPath_Audio_Music        = VOID; pPath_Audio_SndFx        = VOID;
  pLevel_Audio_Voice        = VOID; pLevel_Audio_Music        = VOID; pLevel_Audio_SndFx        = VOID;
  pSCLT_Channels        = VOID; pSCLT_Index        = VOID; pSND_WIN        = VOID; pSND_LOOSE        = VOID;
  pSND_BTN_BACK        = VOID; pBC_SND_SUFFIX        = VOID; pCRS_L        = VOID; pCRS_T        = VOID;
  pCRS_R        = VOID; pCRS_B        = VOID; pVScale_Music        = VOID; pVScale_Count        = VOID;
  pVScale_Index        = VOID;

  // GM01.dxr #32 on endSprite me
  endSprite()        {
    this.pRIU = VOID;
    dsClose();
  }

  // GM01.dxr #32 on beginSprite me
  beginSprite()        {
    const pCRS_Left = 0;
    const pCRS_Right = 640;
    const pCRS_Top = 0;
    const pCRS_Bottom = 480;
    void pCRS_Left; void pCRS_Right; void pCRS_Top; void pCRS_Bottom;
    this.pPlayerLevel = getaProp(G.gAppSettings, sym('PLAYER_LEVEL'));
    this.pHelpText = getaProp(G.gAppSettings, sym('HELP'));
    this.pFixed_B_Type = getaProp(G.gAppSettings, sym('FE01_FIXED_B_TYPE'));
    this.pFixed_PairPos = getaProp(G.gAppSettings, sym('FE01_FIXED_PAIRPOS'));
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('FE01_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('FE01_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('FE01_PATH_SNDFX'));
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
    dsOpen();
    const myFile = getaProp(G.gAppSettings, sym('FE01_FILE_MUSIC'));
    this.pDSound = dsNewSound(cat(this.pPath_Audio_Music, myFile), 0);
    dsSetVolume(this.pDSound, this.pLevel_Audio_Music);
    dsSetLoop(this.pDSound, 1);
    dsPlay(this.pDSound);
    this.pSND_WIN = dsNewSound(cat(this.pPath_Audio_SndFx, 'WIN.wav'), 0);
    dsSetVolume(this.pSND_WIN, this.pLevel_Audio_SndFx);
    this.pSND_LOOSE = dsNewSound(cat(this.pPath_Audio_SndFx, 'LOOSE.wav'), 0);
    dsSetVolume(this.pSND_LOOSE, this.pLevel_Audio_SndFx);
    this.pSND_BTN_BACK = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_BACK.wav'), 0);
    dsSetVolume(this.pSND_BTN_BACK, this.pLevel_Audio_SndFx);
    this.pRIU = newObject(script('RandomIndexUnit'));
    add(this.pRIU, sym('RC_GD'), 5);
    add(this.pRIU, sym('RC_FT'), 7);
    add(this.pRIU, sym('BC_Type'), 4);
    this.pKaasChannels = [];
    this.pHotSpotChannels = [];
    this.pHotSpotFocusList = [];
    this.pBTN_Channels = [];
    this.pKaasCount = 0;
    this.pPairList = [];
    this.pPickList = [];
    this.pBChar_Channels = [85, 92, 93, 94];
    this.pBChar_Channel1 = 85;
    this.pBCONT_Channel = 86;
    this.pBOog_Channel = 94;
    this.pBMond_Channel = 93;
    this.pSCLT_Channels = [];
    this.pSCLT_Index = 1;
    if (eq(this.pPlayerLevel, 1)) {
      this.pBC_SND_SUFFIX = ['07', '08', '09', '10', '11', '12'];
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        this.pBC_SND_SUFFIX = ['08', '09', '11', '12', '14', '15'];
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          this.pBC_SND_SUFFIX = ['01', '02', '03', '04', '05', '06'];
        }
      }
    }
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = 0;
  }

  // Port only (DEVIATIONS.md "Skipping Redcat's intro"): sent by the player on every mouse
  // press, before mouseDown (port/src/movies/skipIntro.ts).
  skipIntro()        {
    requestSkipIntro(this);
  }

  // GM01.dxr #32 on exitFrame me
  exitFrame()        {
    cutIntroTalk(this); // port only: skipIntro
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

  // GM01.dxr #32 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // GM01.dxr #32 on idle me
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

  // GM01.dxr #32 on CP_Init me, wFile
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

  // GM01.dxr #32 on CP_Passed me, wName
  CP_Passed(wName       )        {
    const myCPList = value(wName);
    if (truthy(listp(myCPList))) {
      for (const myProp of (myCPList           ).slice()) {
        sendSprite(this.pAudioCueChannel, myProp);
      }
    } else {
      this.pFS = this.pNextFS;
      this.pNextFS = 0;
    }
  }

  // GM01.dxr #32 on InitFrame me
  InitFrame()        {
    sendSprite(this.pRCUL_Channel, sym('setBTN_Channel'), this.pBTN_Stop_Channel);
    this.pKaasCount = count(this.pKaasChannels);
    sendSprite(this.pBC_Cont_Channel, sym('setData'), this.pPlayerLevel);
    this.initGame();
  }

  // GM01.dxr #32 on initGame me
  initGame()        {
    this.pKaasPlayChannels = duplicate(this.pKaasChannels);
    this.pSelectionResult = 0;
    this.pSelectChannel1 = VOID;
    this.pSelectChannel2 = VOID;
    const myRC = div(this.pKaasCount, 2);
    this.pPairList = [];
    for (let i = 1, n = myRC; i <= n; i++) {
      add(this.pPairList, i);
      add(this.pPairList, i);
    }
    if (!truthy(this.pFixed_PairPos)) {
      for (let i = 1, n = myRC; i <= n; i++) {
        addAt(this.pPairList, random(i), i);
      }
      for (let i = 1, n = myRC; i <= n; i++) {
        addAt(this.pPairList, random(i), i);
      }
    }
    let i = 1;
    for (const mySprite of (this.pKaasChannels           ).slice()) {
      sendSprite(mySprite, sym('reset'), this.pPlayerLevel, getAt(this.pPairList, i));
      i = i + 1;
    }
    for (const myChannel of (this.pKaasChannels           ).slice()) {
      sendSprite(myChannel, sym('place'));
    }
    this.pFS = sym('RCUL_WalkIn');
  }

  // GM01.dxr #32 on RCUL_WalkIn me
  RCUL_WalkIn()        {
    sendSprite(this.pRCUL_Channel, sym('WalkIn'));
    this.pFS = 0;
    if (eq(this.pHelpText, 1)) {
      this.pNextFS = sym('RCUL_Talk1');
    } else {
      if (eq(this.pHelpText, 0)) {
        this.pNextFS = sym('RCUL_OFF');
      }
    }
  }

  // GM01.dxr #32 on RCUL_OFF me
  RCUL_OFF()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '01RCULSH';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('Game_Play');
  }

  // GM01.dxr #32 on RCUL_Talk1 me
  RCUL_Talk1()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '01RCUL01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Talk2');
  }

  // GM01.dxr #32 on RCUL_Talk2 me
  RCUL_Talk2()        {
    const myFile = '01RCUL02';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_CheeseTurnIn');
  }

  // GM01.dxr #32 on RCUL_CheeseTurnIn me
  RCUL_CheeseTurnIn()        {
    sendSprite(26, sym('show'));
    sendSprite(26, sym('callBackOn'));
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Talk3');
  }

  // GM01.dxr #32 on RCUL_Talk3 me
  RCUL_Talk3()        {
    let myFile       ;
    if (eq(this.pPlayerLevel, 3)) {
      myFile = '01RCUL04';
    } else {
      myFile = '01RCUL03';
    }
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_CheeseTurnBack');
  }

  // GM01.dxr #32 on RCUL_CheeseTurnBack me
  RCUL_CheeseTurnBack()        {
    sendSprite(26, sym('hide'));
    sendSprite(26, sym('callBackOn'));
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Talk4');
  }

  // GM01.dxr #32 on RCUL_Talk4 me
  RCUL_Talk4()        {
    const myFile = 'RCULSTOP';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Talk5');
  }

  // GM01.dxr #32 on RCUL_Talk5 me
  RCUL_Talk5()        {
    const myFile = '01RCUL06';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('Game_Play');
  }

  // GM01.dxr #32 on Game_Play me
  Game_Play()        {
    for (const myChannel of (this.pKaasPlayChannels           ).slice()) {
      sendSprite(myChannel, sym('enable'));
    }
    this.pFS = 0;
  }

  // GM01.dxr #32 on SelectCheese me, wChannel
  SelectCheese(wChannel       )        {
    if (!truthy(this.pSelectChannel1)) {
      this.pSelectChannel1 = wChannel;
      sendSprite(wChannel, sym('show'));
    } else {
      for (const myChannel of (this.pKaasPlayChannels           ).slice()) {
        sendSprite(myChannel, sym('Disable'));
      }
      this.pSelectChannel2 = wChannel;
      sendSprite(wChannel, sym('show'));
      sendSprite(wChannel, sym('callBackOn'));
      const myIndex1 = getPos(this.pKaasChannels, this.pSelectChannel1);
      const myIndex2 = getPos(this.pKaasChannels, this.pSelectChannel2);
      this.pSelectionResult = bool(eq(getAt(this.pPairList, myIndex1), getAt(this.pPairList, myIndex2)));
      if (truthy(this.pSelectionResult)) {
        sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('startflash'));
        this.pSelectionNum = getAt(this.pPairList, myIndex1);
      }
      this.pNextFS = sym('ShowBothCheese_Done');
    }
  }

  // GM01.dxr #32 on HideCheese1 me
  HideCheese1()        {
    if (truthy(this.pSelectionResult)) {
      sendSprite(this.pSelectChannel1, sym('remove'));
    } else {
      sendSprite(this.pSelectChannel1, sym('hide'));
    }
    this.pFS = 0;
    this.pNextFS = sym('HideCheese2');
  }

  // GM01.dxr #32 on HideCheese2 me
  HideCheese2()        {
    this.pFS = 0;
    if (truthy(this.pSelectionResult)) {
      sendSprite(this.pSelectChannel2, sym('remove'));
      this.pNextFS = sym('SelectRight_Done');
    } else {
      sendSprite(this.pSelectChannel2, sym('hide'));
      this.pNextFS = sym('SelectWrong_Done');
    }
  }

  // GM01.dxr #32 on ShowBothCheese_Done (no `me` parameter)
  ShowBothCheese_Done()        {
    if (truthy(this.pSelectionResult)) {
      dsPlay(this.pSND_WIN);
      this.pFS = sym('RC_Talk_Right');
    } else {
      dsPlay(this.pSND_LOOSE);
      this.pFS = sym('RC_Talk_Wrong');
    }
    this.pFH = 2;
  }

  // GM01.dxr #32 on RC_Talk_Right me
  RC_Talk_Right()        {
    const myIDX = call(sym('get'), this.pRIU, sym('RC_GD'));
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = cat('01RCGD0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('BC_WalkIn');
  }

  // GM01.dxr #32 on RC_Talk_Wrong me
  RC_Talk_Wrong()        {
    const myIDX = call(sym('get'), this.pRIU, sym('RC_FT'));
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = cat('01RCFT0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('HideCheese1');
  }

  // GM01.dxr #32 on SelectWrong_Done me
  SelectWrong_Done()        {
    this.pSelectChannel1 = 0;
    this.pSelectChannel2 = 0;
    for (const myChannel of (this.pKaasPlayChannels           ).slice()) {
      sendSprite(myChannel, sym('enable'));
    }
    this.pFS = 0;
  }

  // GM01.dxr #32 on SelectRight_Done me
  SelectRight_Done()        {
    sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('stopFlash'));
    deleteOne(this.pKaasPlayChannels, this.pSelectChannel1);
    deleteOne(this.pKaasPlayChannels, this.pSelectChannel2);
    this.pSelectChannel1 = 0;
    this.pSelectChannel2 = 0;
    this.pFS = 0;
    if (eq(count(this.pKaasPlayChannels), 0)) {
      this.HOERA_INIT();
    } else {
      this.pSCLT_Index = this.pSCLT_Index + 1;
      for (const myChannel of (this.pKaasPlayChannels           ).slice()) {
        sendSprite(myChannel, sym('enable'));
      }
    }
  }

  // GM01.dxr #32 on BC_WalkIn me
  BC_WalkIn()        {
    if (!truthy(this.pFixed_B_Type)) {
      this.pBC_Type = call(sym('get'), this.pRIU, sym('BC_Type'));
    } else {
      this.pBC_Type = this.pFixed_B_Type;
    }
    sendSprite(this.pBC_Channel, sym('setData'), this.pBC_Type);
    sendSprite(this.pBC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pNextFS = sym('BC_Talk');
  }

  // GM01.dxr #32 on BC_Talk me
  BC_Talk()        {
    let myChar       ;
    if (lt(this.pBC_Type, 3)) {
      myChar = sym('BR');
    } else {
      myChar = sym('MX');
    }
    sendSprite(this.pBC_Channel + 1, sym('setLoc'), sprite(this.pBC_Channel).loc);
    sendSprite(this.pBC_Channel + 1, sym('setAnim'), this.pSelectionNum);
    const mySND_REF = getAt(this.pBC_SND_SUFFIX, this.pSelectionNum);
    this.pAudioCueChannel = this.pBC_Channel;
    const myFile = cat('01', myChar, 'WB', mySND_REF);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('BC_WalkOut');
  }

  // GM01.dxr #32 on BC_WalkOut me
  BC_WalkOut()        {
    sendSprite(this.pBC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('HideCheese1');
  }

  // GM01.dxr #32 on BTN_BACK me
  BTN_BACK()        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
    }
    this.pTalkFile = VOID;
    this.pTalkFile_Flag = 0;
    this.pCP_Flag = 0;
    dsPlay(this.pSND_BTN_BACK);
    sendSprite(this.pRCUL_Channel, sym('halt'));
    sendSprite(this.pBC_Channel, sym('halt'));
    for (const myChannel of (this.pKaasChannels           ).slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    sendSprite(this.pEC_Channel, sym('halt'));
    for (const myChannel of (this.pSCLT_Channels           ).slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    this.pFS = sym('GO_MENU');
    this.pFH = 4;
    this.pNextFS = 0;
  }

  // GM01.dxr #32 on GO_MENU me
  GO_MENU()        {
    this.pFS = sym('fadeOut');
    this.pFR = this.pVScale_Count;
  }

  // GM01.dxr #32 on fadeOut me
  fadeOut()        {
    if (!truthy(this.pFR)) {
      go(1, 'MENU');
      this.pFS = 0;
    } else {
      if (gt(this.pVScale_Index, 0)) {
        const myVolume = getAt(this.pVScale_Music, this.pVScale_Index);
        dsSetVolume(this.pDSound, myVolume);
        this.pVScale_Index = this.pVScale_Index - 1;
      }
      this.pFR = this.pFR - 1;
    }
  }

  // GM01.dxr #32 on HOERA_INIT me
  HOERA_INIT()        {
    sendSprite(this.pRCUL_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('HOERA_INIT2');
  }

  // GM01.dxr #32 on HOERA_INIT2 me
  HOERA_INIT2()        {
    sendSprite(this.pEC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('HOERA_2');
  }

  // GM01.dxr #32 on HOERA_2 me
  HOERA_2()        {
    this.pAudioCueChannel = this.pEC_Channel;
    const myFile = 'GOVER_01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('HOERA_3');
  }

  // GM01.dxr #32 on HOERA_3 me
  HOERA_3()        {
    sendSprite(this.pEC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('HOERA_4');
  }

  // GM01.dxr #32 on HOERA_4 me
  HOERA_4()        {
    this.pFS = sym('GO_MENU');
  }

  // GM01.dxr #32 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('BTN_BACK'))) {
      this.pBTN_Stop_Channel = wChannel;
    } else {
      if (eq(wLabel, sym('Kaas'))) {
        add(this.pKaasChannels, wChannel);
      } else {
        if (eq(wLabel, sym('RCUL'))) {
          this.pRCUL_Channel = wChannel;
        } else {
          if (eq(wLabel, sym('BC'))) {
            this.pBC_Channel = wChannel;
          } else {
            if (eq(wLabel, sym('CONT'))) {
              this.pBC_Cont_Channel = wChannel;
            } else {
              if (eq(wLabel, sym('SCLT'))) {
                add(this.pSCLT_Channels, wChannel);
              } else {
                if (eq(wLabel, sym('EC'))) {
                  this.pEC_Channel = wChannel;
                }
              }
            }
          }
        }
      }
    }
  }
}
