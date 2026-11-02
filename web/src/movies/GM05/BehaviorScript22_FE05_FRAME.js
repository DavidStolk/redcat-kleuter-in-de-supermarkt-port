// GM05.dxr BehaviorScript 22 - FE05_FRAME (decomp/GM05/scripts/BehaviorScript 22 - FE05_FRAME.ls)
import {
  abort, alert, call, dsClose, dsDelSound, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G, go,
  member, movieCall, newObject, script, sendSprite, SetCursorPos, sprite, the, updateStage,
} from '../../runtime/api.js';
import {
  add, cat, charOf, count, deleteAt, eq, getAt, getLast, getPos, getaProp, gt, integer, length, listp, lt, max,
  min, neq, numToChar, random, setAt, setaProp, sym, symbol, truthy, value, VOID, voidp,            
} from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';
import { cutIntroTalk, requestSkipIntro } from '../skipIntro.js';

// Globals gAppSettings is `G.gAppSettings`. `get(pRIU, ...)` is sent to the RandomIndexUnit
// instance (`call(sym('get'), pRIU, ...)`); `add(pRIU, ...)` dispatches to its `add` handler.
// getWordDataList / ShuffleList / readTextFile are movie-script handlers (`movieCall`).
export class FE05_FRAME extends LingoScript {
  static scriptName = 'FE05_FRAME';
  pHelpText        = VOID; pFS        = VOID; pNextFS        = VOID; pFH        = VOID; pFR        = VOID;
  pFC        = VOID; pFQ_Flag        = VOID; pTSeqList        = VOID; pTSeqMList        = VOID;
  pBC_LG        = VOID; pPlayerLevel        = VOID; pAudioCueList        = VOID;
  pAudioCueChannel        = VOID; pEC_Channel        = VOID; pLB_Channel        = VOID;
  pBC_Channel        = VOID; pBC_Type        = VOID; pRCUL_Channel        = VOID;
  pWordDataList        = VOID; pWordCount        = VOID; pWordIndex        = VOID;
  pWordIndexList        = VOID; pLettersInWordList        = VOID; pLettersNotInWordList        = VOID;
  pLettersInGameList        = VOID; pBC_SREF        = VOID; pBC_GREF        = VOID; pWord        = VOID;
  pSpelCount        = VOID; pSpelIndex        = VOID; pSCLT_Channels        = VOID;
  pSCLT_Index        = VOID; pAudioCode        = VOID; pCP_Name_List        = VOID;
  pCP_Time_List        = VOID; pCP_Count        = VOID; pCP_Index        = VOID; pCP_Frame        = VOID;
  pCP_Flag        = VOID; pCP_NextName        = VOID; pCP_NextTime        = VOID; pRIU        = VOID;
  pDSound        = VOID; pTalkFile        = VOID; pTalkFile_Flag        = VOID; pSND_LBNW        = VOID;
  pPath_Audio_Voice        = VOID; pPath_Audio_Music        = VOID; pPath_Audio_SndFx        = VOID;
  pLevel_Audio_Voice        = VOID; pLevel_Audio_Music        = VOID; pLevel_Audio_SndFx        = VOID;
  pCPD_NameList        = VOID; pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID;
  pCPD_CPTimesList        = VOID; pFixed_WLST        = VOID; pFixed_BC_Type        = VOID;
  pTS_Channels        = VOID; pLB_Channels        = VOID; pClickResult        = VOID;
  pGameWord_String        = VOID; pGameWord_Length        = VOID; pGameWord_LetterIndex        = VOID;
  pGameWord_Letter        = VOID; pSND_BTN_BACK        = VOID; pSND_LB_OUT        = VOID;
  pSND_LB_NEW        = VOID; pSND_WIN        = VOID; pSND_LOOSE        = VOID;
  pBTN_BACK_Channel        = VOID; pGM5_WL_IDX        = VOID; pVScale_Music        = VOID;
  pVScale_Count        = VOID; pVScale_Index        = VOID; pCRS_L        = VOID; pCRS_T        = VOID;
  pCRS_R        = VOID; pCRS_B        = VOID;
  // GM05.dxr #22 on endSprite me
  endSprite()        {
    this.pRIU = VOID;
    dsClose();
  }

