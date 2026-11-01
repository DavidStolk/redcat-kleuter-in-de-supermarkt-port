// GM03.dxr BehaviorScript 42 - FE03_FRAME (decomp/GM03/scripts/BehaviorScript 42 - FE03_FRAME.ls)
import { abort, alert, call, dsClose, dsDelSound, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, dsStop, G, go, member, movieCall, newObject, script, sendSprite, SetCursorPos, sprite, the, updateStage } from '../../runtime/api.js';
import { add, cat, charOf, count, eq, getAt, getaProp, getPos, gt, integer, listp, lt, max, min, minus, neq, plus, random, sym, truthy, value, voidp, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

const S = (n        ) => sym(n);

export class FE03_FRAME extends LingoScript {
  static scriptName = 'FE03_FRAME';
  pHelpText        = VOID; pEC_Channel        = VOID; pFS        = VOID; pNextFS        = VOID;
  pFH        = VOID; pFR        = VOID; pPlayerLevel        = VOID; pAudioCueList        = VOID;
  pAudioCueChannel        = VOID; pBTN_Stop_Channel        = VOID; pRCUL_Channel        = VOID;
  pKAS_Channel        = VOID; pBTN_Channels        = VOID; pClick        = VOID; pClickResult        = VOID;
  pLBD_Channel        = VOID; pLBD_MemList        = VOID; pLBD_ValList        = VOID;
  pLBD_IndexList        = VOID; pLBD_Index        = VOID; pLBD_Count        = VOID;
  pVlek_Channels        = VOID; pKasKey_Channels        = VOID; pLBD_Num        = VOID;
  pBLN_Free_Channels        = VOID; pBLN_Busy_Channels        = VOID; pGridBLN_List        = VOID;
  pGridBLN_Index        = VOID; pRIU        = VOID; pDSound        = VOID; pTalkFile        = VOID;
  pTalkFile_Flag        = VOID; pSND_LBNW        = VOID; pPath_Audio_Voice        = VOID;
  pPath_Audio_Music        = VOID; pPath_Audio_SndFx        = VOID; pLevel_Audio_Voice        = VOID;
  pLevel_Audio_Music        = VOID; pLevel_Audio_SndFx        = VOID; pCP_Name_List        = VOID;
  pCP_Time_List        = VOID; pCP_Count        = VOID; pCP_Index        = VOID; pCP_Frame        = VOID;
  pCP_Flag        = VOID; pCP_NextName        = VOID; pCP_NextTime        = VOID;
  pCPD_NameList        = VOID; pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID;
  pCPD_CPTimesList        = VOID; pSND_Zoom        = VOID; pSCLT_Channels        = VOID;
  pSCLT_Index        = VOID; pSND_WIN        = VOID; pSND_LOOSE        = VOID; pSND_KSKNB        = VOID;
  pSND_BTN_BACK        = VOID; pBLN_Index        = VOID; pVScale_Music        = VOID;
  pVScale_Count        = VOID; pVScale_Index        = VOID; pCRS_L        = VOID; pCRS_T        = VOID;
  pCRS_R        = VOID; pCRS_B        = VOID;

  // GM03.dxr #42 on endSprite me
  endSprite()        {
    this.pRIU = VOID;
    dsClose();
  }

  // GM03.dxr #42 on beginSprite me
  beginSprite()        {
    this.pPlayerLevel = getaProp(G.gAppSettings, S('PLAYER_LEVEL'));
    this.pHelpText = getaProp(G.gAppSettings, S('HELP'));
    this.pPath_Audio_Music = getaProp(G.gAppSettings, S('FE03_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, S('FE03_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, S('FE03_PATH_SNDFX'));
    this.pLevel_Audio_Music = getaProp(G.gAppSettings, S('VOLUME_MUSIC'));
    this.pLevel_Audio_Voice = getaProp(G.gAppSettings, S('VOLUME_VOICE'));
    this.pLevel_Audio_SndFx = getaProp(G.gAppSettings, S('VOLUME_SNDFX'));
    this.pVScale_Music = getaProp(G.gAppSettings, S('VSCALE_MUSIC'));
    this.pVScale_Count = count(this.pVScale_Music);
    this.pVScale_Index = getPos(this.pVScale_Music, this.pLevel_Audio_Music);
    this.pCRS_L = getaProp(G.gAppSettings, S('CURSOR_LEFT'));
    this.pCRS_T = getaProp(G.gAppSettings, S('CURSOR_TOP'));
    this.pCRS_R = getaProp(G.gAppSettings, S('CURSOR_RIGHT'));
    this.pCRS_B = getaProp(G.gAppSettings, S('CURSOR_BOTTOM'));
    const myData = value(movieCall('readTextFile', cat(this.pPath_Audio_Voice, 'voice.cpd')));
    this.pCPD_NameList = getAt(myData, 1);
    this.pCPD_FileList = getAt(myData, 2);
    this.pCPD_CPNamesList = getAt(myData, 3);
    this.pCPD_CPTimesList = getAt(myData, 4);
    dsOpen();
    const myFile = getaProp(G.gAppSettings, S('FE03_FILE_MUSIC'));
    this.pDSound = dsNewSound(cat(this.pPath_Audio_Music, myFile), 0);
    dsSetVolume(this.pDSound, this.pLevel_Audio_Music);
    dsSetLoop(this.pDSound, 1);
    dsPlay(this.pDSound);
    this.pSND_WIN = dsNewSound(cat(this.pPath_Audio_SndFx, 'WIN.wav'), 0);
    dsSetVolume(this.pSND_WIN, this.pLevel_Audio_SndFx);
    this.pSND_LOOSE = dsNewSound(cat(this.pPath_Audio_SndFx, 'LOOSE.wav'), 0);
    dsSetVolume(this.pSND_LOOSE, this.pLevel_Audio_SndFx);
    this.pSND_KSKNB = dsNewSound(cat(this.pPath_Audio_SndFx, 'KSKNB_01.wav'), 0);
    dsSetVolume(this.pSND_KSKNB, this.pLevel_Audio_SndFx);
    this.pSND_Zoom = dsNewSound(cat(this.pPath_Audio_SndFx, 'Zoom.wav'), 0);
    dsSetLoop(this.pSND_Zoom, 1);
    dsSetVolume(this.pSND_Zoom, this.pLevel_Audio_SndFx);
    this.pSND_BTN_BACK = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_BACK.wav'), 0);
    dsSetVolume(this.pSND_BTN_BACK, this.pLevel_Audio_SndFx);
    this.pRIU = newObject(script('RandomIndexUnit'));
    add(this.pRIU, S('KS_GD_RC'), 8);
    add(this.pRIU, S('KS_FT_RC'), 8);
    add(this.pRIU, S('KS_LT_RC'), 4);
    add(this.pRIU, S('KS_RA_RC'), 4);
    this.pVlek_Channels = [];
    this.pKasKey_Channels = [];
    this.pBLN_Free_Channels = [];
    this.pBLN_Busy_Channels = [];
    this.pGridBLN_List = [];
    this.pSCLT_Channels = [];
    this.pSCLT_Index = 1;
    this.pBTN_Channels = [];
    this.pBLN_Index = 1;
    const myREFMEM = member(cat('MIDX_FE03_CNT', this.pPlayerLevel, '_', random(1))).memberNum;
    const myC = 6;
    this.pLBD_MemList = [];
    for (let i = 1; i <= myC; i++) {
      add(this.pLBD_MemList, i);
    }
    this.pLBD_MemList = plus(this.pLBD_MemList, myREFMEM);
    this.pLBD_Count = count(this.pLBD_MemList);
    this.pLBD_Index = this.pLBD_Count;
    this.pLBD_IndexList = [];
    for (let i = 1, n = this.pLBD_Count; i <= n; i++) {
      add(this.pLBD_IndexList, i);
    }
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = 0;
  }

  // GM03.dxr #42 on idle me
  idle()        {
    const myMH = the.mouseH;
    const myMV = the.mouseV;
    const myRH = min(this.pCRS_R, max(this.pCRS_L, myMH));
    const myRV = min(this.pCRS_B, max(this.pCRS_T, myMV));
    if (neq(myMH, myRH) || neq(myMV, myRV)) {
      SetCursorPos(plus(the.stageLeft, myRH), plus(the.stageTop, myRV));
    }
    sprite(119).locH = the.mouseH;
    sprite(119).locV = the.mouseV;
    updateStage();
  }

  // GM03.dxr #42 on CP_Init me, wFile
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

  // GM03.dxr #42 on CP_Passed me, wName
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

  // GM03.dxr #42 on exitFrame me
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

  // GM03.dxr #42 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // GM03.dxr #42 on InitFrame me
  InitFrame()        {
    sendSprite(this.pRCUL_Channel, S('setBTN_Channel'), this.pBTN_Stop_Channel);
    sendSprite(this.pRCUL_Channel, S('init'), this.pKAS_Channel, this.pBTN_Stop_Channel);
    sendSprite(this.pKAS_Channel, S('display'), this.pPlayerLevel);
    sendSprite(this.pLBD_Channel, S('setMem'), getAt(this.pLBD_MemList, random(this.pLBD_Count)));
    sendSprite(this.pLBD_Channel, S('display'));
    this.pFS = S('RCUL_WalkIn');
    this.pFH = 0;
  }

  // GM03.dxr #42 on RCUL_WalkIn me
  RCUL_WalkIn()        {
    sendSprite(this.pRCUL_Channel, S('WalkIn'));
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = S('RCUL_WalkIn_Done');
  }

  // GM03.dxr #42 on RCUL_WalkIn_Done me
  RCUL_WalkIn_Done()        {
    if (!truthy(this.pHelpText)) {
      this.pFS = S('RCUL_ULOFF');
    } else {
      this.pFS = S('RCUL_UL1');
    }
    this.pFH = 0;
  }

  // GM03.dxr #42 on RCUL_ULOFF me
  RCUL_ULOFF()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    let myFile       ;
    if (gt(this.pPlayerLevel, 1)) {
      myFile = getAt(['03RCULS1', '03RCULS2'], random(2));
    } else {
      myFile = '03RCULS3';
    }
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = S('RCUL_END');
  }

  // GM03.dxr #42 on RCUL_UL1 me
  RCUL_UL1()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '03RCUL01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = S('RCUL_UL2');
  }

  // GM03.dxr #42 on RCUL_UL2 me
  RCUL_UL2()        {
    let myFile       ;
    if (gt(this.pPlayerLevel, 1)) {
      myFile = '03RCUL03';
    } else {
      myFile = '03RCUL02';
    }
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = S('RCUL_UL3');
  }

  // GM03.dxr #42 on RCUL_UL3 me
  RCUL_UL3()        {
    const myFile = '03RCUL04';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = S('RCUL_UL4');
  }

  // GM03.dxr #42 on RCUL_UL4 me
  RCUL_UL4()        {
    const myFile = '03RCUL05';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = S('RCUL_END');
  }

  // GM03.dxr #42 on RCUL_END me
  RCUL_END()        {
    sendSprite(this.pRCUL_Channel, S('setDefault'));
    sendSprite(this.pLBD_Channel, S('Plof'), 1);
    this.pFS = 0;
    this.pNextFS = S('StartGame');
  }

  // GM03.dxr #42 on StartGame me
  StartGame()        {
    dsPlay(this.pSND_Zoom);
    for (const myChannel of this.pVlek_Channels.slice()) {
      sendSprite(myChannel, S('Start'));
    }
    this.pFS = S('LBD_New');
    this.pFH = 0;
  }

  // GM03.dxr #42 on LBD_New me
  // ShuffleList(...) is a movie-script handler (MovieScript 14, first in cast order).
  LBD_New()        {
    if (eq(this.pLBD_Index, this.pLBD_Count)) {
      this.pLBD_IndexList = movieCall('ShuffleList', this.pLBD_IndexList);
      this.pLBD_Index = 1;
    } else {
      this.pLBD_Index = this.pLBD_Index + 1;
    }
    const myIndex = getAt(this.pLBD_IndexList, this.pLBD_Index);
    this.pLBD_Num = value(charOf(member(getAt(this.pLBD_MemList, myIndex)).name, 2));
    sendSprite(this.pLBD_Channel, S('setMem'), getAt(this.pLBD_MemList, myIndex));
    sendSprite(this.pLBD_Channel, S('roll'));
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = S('LBD_TimesUp');
  }

  // GM03.dxr #42 on enable_Kassa me
  enable_Kassa()        {
    for (const myChannel of this.pKasKey_Channels.slice()) {
      sendSprite(myChannel, S('enable'));
    }
  }

  // GM03.dxr #42 on LBD_TimesUp me
  LBD_TimesUp()        {
    for (const myChannel of this.pKasKey_Channels.slice()) {
      sendSprite(myChannel, S('Disable'));
    }
    sendSprite(this.pLBD_Channel, S('Plof'), 1);
    this.pFS = 0;
    this.pFH = 6;
    this.pNextFS = S('LBD_TimesUp_Done');
  }

  // GM03.dxr #42 on LBD_TimesUp_Done me
  LBD_TimesUp_Done()        {
    dsPlay(this.pSND_LOOSE);
    this.pFS = S('RCLB_Talk_ToLate');
  }

  // GM03.dxr #42 on RCLB_Talk_ToLate me
  RCLB_Talk_ToLate()        {
    const myIDX = call(S('get'), this.pRIU, S('KS_LT_RC'));
    const myFile = cat('03RCLT0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = S('LBD_New');
  }

  // GM03.dxr #42 on KasKey_Select me, wSprite
  KasKey_Select(wSprite       )        {
    for (const myChannel of this.pKasKey_Channels.slice()) {
      sendSprite(myChannel, S('Disable'));
    }
    this.pClick = getPos(this.pKasKey_Channels, wSprite);
    if (eq(this.pClick, this.pLBD_Num)) {
      this.pClickResult = 1;
      sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), S('startflash'));
    } else {
      this.pClickResult = 0;
    }
    dsPlay(this.pSND_KSKNB);
    this.pFS = S('KasKey_Release');
    this.pFH = 1;
  }

  // GM03.dxr #42 on KasKey_Release me
  KasKey_Release()        {
    const myChannel = getAt(this.pKasKey_Channels, this.pClick);
    sendSprite(myChannel, S('reset'));
    if (truthy(this.pClickResult)) {
      sendSprite(getAt(this.pBLN_Free_Channels, this.pBLN_Index), S('blowUp'), sprite(this.pLBD_Channel).loc, this.pLBD_Num, getAt(this.pGridBLN_List, this.pBLN_Index));
      this.pBLN_Index = this.pBLN_Index + 1;
      this.pFH = 6;
      sendSprite(this.pLBD_Channel, S('Plof'), 0);
    } else {
      this.pFH = 0;
      sendSprite(this.pLBD_Channel, S('Plof'), 1);
    }
    this.pFS = 0;
    this.pNextFS = S('SNDFX_WINLOOSE');
  }

  // GM03.dxr #42 on SNDFX_WINLOOSE me
  SNDFX_WINLOOSE()        {
    if (!truthy(this.pClickResult)) {
      dsPlay(this.pSND_LOOSE);
      this.pFS = S('RCLB_TalkWrong');
    } else {
      dsPlay(this.pSND_WIN);
      this.pFS = S('RCLB_TalkRight1');
    }
    this.pFH = 2;
  }

  // GM03.dxr #42 on RCLB_TalkRight1 me
  RCLB_TalkRight1()        {
    const myIDX = call(S('get'), this.pRIU, S('KS_GD_RC'));
    const myFile = cat('03RCGD0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 1;
    this.pNextFS = S('RCLB_TalkRight2');
  }

  // GM03.dxr #42 on RCLB_TalkRight2 me
  RCLB_TalkRight2()        {
    let myFile       ;
    if (eq(this.pPlayerLevel, 1)) {
      myFile = cat('03RCR10', this.pClick);
      this.pNextFS = S('RCLB_TalkRight_Done');
    } else {
      const myIDX = call(S('get'), this.pRIU, S('KS_RA_RC'));
      if (eq(this.pClick, 1)) {
        myFile = '03RCR101';
        this.pNextFS = S('RCLB_TalkRight_Done');
      } else {
        myFile = getAt(['03RCR201', '03RCR202', '03RCR203', '03RCR205'], myIDX);
        this.pNextFS = S('RCLB_TalkRight3');
      }
    }
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 1;
  }

  // GM03.dxr #42 on RCLB_TalkRight3 me
  RCLB_TalkRight3()        {
    const myFile = cat('RCTL0', this.pClick, 'A');
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = S('RCLB_TalkRight_Done');
  }

  // GM03.dxr #42 on RCLB_TalkWrong me
  RCLB_TalkWrong()        {
    const myIDX = call(S('get'), this.pRIU, S('KS_FT_RC'));
    const myFile = cat('03RCFT0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = S('RCLB_TalkWrong_Done');
  }

  // GM03.dxr #42 on RCLB_TalkRight_Done me
  RCLB_TalkRight_Done()        {
    sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), S('stopFlash'));
    this.pSCLT_Index = this.pSCLT_Index + 1;
    if (gt(this.pSCLT_Index, count(this.pSCLT_Channels))) {
      this.pFS = 0;
      if (!truthy(voidp(this.pSND_Zoom))) {
        dsStop(this.pSND_Zoom);
        this.pSND_Zoom = VOID;
      }
      for (const myChannel of this.pVlek_Channels.slice()) {
        sendSprite(myChannel, S('stop'));
      }
      this.HOERA_INIT();
    } else {
      this.pFS = S('LBD_New');
    }
  }

  // GM03.dxr #42 on RCLB_TalkWrong_Done me
  RCLB_TalkWrong_Done()        {
    this.pFS = S('LBD_New');
  }

  // GM03.dxr #42 on HOERA_INIT me
  HOERA_INIT()        {
    sendSprite(this.pRCUL_Channel, S('WalkOut'));
    this.pFS = 0;
    this.pNextFS = S('HOERA_INIT2');
  }

  // GM03.dxr #42 on HOERA_INIT2 me
  HOERA_INIT2()        {
    sendSprite(this.pEC_Channel, S('WalkIn'));
    this.pFS = 0;
    this.pNextFS = S('HOERA_2');
  }

  // GM03.dxr #42 on HOERA_2 me
  HOERA_2()        {
    this.pAudioCueChannel = this.pEC_Channel;
    const myFile = 'GOVER_01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = S('HOERA_3');
  }

  // GM03.dxr #42 on HOERA_3 me
  HOERA_3()        {
    sendSprite(this.pEC_Channel, S('WalkOut'));
    this.pFS = 0;
    this.pNextFS = S('HOERA_4');
  }

  // GM03.dxr #42 on HOERA_4 me
  HOERA_4()        {
    this.pFS = S('GO_MENU');
  }

  // GM03.dxr #42 on BTN_BACK me
  BTN_BACK()        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
    }
    this.pTalkFile = VOID;
    this.pTalkFile_Flag = 0;
    this.pCP_Flag = 0;
    dsPlay(this.pSND_BTN_BACK);
    sendSprite(this.pRCUL_Channel, S('halt'));
    sendSprite(this.pLBD_Channel, S('halt'));
    sendSprite(this.pEC_Channel, S('halt'));
    if (!truthy(voidp(this.pSND_Zoom))) {
      dsStop(this.pSND_Zoom);
      this.pSND_Zoom = VOID;
    }
    for (const myChannel of this.pVlek_Channels.slice()) {
      sendSprite(myChannel, S('stop'));
    }
    for (const myChannel of this.pSCLT_Channels.slice()) {
      sendSprite(myChannel, S('halt'));
    }
    for (const myChannel of this.pBLN_Free_Channels.slice()) {
      sendSprite(myChannel, S('halt'));
    }
    this.pFS = S('GO_MENU');
    this.pFH = 4;
    this.pNextFS = 0;
  }

  // GM03.dxr #42 on GO_MENU me
  GO_MENU()        {
    this.pFS = S('fadeOut');
    this.pFR = this.pVScale_Count;
  }

  // GM03.dxr #42 on fadeOut me
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

  // GM03.dxr #42 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, S('LBD'))) {
      this.pLBD_Channel = wChannel;
    } else {
      if (eq(wLabel, S('RCUL'))) {
        this.pRCUL_Channel = wChannel;
      } else {
        if (eq(wLabel, S('BTN_BACK'))) {
          this.pBTN_Stop_Channel = wChannel;
        } else {
          if (eq(wLabel, S('Kassa'))) {
            this.pKAS_Channel = wChannel;
          } else {
            if (eq(wLabel, S('VLEK'))) {
              add(this.pVlek_Channels, wChannel);
            } else {
              if (eq(wLabel, S('KasKey'))) {
                add(this.pKasKey_Channels, wChannel);
              } else {
                if (eq(wLabel, S('BLN'))) {
                  add(this.pBLN_Free_Channels, wChannel);
                } else {
                  if (eq(wLabel, S('BTN'))) {
                    add(this.pBTN_Channels, wChannel);
                  } else {
                    if (eq(wLabel, S('SCLT'))) {
                      add(this.pSCLT_Channels, wChannel);
                    } else {
                      if (eq(wLabel, S('EC'))) {
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
    }
  }

  // GM03.dxr #42 on addGrid_BLN me, wLoc
  addGrid_BLN(wLoc       )        {
    add(this.pGridBLN_List, wLoc);
  }
}
