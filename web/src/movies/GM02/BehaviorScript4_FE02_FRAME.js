// GM02.dxr BehaviorScript 4 - FE02_FRAME (decomp/GM02/scripts/BehaviorScript 4 - FE02_FRAME.ls)
import {
  abort, alert, call, dsClose, dsDelSound, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G, go,
  member, movieCall, newObject, script, sendSprite, SetCursorPos, sprite, the, updateStage,
} from '../../runtime/api.js';
import {
  add, cat, charOf, count, deleteAt, deleteOne, duplicate, eq, getAt, getLast, getPos, getaProp, gt, integer,
  length, listp, lt, max, min, neq, random, setAt, setaProp, string, sym, truthy, value, VOID, voidp,            
} from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';
import { cutIntroTalk, requestSkipIntro } from '../skipIntro.js';

// Frame script of the game frame (frame 3): word-spelling game ("Fles" = bottle with a letter,
// "LB" = LetterBak with the word, "BC" = Bakker/character that speaks the word, "FC" = the two
// characters holding the bottles, "RCUL" = Redcat explains, "EC" = end character).
// pFS is the state machine: a handler name (symbol) run each exitFrame via call(pFS, me);
// pNextFS is moved into pFS by EventDone / the voice cue list (CP_Passed).
export class FE02_FRAME extends LingoScript {
  static scriptName = 'FE02_FRAME';
  pHelpText        = VOID; pFS        = VOID; pNextFS        = VOID; pFH        = VOID; pFR        = VOID;
  pPlayerLevel        = VOID; pEC_Channel        = VOID; pAudioCueList        = VOID; pAudioCueChannel        = VOID;
  pSND_FLWN        = VOID; pSND_FLLS        = VOID; pBTN_Channels        = VOID; pLB_Channel        = VOID;
  pBC_Channel        = VOID; pBC_Type        = VOID; pRCUL_Channel        = VOID; pFC_Channels        = VOID;
  pFlesCharInGameChannels        = VOID; pFlesCharInGameCharacters        = VOID; pFL_Channels        = VOID;
  pFlesInGameChannels        = VOID; pBCONT_Channel        = VOID; pFCMOND_Channels        = VOID;
  pWordDataList        = VOID; pWordCount        = VOID; pWordIndex        = VOID; pWordIndexList        = VOID;
  pLettersInWordList        = VOID; pLettersNotInWordList        = VOID; pLettersInGameList        = VOID;
  pClick        = VOID; pClickChannel        = VOID; pClickLetter        = VOID; pBC_SREF        = VOID;
  pBC_GREF        = VOID; pClickCharChannel        = VOID; pClickCharType        = VOID; pWord        = VOID;
  pSpelCount        = VOID; pSpelIndex        = VOID; pAudioCode        = VOID; pCP_Name_List        = VOID;
  pCP_Time_List        = VOID; pCP_Count        = VOID; pCP_Index        = VOID; pCP_Frame        = VOID;
  pCP_Flag        = VOID; pCP_NextName        = VOID; pCP_NextTime        = VOID; pRIU        = VOID;
  pDSound        = VOID; pTalkFile        = VOID; pTalkFile_Flag        = VOID; pSND_LBNW        = VOID;
  pPath_Audio_Voice        = VOID; pPath_Audio_Music        = VOID; pPath_Audio_SndFx        = VOID;
  pLevel_Audio_Voice        = VOID; pLevel_Audio_Music        = VOID; pLevel_Audio_SndFx        = VOID;
  pCPD_NameList        = VOID; pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID;
  pCPD_CPTimesList        = VOID; pFixed_WLST        = VOID; pFixed_BC_Type        = VOID;
  pSCLT_Channels        = VOID; pSCLT_Index        = VOID; pSND_WIN        = VOID; pSND_LOOSE        = VOID;
  pSND_BTN_BACK        = VOID; pBTN_BACK_Channel        = VOID; pGM2_WL_IDX        = VOID;
  pVScale_Music        = VOID; pVScale_Count        = VOID; pVScale_Index        = VOID;
  pCRS_L        = VOID; pCRS_T        = VOID; pCRS_R        = VOID; pCRS_B        = VOID;