  // GM05.dxr #22 on beginSprite me
  beginSprite()        {
    this.pPlayerLevel = getaProp(G.gAppSettings, sym('PLAYER_LEVEL'));
    this.pHelpText = getaProp(G.gAppSettings, sym('HELP'));
    this.pFixed_BC_Type = getaProp(G.gAppSettings, sym('FE05_FIXED_BC_TYPE'));
    this.pFixed_WLST = getaProp(G.gAppSettings, sym('FE05_FIXED_WLST'));
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('FE05_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('FE05_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('FE05_PATH_SNDFX'));
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
    this.pCP_Flag = 0;
    dsOpen();
    const myFile = getaProp(G.gAppSettings, sym('FE05_FILE_MUSIC'));
    this.pDSound = dsNewSound(cat(this.pPath_Audio_Music, myFile), 0);
    dsSetVolume(this.pDSound, this.pLevel_Audio_Music);
    dsSetLoop(this.pDSound, 1);
    dsPlay(this.pDSound);
    this.pSND_BTN_BACK = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_BACK.wav'), 0);
    dsSetVolume(this.pSND_BTN_BACK, this.pLevel_Audio_SndFx);
    this.pSND_LB_OUT = dsNewSound(cat(this.pPath_Audio_SndFx, 'LB_OUT.wav'), 0);
    dsSetVolume(this.pSND_LB_OUT, this.pLevel_Audio_SndFx);
    this.pSND_LB_NEW = dsNewSound(cat(this.pPath_Audio_SndFx, 'LB_NEW.wav'), 0);
    dsSetVolume(this.pSND_LB_NEW, this.pLevel_Audio_SndFx);
    this.pSND_WIN = dsNewSound(cat(this.pPath_Audio_SndFx, 'WIN.wav'), 0);
    dsSetVolume(this.pSND_WIN, this.pLevel_Audio_SndFx);
    this.pSND_LOOSE = dsNewSound(cat(this.pPath_Audio_SndFx, 'LOOSE.wav'), 0);
    dsSetVolume(this.pSND_LOOSE, this.pLevel_Audio_SndFx);
    this.pRIU = newObject(script('RandomIndexUnit'));
    add(this.pRIU, sym('BC_GD_RC'), 6);
    add(this.pRIU, sym('BC_FT_RC'), 4);
    add(this.pRIU, sym('BC_GD_BR'), 6);
    add(this.pRIU, sym('BC_FT_BR'), 4);
    add(this.pRIU, sym('BC_GD_MX'), 6);
    add(this.pRIU, sym('BC_FT_MX'), 4);
    add(this.pRIU, sym('BC_Type'), 3);
    add(this.pRIU, sym('Q_SZ_RC'), 11);
    add(this.pRIU, sym('Q_SZ_BR'), 11);
    add(this.pRIU, sym('Q_SZ_MX'), 11);
    add(this.pRIU, sym('Q_1A_RC'), 3);
    add(this.pRIU, sym('Q_1A_BR'), 3);
    add(this.pRIU, sym('Q_1A_MX'), 3);
    add(this.pRIU, sym('Q_1B_RC'), 2);
    add(this.pRIU, sym('Q_1B_BR'), 2);
    add(this.pRIU, sym('Q_1B_MX'), 2);
    add(this.pRIU, sym('Q_2A_RC'), 4);
    add(this.pRIU, sym('Q_2A_BR'), 4);
    add(this.pRIU, sym('Q_2A_MX'), 4);
    add(this.pRIU, sym('Q_3A_RC'), 3);
    add(this.pRIU, sym('Q_3A_BR'), 3);
    add(this.pRIU, sym('Q_3A_MX'), 3);
    this.pWordDataList = movieCall('getWordDataList', this.pPlayerLevel);
    this.pWordCount = count(this.pWordDataList);
    if (eq(this.pPlayerLevel, 1)) {
      this.pGM5_WL_IDX = getaProp(G.gAppSettings, sym('GM5_WL_IDX_L1'));
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        this.pGM5_WL_IDX = getaProp(G.gAppSettings, sym('GM5_WL_IDX_L2'));
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          this.pGM5_WL_IDX = getaProp(G.gAppSettings, sym('GM5_WL_IDX_L3'));
        }
      }
    }
    if (!truthy(voidp(this.pGM5_WL_IDX))) {
      this.pWordIndex = getAt(this.pGM5_WL_IDX, 1);
    } else {
      this.pWordIndex = 0;
    }
    if (!truthy(this.pWordIndex)) {
      this.pGM5_WL_IDX = [];
      this.pWordIndex = 1;
      this.pWordIndexList = [];
      for (let i = 1, n = this.pWordCount; i <= n; i++) {
        add(this.pWordIndexList, i);
      }
      if (!truthy(this.pFixed_WLST)) {
        this.pWordIndexList = movieCall('ShuffleList', this.pWordIndexList);
      }
    } else {
      this.pWordIndexList = getAt(this.pGM5_WL_IDX, 2);
    }
    this.pTS_Channels = [];
    this.pLB_Channels = [];
    this.pSCLT_Channels = [];
    this.pSCLT_Index = 1;
    this.pFQ_Flag = 1;
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = 0;
  }

  // GM05.dxr #22 on idle me
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

  // GM05.dxr #22 on CP_Init me, wFile
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

  // GM05.dxr #22 on CP_Passed me, wName
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

  // Port only (DEVIATIONS.md "Skipping Redcat's intro"): sent by the player on every mouse
  // press, before mouseDown (port/src/movies/skipIntro.ts).
  skipIntro()        {
    requestSkipIntro(this);
  }

  // GM05.dxr #22 on exitFrame me
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
    if (neq(this.pFS, 0)) {
      if (!truthy(this.pFH)) {
        call(this.pFS, this);
      } else {
        this.pFH = this.pFH - 1;
      }
    }
    go(the.frame);
  }

  // GM05.dxr #22 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // GM05.dxr #22 on InitFrame me
  InitFrame()        {
    sendSprite(this.pRCUL_Channel, sym('setBTN_Channel'), this.pBTN_BACK_Channel);
    let i = 1;
    for (const myChannel of this.pTS_Channels.slice()) {
      sendSprite(myChannel, sym('init'), i);
      i = i + 1;
    }
    this.RenderNewWord();
    this.DisplayNewWord();
    this.pFS = sym('RCUL_WalkIn');
  }

  // GM05.dxr #22 on RenderNewWord me
  RenderNewWord()        {
    const myIndex = getAt(this.pWordIndexList, this.pWordIndex);
    const myWordData = getAt(this.pWordDataList, myIndex);
    this.pWord = getaProp(myWordData, sym('W'));
    this.pBC_SREF = getaProp(myWordData, sym('T'));
    this.pBC_LG = getaProp(myWordData, sym('LG'));
    this.pBC_GREF = member(cat('BI_', this.pWord)).memberNum;
    if (eq(this.pWordIndex, this.pWordCount)) {
      if (!truthy(this.pFixed_WLST)) {
        this.pWordIndexList = movieCall('ShuffleList', this.pWordIndexList);
      }
      const myTempIDX = getAt(this.pWordIndexList, 1);
      if (eq(myTempIDX, myIndex)) {
        deleteAt(this.pWordIndexList, 1);
        add(this.pWordIndexList, myTempIDX);
      }
      this.pWordIndex = 1;
    } else {
      this.pWordIndex = this.pWordIndex + 1;
    }
    this.pGameWord_String = this.pWord;
    this.pGameWord_Length = length(this.pGameWord_String);
    this.pGameWord_LetterIndex = getAt([1, 1, random(this.pGameWord_Length)], this.pPlayerLevel);
    this.pGameWord_Letter = charOf(this.pGameWord_String, this.pGameWord_LetterIndex);
  }

  // GM05.dxr #22 on DisplayNewWord me
  DisplayNewWord()        {
    const myDist = 60;
    if (!truthy(this.pFQ_Flag)) {
      dsPlay(this.pSND_LB_NEW);
    }
    const myWord_LocH = 650 - (this.pGameWord_Length * myDist);
    for (let letterIndex = 1, n = this.pGameWord_Length; letterIndex <= n; letterIndex++) {
      const myLocH = myWord_LocH + ((letterIndex - 1) * myDist);
      sendSprite(getAt(this.pLB_Channels, letterIndex), sym('reset'), charOf(this.pGameWord_String, letterIndex), myLocH);
    }
    sendSprite(getAt(this.pLB_Channels, this.pGameWord_LetterIndex), sym('hideLetter'));
  }

  // GM05.dxr #22 on PlayAgain me
  PlayAgain()        {
    let i = 1;
    for (const myChannel of this.pTS_Channels.slice()) {
      sendSprite(myChannel, sym('init'), i);
      i = i + 1;
    }
    this.RenderNewWord();
    this.DisplayNewWord();
    this.pFS = sym('StartGame');
  }

  // GM05.dxr #22 on RCUL_WalkIn me
  RCUL_WalkIn()        {
    sendSprite(this.pRCUL_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pNextFS = sym('RCUL_WalkIn_Done');
  }

  // GM05.dxr #22 on RCUL_WalkIn_Done me
  RCUL_WalkIn_Done()        {
    if (!truthy(this.pHelpText)) {
      this.pFS = sym('RCUL_OFF');
    } else {
      this.pTSeqList = ['05RCUL01', '05RCUL02', '05RCUL03', 'RCULSTOP', '05RCUL04'];
      this.pFC = count(this.pTSeqList) + 1;
      this.pFR = 1;
      this.pFS = sym('RCUL_ON');
    }
  }

  // GM05.dxr #22 on RCUL_OFF me
  RCUL_OFF()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '05RCULSH';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_WalkOut');
  }

  // GM05.dxr #22 on RCUL_ON me
  RCUL_ON()        {
    if (eq(this.pFR, this.pFC)) {
      this.pFS = sym('RCUL_WalkOut');
    } else {
      this.pAudioCueChannel = this.pRCUL_Channel;
      const myFile = getAt(this.pTSeqList, this.pFR);
      this.pFR = this.pFR + 1;
      this.CP_Init(myFile);
      this.pFS = 0;
      this.pNextFS = sym('RCUL_ON');
    }
  }

  // GM05.dxr #22 on RCUL_WalkOut me
  RCUL_WalkOut()        {
    sendSprite(this.pRCUL_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('RCUL_WalkOutDone');
  }

  // GM05.dxr #22 on RCUL_WalkOutDone me
  RCUL_WalkOutDone()        {
    this.pFS = sym('StartGame');
  }

  // GM05.dxr #22 on StartGame me
  StartGame()        {
    this.pFS = sym('BC_GoIn');
  }

  // GM05.dxr #22 on BC_GoIn me
  BC_GoIn()        {
    let myIDX       ;
    if (!truthy(this.pFixed_BC_Type)) {
      myIDX = call(sym('get'), this.pRIU, sym('BC_Type'));
      if (eq(this.pFQ_Flag, 1)) {
        this.pFQ_Flag = 0;
        if (eq(myIDX, 1)) {
          myIDX = call(sym('get'), this.pRIU, sym('BC_Type'));
        }
      }
    } else {
      myIDX = this.pFixed_BC_Type;
    }
    this.pBC_Type = getAt([sym('RC'), sym('BR'), sym('MX')], myIDX);
    sendSprite(this.pBC_Channel, sym('setData'), this.pBC_Type, this.pBC_GREF);
    sendSprite(this.pBC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pNextFS = sym('BC_SZ_Init');
  }

  // GM05.dxr #22 on BC_SZ_Init me
  BC_SZ_Init()        {
    this.pTSeqList = [];
    this.pTSeqMList = [];
    const myNum = getAt(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'], call(sym('get'), this.pRIU, symbol(cat('Q_SZ_', this.pBC_Type))));
    add(this.pTSeqList, cat('05', this.pBC_Type, 'SZ', myNum));
    add(this.pTSeqMList, sym('M2'));
    add(this.pTSeqList, cat('05', this.pBC_Type, this.pBC_SREF, 'A'));
    add(this.pTSeqMList, getAt([sym('M1'), sym('M2')], this.pBC_LG));
    this.pFC = count(this.pTSeqList) + 1;
    this.pFR = 1;
    this.pFS = sym('BC_SZ1');
  }

  // GM05.dxr #22 on BC_SZ1 me
  BC_SZ1()        {
    if (eq(this.pFR, this.pFC)) {
      this.pFS = sym('BC_Q_INIT');
    } else {
      this.pAudioCueChannel = this.pBC_Channel;
      const myFile = getAt(this.pTSeqList, this.pFR);
      this.CP_Init(myFile);
      this.pFS = sym('BC_SZ2');
    }
  }

  // GM05.dxr #22 on BC_SZ2 me
  BC_SZ2()        {
    sendSprite(this.pBC_Channel, getAt(this.pTSeqMList, this.pFR));
    this.pFR = this.pFR + 1;
    this.pFS = 0;
    this.pNextFS = sym('BC_SZ3');
  }

  // GM05.dxr #22 on BC_SZ3 me
  BC_SZ3()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    this.pFH = 2;
    this.pFS = sym('BC_SZ1');
  }

  // GM05.dxr #22 on BC_Q_INIT me
  BC_Q_INIT()        {
    this.pTSeqList = [];
    this.pTSeqMList = [];
    if (eq(this.pPlayerLevel, 1)) {
      add(this.pTSeqList, cat('05', this.pBC_Type, 'V1A', call(sym('get'), this.pRIU, symbol(cat('Q_1A_', this.pBC_Type)))));
      add(this.pTSeqMList, sym('M2'));
      add(this.pTSeqList, cat('05', this.pBC_Type, 'AT', this.pGameWord_Letter, '1'));
      add(this.pTSeqMList, sym('M1'));
      add(this.pTSeqList, cat('05', this.pBC_Type, 'V1B', call(sym('get'), this.pRIU, symbol(cat('Q_1B_', this.pBC_Type)))));
      add(this.pTSeqMList, sym('M2'));
      add(this.pTSeqList, cat('05', this.pBC_Type, this.pBC_SREF, 'B'));
      add(this.pTSeqMList, getAt([sym('M1'), sym('M2')], this.pBC_LG));
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        add(this.pTSeqList, cat('05', this.pBC_Type, 'V2A', call(sym('get'), this.pRIU, symbol(cat('Q_2A_', this.pBC_Type)))));
        add(this.pTSeqMList, sym('M2'));
        add(this.pTSeqList, cat('05', this.pBC_Type, this.pBC_SREF, 'B'));
        add(this.pTSeqMList, getAt([sym('M1'), sym('M2')], this.pBC_LG));
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          add(this.pTSeqList, cat('05', this.pBC_Type, 'V3A', call(sym('get'), this.pRIU, symbol(cat('Q_3A_', this.pBC_Type)))));
          add(this.pTSeqMList, sym('M2'));
          add(this.pTSeqList, cat('05', this.pBC_Type, this.pBC_SREF, 'B'));
          add(this.pTSeqMList, getAt([sym('M1'), sym('M2')], this.pBC_LG));
        }
      }
    }
    this.pFC = count(this.pTSeqList) + 1;
    this.pFR = 1;
    this.pFS = sym('BC_Q1');
  }

  // GM05.dxr #22 on BC_Q1 me
  BC_Q1()        {
    if (eq(this.pFR, this.pFC)) {
      this.pFS = sym('BC_Q_DONE');
    } else {
      this.pAudioCueChannel = this.pBC_Channel;
      const myFile = getAt(this.pTSeqList, this.pFR);
      this.CP_Init(myFile);
      this.pFS = sym('BC_Q2');
    }
  }

  // GM05.dxr #22 on BC_Q2 me
  BC_Q2()        {
    sendSprite(this.pBC_Channel, getAt(this.pTSeqMList, this.pFR));
    this.pFR = this.pFR + 1;
    this.pFS = 0;
    this.pNextFS = sym('BC_Q3');
  }

  // GM05.dxr #22 on BC_Q3 me
  BC_Q3()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    this.pFH = 2;
    this.pFS = sym('BC_Q1');
  }

  // GM05.dxr #22 on BC_Q_DONE me
  BC_Q_DONE()        {
    for (const myChannel of this.pTS_Channels.slice()) {
      sendSprite(myChannel, sym('enable'));
    }
    this.pFS = 0;
  }

  // GM05.dxr #22 on select me, wChannel
  select(wChannel       )        {
    for (const myChannel of this.pTS_Channels.slice()) {
      sendSprite(myChannel, sym('Disable'));
    }
    const myIDX = getPos(this.pTS_Channels, wChannel);
    this.pClickResult = eq(numToChar(myIDX + 64), this.pGameWord_Letter) ? 1 : 0;
    this.pFH = 2;
    if (!truthy(this.pClickResult)) {
      this.pFR = 3;
      this.pFS = sym('BC_AW1');
    } else {
      this.pFS = sym('BC_AR1');
    }
  }

  // GM05.dxr #22 on BC_AW1 me
  BC_AW1()        {
    this.pAudioCueChannel = this.pBC_Channel;
    const myIDX = call(sym('get'), this.pRIU, cat('BC_FT_', this.pBC_Type));
    const myFile = cat('05', this.pBC_Type, 'FT0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('BC_AW2');
  }

  // GM05.dxr #22 on BC_AW2 me
  BC_AW2()        {
    this.pFR = 3;
    this.pFS = sym('BC_Q_INIT');
  }

  // GM05.dxr #22 on BC_AR1 me
  BC_AR1()        {
    sendSprite(getAt(this.pLB_Channels, this.pGameWord_LetterIndex), sym('showLetter'));
    this.pFS = 0;
    this.pFH = 2;
    this.pNextFS = sym('BC_AR1B');
  }

  // GM05.dxr #22 on BC_AR1B me
  BC_AR1B()        {
    dsPlay(this.pSND_WIN);
    sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('startflash'));
    this.pFS = sym('BC_AR2');
    this.pFH = 2;
  }

  // GM05.dxr #22 on BC_AR2 me
  BC_AR2()        {
    this.pAudioCueChannel = this.pBC_Channel;
    const myIDX = call(sym('get'), this.pRIU, cat('BC_GD_', this.pBC_Type));
    const myFile = cat('05', this.pBC_Type, 'GD0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('BC_AR3');
  }

  // GM05.dxr #22 on BC_AR3 me
  BC_AR3()        {
    this.pAudioCueChannel = this.pBC_Channel;
    const myFile = cat('05', this.pBC_Type, 'AT', this.pGameWord_Letter, '2');
    this.CP_Init(myFile);
    this.pFS = sym('BC_AR4');
  }

  // GM05.dxr #22 on BC_AR4 me
  BC_AR4()        {
    sendSprite(this.pBC_Channel, sym('setBordMem'), member(cat('BI_', this.pGameWord_Letter)).memberNum);
    sendSprite(this.pBC_Channel, sym('M1'));
    this.pFS = 0;
    this.pNextFS = sym('BC_AR5');
  }

  // GM05.dxr #22 on BC_AR5 me
  BC_AR5()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    this.pFS = sym('BC_A_Done');
    this.pFH = 12;
  }

  // GM05.dxr #22 on BC_A_Done me
  BC_A_Done()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    sendSprite(this.pBC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('LB_Remove');
  }

  // GM05.dxr #22 on BC_GoOut me
  BC_GoOut()        {
    sendSprite(this.pBC_Channel, sym('WalkOut'));
    this.pFS = 0;
  }

  // GM05.dxr #22 on LB_Remove me
  LB_Remove()        {
    dsPlay(this.pSND_LB_OUT);
    for (const myChannel of this.pLB_Channels.slice()) {
      sendSprite(myChannel, sym('Plof'));
    }
    this.pFS = sym('endGame');
    this.pFH = 6;
  }

  // GM05.dxr #22 on endGame me
  endGame()        {
    sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('stopFlash'));
    if (eq(this.pSCLT_Index, count(this.pSCLT_Channels))) {
      this.HOERA_INIT();
    } else {
      this.pSCLT_Index = this.pSCLT_Index + 1;
      this.pFS = sym('PlayAgain');
    }
  }

  // GM05.dxr #22 on HOERA_INIT me
  HOERA_INIT()        {
    sendSprite(this.pEC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('HOERA_2');
  }

  // GM05.dxr #22 on HOERA_2 me
  HOERA_2()        {
    this.pAudioCueChannel = this.pEC_Channel;
    const myFile = 'GOVER_01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('HOERA_3');
  }

  // GM05.dxr #22 on HOERA_3 me
  HOERA_3()        {
    sendSprite(this.pEC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('HOERA_4');
  }

  // GM05.dxr #22 on HOERA_4 me
  HOERA_4()        {
    this.pFS = sym('GO_MENU');
  }

  // GM05.dxr #22 on BTN_BACK me
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
    sendSprite(this.pEC_Channel, sym('halt'));
    for (const myChannel of this.pLB_Channels.slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    for (const myChannel of this.pSCLT_Channels.slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    this.pFS = sym('GO_MENU');
    this.pFH = 4;
    this.pNextFS = 0;
  }

  // GM05.dxr #22 on GO_MENU me
  GO_MENU()        {
    setAt(this.pGM5_WL_IDX, 1, this.pWordIndex);
    setAt(this.pGM5_WL_IDX, 2, this.pWordIndexList);
    if (eq(this.pPlayerLevel, 1)) {
      setaProp(G.gAppSettings, sym('GM5_WL_IDX_L1'), this.pGM5_WL_IDX);
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        setaProp(G.gAppSettings, sym('GM5_WL_IDX_L2'), this.pGM5_WL_IDX);
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          setaProp(G.gAppSettings, sym('GM5_WL_IDX_L3'), this.pGM5_WL_IDX);
        }
      }
    }
    this.pFS = sym('fadeOut');
    this.pFR = this.pVScale_Count;
  }

  // GM05.dxr #22 on fadeOut me
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

  // GM05.dxr #22 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('TS'))) {
      add(this.pTS_Channels, wChannel);
    } else {
      if (eq(wLabel, sym('LB'))) {
        add(this.pLB_Channels, wChannel);
      } else {
        if (eq(wLabel, sym('BC'))) {
          this.pBC_Channel = wChannel;
        } else {
          if (eq(wLabel, sym('BTN_BACK'))) {
            this.pBTN_BACK_Channel = wChannel;
          } else {
            if (eq(wLabel, sym('RCUL'))) {
              this.pRCUL_Channel = wChannel;
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