  // GM02.dxr #4 on endSprite me
  endSprite()        {
    this.pRIU = VOID;
    dsClose();
  }

  // GM02.dxr #4 on beginSprite me
  beginSprite()        {
    this.pPlayerLevel = getaProp(G.gAppSettings, sym('PLAYER_LEVEL'));
    this.pHelpText = getaProp(G.gAppSettings, sym('HELP'));
    if (!truthy(this.pHelpText)) {
      this.pHelpText = 2;
    }
    this.pFixed_BC_Type = getaProp(G.gAppSettings, sym('FE02_FIXED_BC_TYPE'));
    this.pFixed_WLST = getaProp(G.gAppSettings, sym('FE02_FIXED_WLST'));
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('FE02_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('FE02_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'));
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
    const myFile = getaProp(G.gAppSettings, sym('FE02_FILE_MUSIC'));
    this.pDSound = dsNewSound(cat(this.pPath_Audio_Music, myFile), 0);
    dsSetVolume(this.pDSound, this.pLevel_Audio_Music);
    dsSetLoop(this.pDSound, 1);
    dsPlay(this.pDSound);
    this.pSND_LBNW = dsNewSound(cat(this.pPath_Audio_SndFx, 'LBNW.wav'), 0);
    dsSetVolume(this.pSND_LBNW, this.pLevel_Audio_SndFx);
    this.pSND_WIN = dsNewSound(cat(this.pPath_Audio_SndFx, 'WIN.wav'), 0);
    dsSetVolume(this.pSND_WIN, this.pLevel_Audio_SndFx);
    this.pSND_LOOSE = dsNewSound(cat(this.pPath_Audio_SndFx, 'LOOSE.wav'), 0);
    dsSetVolume(this.pSND_LOOSE, this.pLevel_Audio_SndFx);
    this.pSND_BTN_BACK = dsNewSound(cat(this.pPath_Audio_SndFx, 'BTN_BACK.wav'), 0);
    dsSetVolume(this.pSND_BTN_BACK, this.pLevel_Audio_SndFx);
    this.pRIU = newObject(script('RandomIndexUnit'));
    add(this.pRIU, sym('FC_GD_RC'), 5);
    add(this.pRIU, sym('FC_FT_RC'), 6);
    add(this.pRIU, sym('FC_WC_RC'), 1);
    add(this.pRIU, sym('FC_GD_MX'), 5);
    add(this.pRIU, sym('FC_FT_MX'), 6);
    add(this.pRIU, sym('FC_WC_MX'), 1);
    add(this.pRIU, sym('FC_GD_BR'), 5);
    add(this.pRIU, sym('FC_FT_BR'), 6);
    add(this.pRIU, sym('FC_WC_BR'), 1);
    add(this.pRIU, sym('BC_SZ_RC'), 5);
    add(this.pRIU, sym('BC_SZ_MX'), 5);
    add(this.pRIU, sym('BC_SZ_BR'), 5);
    add(this.pRIU, sym('BC_Type'), 3);
    this.pWordDataList = movieCall('getWordDataList', this.pPlayerLevel);
    this.pWordCount = count(this.pWordDataList);
    if (eq(this.pPlayerLevel, 1)) {
      this.pGM2_WL_IDX = getaProp(G.gAppSettings, sym('GM2_WL_IDX_L1'));
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        this.pGM2_WL_IDX = getaProp(G.gAppSettings, sym('GM2_WL_IDX_L2'));
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          this.pGM2_WL_IDX = getaProp(G.gAppSettings, sym('GM2_WL_IDX_L3'));
        }
      }
    }
    if (!truthy(voidp(this.pGM2_WL_IDX))) {
      this.pWordIndex = getAt(this.pGM2_WL_IDX, 1);
    } else {
      this.pWordIndex = 0;
    }
    if (!truthy(this.pWordIndex)) {
      this.pGM2_WL_IDX = [];
      this.pWordIndex = 1;
      this.pWordIndexList = [];
      for (let i = 1, n = this.pWordCount; i <= n; i++) {
        add(this.pWordIndexList, i);
      }
      if (!truthy(this.pFixed_WLST)) {
        this.pWordIndexList = movieCall('ShuffleList', this.pWordIndexList);
      }
    } else {
      this.pWordIndexList = getAt(this.pGM2_WL_IDX, 2);
    }
    this.pFC_Channels = [];
    this.pFL_Channels = [];
    this.pFCMOND_Channels = [];
    this.pBTN_Channels = [];
    this.pSCLT_Channels = [];
    this.pSCLT_Index = 1;
    this.pLettersInWordList = [];
    this.pLettersNotInWordList = [];
    this.pLettersInGameList = [];
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = 0;
  }

  // GM02.dxr #4 on idle me
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

  // GM02.dxr #4 on CP_Init me, wFile
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

  // GM02.dxr #4 on CP_Passed me, wName
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

  // GM02.dxr #4 on exitFrame me
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

  // GM02.dxr #4 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // GM02.dxr #4 on InitFrame me
  InitFrame()        {
    sendSprite(this.pRCUL_Channel, sym('setBTN_Channel'), this.pBTN_BACK_Channel);
    sendSprite(this.pBC_Channel, sym('setLB_Channel'), this.pLB_Channel);
    this.pFS = sym('LB_NewWord');
  }

  // GM02.dxr #4 on LB_NewWord me
  LB_NewWord()        {
    const myIndex = getAt(this.pWordIndexList, this.pWordIndex);
    const myWordData = getAt(this.pWordDataList, myIndex);
    this.pWord = getaProp(myWordData, sym('W'));
    this.pBC_SREF = getaProp(myWordData, sym('T'));
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
    this.pLettersInWordList = movieCall('getLetterList', this.pWord);
    this.pLettersNotInWordList = movieCall('getLetterListNotInWord', this.pLettersInWordList);
    sendSprite(this.pLB_Channel, sym('setWord'), this.pLettersInWordList);
    sendSprite(this.pLB_Channel, sym('display'));
    this.pFS = 0;
    this.pNextFS = sym('LB_NewWordDone');
  }

  // GM02.dxr #4 on LB_NewWordDone me
  LB_NewWordDone()        {
    this.pFS = sym('FC_GoIn');
    this.pFH = 12;
  }

  // GM02.dxr #4 on FC_GoIn me
  FC_GoIn()        {
    if (gt(this.pHelpText, 0)) {
      this.pFlesCharInGameCharacters = getAt([[sym('BR'), sym('MX')], [sym('MX'), sym('BR')]], random(2));
      this.pFlesCharInGameChannels = duplicate(this.pFC_Channels);
      deleteAt(this.pFlesCharInGameChannels, 1);
    } else {
      this.pFlesCharInGameCharacters = getAt([[sym('BR'), sym('RC'), sym('MX')], [sym('MX'), sym('BR'), sym('RC')], [sym('RC'), sym('MX'), sym('BR')]], random(3));
      deleteAt(this.pFlesCharInGameCharacters, random(count(this.pFlesCharInGameCharacters)));
      this.pFlesCharInGameChannels = duplicate(this.pFC_Channels);
      deleteAt(this.pFlesCharInGameChannels, random(count(this.pFlesCharInGameChannels)));
    }
    this.pLettersInWordList = movieCall('ShuffleList', this.pLettersInWordList);
    const myC = count(this.pLettersInWordList);
    this.pLettersNotInWordList = movieCall('ShuffleList', this.pLettersNotInWordList);
    this.pLettersInGameList = [];
    if (eq(this.pPlayerLevel, 1)) {
      add(this.pLettersInGameList, getAt(this.pLettersInWordList, min(1, myC)));
      add(this.pLettersInGameList, getAt(this.pLettersInWordList, min(2, myC)));
      add(this.pLettersInGameList, getAt(this.pLettersInWordList, min(3, myC)));
      add(this.pLettersInGameList, getAt(this.pLettersNotInWordList, 1));
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        add(this.pLettersInGameList, getAt(this.pLettersInWordList, 1));
        add(this.pLettersInGameList, getAt(this.pLettersInWordList, min(2, myC)));
        add(this.pLettersInGameList, getAt(this.pLettersNotInWordList, 1));
        add(this.pLettersInGameList, getAt(this.pLettersNotInWordList, 2));
      } else {
        add(this.pLettersInGameList, getAt(this.pLettersInWordList, 1));
        add(this.pLettersInGameList, getAt(this.pLettersNotInWordList, 1));
        add(this.pLettersInGameList, getAt(this.pLettersNotInWordList, 2));
        add(this.pLettersInGameList, getAt(this.pLettersNotInWordList, 3));
      }
    }
    this.pLettersInGameList = movieCall('ShuffleList', this.pLettersInGameList);
    this.pFlesInGameChannels = [];
    let myChannel = getAt(this.pFlesCharInGameChannels, 1);
    add(this.pFlesInGameChannels, myChannel + 3);
    add(this.pFlesInGameChannels, myChannel + 4);
    sendSprite(myChannel, sym('setData'), getAt(this.pFlesCharInGameCharacters, 1));
    sendSprite(myChannel + 3, sym('setData'), getAt(this.pLettersInGameList, 1));
    sendSprite(myChannel + 4, sym('setData'), getAt(this.pLettersInGameList, 2));
    sendSprite(myChannel, sym('GoIn'));
    sendSprite(myChannel, sym('setSound'));
    myChannel = getAt(this.pFlesCharInGameChannels, 2);
    add(this.pFlesInGameChannels, myChannel + 3);
    add(this.pFlesInGameChannels, myChannel + 4);
    sendSprite(myChannel, sym('setData'), getAt(this.pFlesCharInGameCharacters, 2));
    sendSprite(myChannel + 3, sym('setData'), getAt(this.pLettersInGameList, 3));
    sendSprite(myChannel + 4, sym('setData'), getAt(this.pLettersInGameList, 4));
    sendSprite(myChannel, sym('GoIn'));
    sendSprite(myChannel, sym('setCallBack'));
    this.pFS = 0;
    this.pNextFS = sym('FC_GoIn_Done');
  }

  // GM02.dxr #4 on FC_GoIn_Done me
  FC_GoIn_Done()        {
    for (const myChannel of this.pFlesInGameChannels.slice()) {
      sendSprite(myChannel, sym('display'));
      if (!truthy(this.pHelpText)) {
        sendSprite(myChannel, sym('enable'));
      }
    }
    if (!truthy(this.pHelpText)) {
      this.pFS = sym('FL_Fall');
      this.pFH = 60;
    } else {
      this.pFS = sym('RCUL_WalkIn');
    }
  }

  // GM02.dxr #4 on RCUL_WalkIn me
  RCUL_WalkIn()        {
    sendSprite(this.pRCUL_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pNextFS = sym('RCUL_WalkIn_Done');
  }

  // GM02.dxr #4 on RCUL_WalkIn_Done me
  RCUL_WalkIn_Done()        {
    if (eq(this.pHelpText, 2)) {
      this.pFS = sym('RCUL_OFF');
      this.pHelpText = 0;
    } else {
      if (eq(this.pHelpText, 1)) {
        this.pFS = sym('RCUL_Speak1');
      }
    }
  }

  // GM02.dxr #4 on RCUL_OFF me
  RCUL_OFF()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '02RCULSH';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_WalkOut');
  }

  // GM02.dxr #4 on RCUL_Speak1 me
  RCUL_Speak1()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '02RCUL01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Speak2');
  }

  // GM02.dxr #4 on RCUL_Speak2 me
  RCUL_Speak2()        {
    const myFile = '02RCUL02';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Speak3');
  }

  // GM02.dxr #4 on RCUL_Speak3 me
  RCUL_Speak3()        {
    const myFile = 'RCULSTOP';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Speak4');
  }

  // GM02.dxr #4 on RCUL_Speak4 me
  RCUL_Speak4()        {
    const myFile = '02RCUL04';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('RCUL_Speak4_Done');
  }

  // GM02.dxr #4 on RCUL_Speak4_Done me
  RCUL_Speak4_Done()        {
    this.pFS = sym('RCUL_WalkOut');
  }

  // GM02.dxr #4 on RCUL_WalkOut me
  RCUL_WalkOut()        {
    sendSprite(this.pRCUL_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('RCUL_WalkOutDone');
  }

  // GM02.dxr #4 on RCUL_WalkOutDone me
  RCUL_WalkOutDone()        {
    for (const myChannel of this.pFlesInGameChannels.slice()) {
      sendSprite(myChannel, sym('enable'));
    }
    this.pFH = 60;
    this.pFS = sym('FL_Fall');
  }

  // GM02.dxr #4 on FL_Fall me
  FL_Fall()        {
    for (const myChannel of this.pFlesCharInGameChannels.slice()) {
      sendSprite(myChannel, sym('HandsOpen'));
    }
    for (const myChannel of this.pFlesInGameChannels.slice()) {
      sendSprite(myChannel, sym('Fall'));
    }
    sendSprite(getAt(this.pFlesInGameChannels, 1), sym('setSound'));
    sendSprite(getLast(this.pFlesInGameChannels), sym('setCallBack'));
    this.pFS = 0;
    this.pNextFS = sym('FL_Fall_Done');
  }

  // GM02.dxr #4 on FL_Fall_Done me
  FL_Fall_Done()        {
    for (const myChannel of this.pFlesInGameChannels.slice()) {
      sendSprite(myChannel, sym('Plof'));
    }
    sendSprite(getAt(this.pFlesInGameChannels, 1), sym('setSound'));
    sendSprite(getLast(this.pFlesInGameChannels), sym('setCallBack'));
    this.pFS = 0;
    this.pNextFS = sym('FL_Plof_Done');
  }

  // GM02.dxr #4 on FL_Plof_Done me
  FL_Plof_Done()        {
    this.pFS = sym('FC_GoOut');
    this.pFH = 2;
  }

  // GM02.dxr #4 on FL_Select me, wLetter, wChannel
  FL_Select(wLetter       , wChannel       )        {
    deleteOne(this.pFlesInGameChannels, wChannel);
    for (const myChannel of this.pFlesInGameChannels.slice()) {
      sendSprite(myChannel, sym('Plof'));
    }
    sendSprite(getAt(this.pFlesInGameChannels, 1), sym('setSound'));
    sendSprite(getLast(this.pFlesInGameChannels), sym('setCallBack'));
    this.pClickLetter = wLetter;
    this.pClickChannel = wChannel;
    let myPos = getPos(this.pFlesCharInGameChannels, wChannel - 3);
    if (!truthy(myPos)) {
      myPos = getPos(this.pFlesCharInGameChannels, wChannel - 4);
    }
    this.pClickCharType = getAt(this.pFlesCharInGameCharacters, myPos);
    this.pClickCharChannel = getAt(this.pFlesCharInGameChannels, myPos);
    if (!truthy(getPos(this.pLettersInWordList, wLetter))) {
      this.pClick = 0;
    } else {
      this.pClick = 1;
      deleteOne(this.pLettersInWordList, this.pClickLetter);
    }
    this.pFS = 0;
    this.pFH = 4;
    this.pNextFS = sym('SNDFX_WINLOOSE');
  }

  // GM02.dxr #4 on SNDFX_WINLOOSE me
  SNDFX_WINLOOSE()        {
    if (!truthy(this.pClick)) {
      dsPlay(this.pSND_LOOSE);
    } else {
      dsPlay(this.pSND_WIN);
    }
    this.pFH = 2;
    this.pFS = sym('FC_TalkResult');
  }

  // GM02.dxr #4 on FC_TalkResult me
  FC_TalkResult()        {
    let myIDX       ;
    let myFile       ;
    this.pAudioCueChannel = this.pClickCharChannel;
    if (!truthy(this.pClick)) {
      myIDX = call(sym('get'), this.pRIU, cat('FC_FT_', this.pClickCharType));
      myFile = cat('02', this.pClickCharType, 'FT0', myIDX);
      this.CP_Init(myFile);
    } else {
      if (!truthy(count(this.pLettersInWordList))) {
        sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('startflash'));
        myIDX = call(sym('get'), this.pRIU, cat('FC_WC_', this.pClickCharType));
        myFile = cat('02', this.pClickCharType, 'WC0', myIDX);
        this.CP_Init(myFile);
      } else {
        myIDX = call(sym('get'), this.pRIU, cat('FC_GD_', this.pClickCharType));
        myFile = cat('02', this.pClickCharType, 'GD0', myIDX);
        this.CP_Init(myFile);
      }
    }
    this.pFS = 0;
    this.pNextFS = sym('FC_TalkResult_Done');
  }

  // GM02.dxr #4 on FC_TalkResult_Done me
  FC_TalkResult_Done()        {
    if (!truthy(this.pClick)) {
      this.pFS = sym('FL_Plof_Selected_Wrong');
    } else {
      this.pFS = sym('FL_Plof_Selected_Right');
    }
  }

  // GM02.dxr #4 on FL_Plof_Selected_Wrong me
  FL_Plof_Selected_Wrong()        {
    sendSprite(this.pClickChannel, sym('Plof'));
    sendSprite(this.pClickChannel, sym('setSound'));
    sendSprite(this.pClickChannel, sym('setCallBack'));
    this.pFS = 0;
    this.pNextFS = sym('FL_Plof_Done');
  }

  // GM02.dxr #4 on FL_Plof_Selected_Right me
  FL_Plof_Selected_Right()        {
    sendSprite(this.pClickChannel, sym('Plof'));
    sendSprite(this.pClickChannel, sym('setSound'));
    sendSprite(this.pClickChannel, sym('setCallBack'));
    sendSprite(this.pLB_Channel, sym('placeFles'), this.pClickLetter);
    this.pFS = 0;
    this.pNextFS = sym('FL_Plof_Done');
  }

  // GM02.dxr #4 on FC_GoOut me
  FC_GoOut()        {
    for (const myChannel of this.pFlesCharInGameChannels.slice()) {
      sendSprite(myChannel, sym('GoOut'));
    }
    sendSprite(getAt(this.pFlesCharInGameChannels, 1), sym('setSound'));
    sendSprite(getLast(this.pFlesCharInGameChannels), sym('setCallBack'));
    this.pFS = 0;
    this.pNextFS = sym('FC_GoOut_Done');
  }

  // GM02.dxr #4 on FC_GoOut_Done me
  FC_GoOut_Done()        {
    this.pHelpText = 0;
    if (!truthy(count(this.pLettersInWordList))) {
      this.pFS = sym('BC_GoIn');
    } else {
      this.pFS = sym('FC_GoIn');
      this.pFH = 12;
    }
  }

  // GM02.dxr #4 on BC_GoIn me
  BC_GoIn()        {
    let myIDX       ;
    if (!truthy(this.pFixed_BC_Type)) {
      myIDX = call(sym('get'), this.pRIU, sym('BC_Type'));
    } else {
      myIDX = this.pFixed_BC_Type;
    }
    this.pBC_Type = getAt([sym('RC'), sym('BR'), sym('MX')], myIDX);
    sendSprite(this.pBCONT_Channel, sym('setData'), this.pBC_GREF);
    sendSprite(this.pBC_Channel, sym('setData'), this.pBC_Type, this.pBC_GREF);
    sendSprite(this.pBC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pFH = 12;
    this.pNextFS = sym('BC_TalkSZ');
  }

  // GM02.dxr #4 on BC_TalkSZ me
  BC_TalkSZ()        {
    this.pAudioCueChannel = this.pBC_Channel;
    const myIDX = call(sym('get'), this.pRIU, cat('BC_SZ_', this.pBC_Type));
    const myFile = cat('02', this.pBC_Type, 'SZ0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('BC_TalkW1');
  }

  // GM02.dxr #4 on BC_TalkW1 me
  BC_TalkW1()        {
    const myFile = cat('02', string(this.pBC_Type), this.pBC_SREF, 'A');
    this.CP_Init(myFile);
    sendSprite(this.pBC_Channel, sym('M1'));
    this.pFS = 0;
    this.pNextFS = sym('BC_TalkW1_Done');
  }

  // GM02.dxr #4 on BC_TalkW1_Done me
  BC_TalkW1_Done()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    this.pSpelCount = length(this.pWord);
    this.pSpelIndex = 1;
    this.pFR = 1;
    this.pFS = sym('BC_TalkLetter');
    this.pFH = 6;
  }

  // GM02.dxr #4 on BC_TalkLetter me
  BC_TalkLetter()        {
    let myLetter       ;
    let myFile       ;
    if (eq(this.pSpelIndex, this.pSpelCount)) {
      sendSprite(this.pBC_Channel, sym('M1'));
      sendSprite(this.pBC_Channel, sym('c'));
      myLetter = charOf(this.pWord, this.pSpelIndex);
      myFile = cat('02', string(this.pBC_Type), 'AT', myLetter, '2');
      this.CP_Init(myFile);
      this.pNextFS = sym('BC_TalkLastLetter_Done');
    } else {
      sendSprite(this.pBC_Channel, sym('M1'));
      sendSprite(this.pBC_Channel, sym('c'));
      myLetter = charOf(this.pWord, this.pSpelIndex);
      myFile = cat('02', string(this.pBC_Type), 'AT', myLetter, '1');
      this.CP_Init(myFile);
      this.pSpelIndex = this.pSpelIndex + 1;
      this.pNextFS = sym('BC_TalkLetter_Done');
    }
    this.pFS = 0;
  }

  // GM02.dxr #4 on BC_TalkLetter_Done me
  BC_TalkLetter_Done()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    sendSprite(this.pBC_Channel, sym('c'));
    this.pFS = sym('BC_TalkLetter');
    this.pFH = 6;
  }

  // GM02.dxr #4 on BC_TalkLastLetter_Done me
  BC_TalkLastLetter_Done()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    sendSprite(this.pBC_Channel, sym('c'));
    this.pFS = sym('BC_TalkW2');
    this.pFH = 6;
  }

  // GM02.dxr #4 on BC_TalkW2 me
  BC_TalkW2()        {
    const myFile = cat('02', string(this.pBC_Type), this.pBC_SREF, 'B');
    this.CP_Init(myFile);
    sendSprite(this.pBC_Channel, sym('M1'));
    sendSprite(this.pBC_Channel, sym('c'));
    this.pFS = 0;
    this.pNextFS = sym('BC_TalkW2_Done');
  }

  // GM02.dxr #4 on BC_TalkW2_Done me
  BC_TalkW2_Done()        {
    sendSprite(this.pBC_Channel, sym('MX'));
    this.pFS = sym('BC_PlayAnim');
    this.pFH = 6;
  }

  // GM02.dxr #4 on BC_PlayAnim me
  BC_PlayAnim()        {
    this.pFS = sym('BC_GoOut');
    this.pFH = 12;
  }

  // GM02.dxr #4 on BC_GoOut me
  BC_GoOut()        {
    sendSprite(this.pBC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('LB_Remove');
  }

  // GM02.dxr #4 on LB_Remove me
  LB_Remove()        {
    sendSprite(this.pLB_Channel, sym('remove'));
    this.pFS = 0;
    this.pNextFS = sym('endGame');
  }

  // GM02.dxr #4 on endGame me
  endGame()        {
    sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('stopFlash'));
    if (eq(this.pSCLT_Index, count(this.pSCLT_Channels))) {
      this.pFS = 0;
      this.HOERA_INIT();
    } else {
      this.pSCLT_Index = this.pSCLT_Index + 1;
      this.pFS = sym('LB_NewWord');
    }
  }

  // GM02.dxr #4 on HOERA_INIT me
  HOERA_INIT()        {
    sendSprite(this.pEC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pNextFS = sym('HOERA_2');
  }

  // GM02.dxr #4 on HOERA_2 me
  HOERA_2()        {
    this.pAudioCueChannel = this.pEC_Channel;
    const myFile = 'GOVER_01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('HOERA_3');
  }

  // GM02.dxr #4 on HOERA_3 me
  HOERA_3()        {
    sendSprite(this.pEC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('HOERA_4');
  }

  // GM02.dxr #4 on HOERA_4 me
  HOERA_4()        {
    this.pFS = sym('GO_MENU');
  }

  // GM02.dxr #4 on BTN_BACK me
  BTN_BACK()        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
    }
    this.pTalkFile = VOID;
    this.pTalkFile_Flag = 0;
    this.pCP_Flag = 0;
    dsPlay(this.pSND_BTN_BACK);
    sendSprite(this.pEC_Channel, sym('halt'));
    sendSprite(this.pLB_Channel, sym('halt'));
    sendSprite(this.pBC_Channel, sym('halt'));
    sendSprite(this.pRCUL_Channel, sym('halt'));
    for (const myChannel of this.pFL_Channels.slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    for (const myChannel of this.pFC_Channels.slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    for (const myChannel of this.pSCLT_Channels.slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    this.pFS = sym('GO_MENU');
    this.pFH = 4;
    this.pNextFS = 0;
  }

  // GM02.dxr #4 on GO_MENU me
  GO_MENU()        {
    setAt(this.pGM2_WL_IDX, 1, this.pWordIndex);
    setAt(this.pGM2_WL_IDX, 2, this.pWordIndexList);
    if (eq(this.pPlayerLevel, 1)) {
      setaProp(G.gAppSettings, sym('GM2_WL_IDX_L1'), this.pGM2_WL_IDX);
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        setaProp(G.gAppSettings, sym('GM2_WL_IDX_L2'), this.pGM2_WL_IDX);
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          setaProp(G.gAppSettings, sym('GM2_WL_IDX_L3'), this.pGM2_WL_IDX);
        }
      }
    }
    this.pFS = sym('fadeOut');
    this.pFR = this.pVScale_Count;
  }

  // GM02.dxr #4 on fadeOut me
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

  // GM02.dxr #4 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('FlesChar'))) {
      add(this.pFC_Channels, wChannel);
    } else {
      if (eq(wLabel, sym('Fles'))) {
        add(this.pFL_Channels, wChannel);
      } else {
        if (eq(wLabel, sym('LB'))) {
          this.pLB_Channel = wChannel;
        } else {
          if (eq(wLabel, sym('BC'))) {
            this.pBC_Channel = wChannel;
          } else {
            if (eq(wLabel, sym('BC_Content'))) {
              this.pBCONT_Channel = wChannel;
            } else {
              if (eq(wLabel, sym('RCUL'))) {
                this.pRCUL_Channel = wChannel;
              } else {
                if (eq(wLabel, sym('FCMOND'))) {
                  add(this.pFCMOND_Channels, wChannel);
                } else {
                  if (eq(wLabel, sym('BTN_BACK'))) {
                    this.pBTN_BACK_Channel = wChannel;
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
    }
  }
}
