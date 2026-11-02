// GM04.dxr BehaviorScript 71 - FE04_FRAME (decomp/GM04/scripts/BehaviorScript 71 - FE04_FRAME.ls)
import { abort, alert, call, dsClose, dsDelSound, dsNewSound, dsOpen, dsPlay, dsSetLoop, dsSetVolume, G, go, member, movieCall, newObject, script, sendSprite, SetCursorPos, sprite, the, updateStage } from '../../runtime/api.js';
import { add, cat, count, deleteOne, duplicate, eq, getAt, getaProp, getPos, gt, integer, listp, lt, max, min, neq, propList, random, setaProp, sym, symbol, truthy, value, VOID, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';
import { cutIntroTalk, requestSkipIntro } from '../skipIntro.js';

// Game frame: state machine (pFS = frame state, pFH = frame hold, pNextFS = state after the
// current event is done) plus the voice cue player (CP_*). `get(pRIU, ...)`/`add(pRIU, ...)` are
// handlers of the RandomIndexUnit parent script.
export class FE04_FRAME extends LingoScript {
  static scriptName = 'FE04_FRAME';
  pHelpText        = VOID; pEC_Channel        = VOID; pFQ_Flag        = VOID; pFS        = VOID;
  pFH        = VOID; pNextFS        = VOID; pFR        = VOID; pFC        = VOID;
  pBTN_Channels        = VOID; pLC_Channel        = VOID; pLL_Channels        = VOID;
  pPLW_Channel        = VOID; pAudioCueChannel        = VOID; pAudioCueList        = VOID;
  pPlayerLevel        = VOID; pDSound        = VOID; pLL_2ChooseFrom_List        = VOID;
  pLLProps_list        = VOID; pVKMAP_List        = VOID; pPath_Audio_Voice        = VOID;
  pPath_Audio_Music        = VOID; pPath_Audio_SndFx        = VOID; pCPD_NameList        = VOID;
  pCPD_FileList        = VOID; pCPD_CPNamesList        = VOID; pCPD_CPTimesList        = VOID;
  pCP_Name_List        = VOID; pCP_Time_List        = VOID; pCP_Count        = VOID; pCP_Index        = VOID;
  pCP_Frame        = VOID; pCP_Flag        = VOID; pCP_NextName        = VOID; pCP_NextTime        = VOID;
  pTalkFile        = VOID; pTalkFile_Flag        = VOID; pSelected_Channel        = VOID;
  pLC_Type        = VOID; pRIU        = VOID; pRCUL_Channel        = VOID; pLL_Channels_InGame        = VOID;
  pLC_VoiceSeq_List        = VOID; pLolliePropsAsked_List        = VOID; pFixed_LC_Type        = VOID;
  pLevel_Audio_Voice        = VOID; pLevel_Audio_Music        = VOID; pLevel_Audio_SndFx        = VOID;
  pSCLT_Channels        = VOID; pSCLT_Index        = VOID; pSND_WIN        = VOID; pSND_LOOSE        = VOID;
  pMatch        = VOID; pSND_BTN_BACK        = VOID; pBTN_BACK_Channel        = VOID;
  pVScale_Music        = VOID; pVScale_Count        = VOID; pVScale_Index        = VOID;
  pCRS_L        = VOID; pCRS_T        = VOID; pCRS_R        = VOID; pCRS_B        = VOID;

  // GM04.dxr #71 on endSprite me
  endSprite()        {
    this.pRIU = VOID;
    dsClose();
  }

  // GM04.dxr #71 on beginSprite me
  beginSprite()        {
    const gAppSettings = G.gAppSettings;
    this.pPlayerLevel = getaProp(gAppSettings, sym('PLAYER_LEVEL'));
    this.pHelpText = getaProp(gAppSettings, sym('HELP'));
    this.pFixed_LC_Type = getaProp(gAppSettings, sym('FE04_FIXED_LC_TYPE'));
    this.pPath_Audio_Music = getaProp(gAppSettings, sym('FE04_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(gAppSettings, sym('FE04_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(gAppSettings, sym('FE04_PATH_SNDFX'));
    this.pLevel_Audio_Music = getaProp(gAppSettings, sym('VOLUME_MUSIC'));
    this.pLevel_Audio_Voice = getaProp(gAppSettings, sym('VOLUME_VOICE'));
    this.pLevel_Audio_SndFx = getaProp(gAppSettings, sym('VOLUME_SNDFX'));
    this.pVScale_Music = getaProp(gAppSettings, sym('VSCALE_MUSIC'));
    this.pVScale_Count = count(this.pVScale_Music);
    this.pVScale_Index = getPos(this.pVScale_Music, this.pLevel_Audio_Music);
    this.pCRS_L = getaProp(gAppSettings, sym('CURSOR_LEFT'));
    this.pCRS_T = getaProp(gAppSettings, sym('CURSOR_TOP'));
    this.pCRS_R = getaProp(gAppSettings, sym('CURSOR_RIGHT'));
    this.pCRS_B = getaProp(gAppSettings, sym('CURSOR_BOTTOM'));
    const myData = value(movieCall('readTextFile', cat(this.pPath_Audio_Voice, 'voice.cpd')));
    this.pCPD_NameList = getAt(myData, 1);
    this.pCPD_FileList = getAt(myData, 2);
    this.pCPD_CPNamesList = getAt(myData, 3);
    this.pCPD_CPTimesList = getAt(myData, 4);
    dsOpen();
    const myFile = getaProp(gAppSettings, sym('FE04_FILE_MUSIC'));
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
    add(this.pRIU, sym('LC_Type'), 3);
    add(this.pRIU, sym('LC_SZ_RC'), 4);
    add(this.pRIU, sym('LC_GD_RC'), 4);
    add(this.pRIU, sym('LC_FT_RC'), 4);
    add(this.pRIU, sym('LC_SZ_BR'), 4);
    add(this.pRIU, sym('LC_GD_BR'), 4);
    add(this.pRIU, sym('LC_FT_BR'), 4);
    add(this.pRIU, sym('LC_SZ_MX'), 4);
    add(this.pRIU, sym('LC_GD_MX'), 4);
    add(this.pRIU, sym('LC_FT_MX'), 4);
    add(this.pRIU, sym('Q_Type'), 2);
    this.pLL_Channels = [];
    this.pBTN_Channels = [];
    this.pSCLT_Channels = [];
    this.pSCLT_Index = 1;
    this.pFQ_Flag = 1;
    this.pVKMAP_List = propList();
    setaProp(this.pVKMAP_List, sym('rood'), '01');
    setaProp(this.pVKMAP_List, sym('oranje'), '02');
    setaProp(this.pVKMAP_List, sym('Geel'), '03');
    setaProp(this.pVKMAP_List, sym('Groen'), '04');
    setaProp(this.pVKMAP_List, sym('Blauw'), '05');
    setaProp(this.pVKMAP_List, sym('Paars'), '06');
    setaProp(this.pVKMAP_List, sym('Vierkant'), '07');
    setaProp(this.pVKMAP_List, sym('Rond'), '08');
    setaProp(this.pVKMAP_List, sym('Driehoekig'), '09');
    setaProp(this.pVKMAP_List, sym('Rodester'), '15');
    setaProp(this.pVKMAP_List, sym('Oranjester'), '16');
    setaProp(this.pVKMAP_List, sym('Gelester'), '17');
    setaProp(this.pVKMAP_List, sym('Groenester'), '18');
    setaProp(this.pVKMAP_List, sym('Blauwester'), '19');
    setaProp(this.pVKMAP_List, sym('Paarsester'), '20');
    setaProp(this.pVKMAP_List, sym('Roderuit'), '21');
    setaProp(this.pVKMAP_List, sym('Oranjeruit'), '22');
    setaProp(this.pVKMAP_List, sym('Geleruit'), '23');
    setaProp(this.pVKMAP_List, sym('Groeneruit'), '24');
    setaProp(this.pVKMAP_List, sym('Blauweruit'), '25');
    setaProp(this.pVKMAP_List, sym('Paarseruit'), '26');
    setaProp(this.pVKMAP_List, sym('Roodkruis'), '27');
    setaProp(this.pVKMAP_List, sym('Oranjekruis'), '28');
    setaProp(this.pVKMAP_List, sym('Geelkruis'), '29');
    setaProp(this.pVKMAP_List, sym('Groenkruis'), '30');
    setaProp(this.pVKMAP_List, sym('Blauwkruis'), '31');
    setaProp(this.pVKMAP_List, sym('Paarskruis'), '32');
    setaProp(this.pVKMAP_List, sym('Rodestip'), '33');
    setaProp(this.pVKMAP_List, sym('Oranjestip'), '34');
    setaProp(this.pVKMAP_List, sym('Gelestip'), '35');
    setaProp(this.pVKMAP_List, sym('Groenestip'), '36');
    setaProp(this.pVKMAP_List, sym('Blauwestip'), '37');
    setaProp(this.pVKMAP_List, sym('Paarsestip'), '38');
    this.pFS = 0;
    this.pNextFS = 0;
  }

  // GM04.dxr #71 on CP_Init me, wFile
  CP_Init(wFile       )        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
      this.pTalkFile = VOID;
    }
    const myPos = getPos(this.pCPD_NameList, wFile);
    if (!truthy(myPos)) {
      alert(cat('MyPos = ZERO ', wFile));
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

  // GM04.dxr #71 on CP_Passed me, wName
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

  // GM04.dxr #71 on exitFrame me
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

  // GM04.dxr #71 on EventDone me
  EventDone()        {
    this.pFS = this.pNextFS;
    this.pNextFS = 0;
  }

  // GM04.dxr #71 on idle me
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

  // GM04.dxr #71 on InitFrame me
  InitFrame()        {
    this.pLL_2ChooseFrom_List = [];
    const myList = getAt([[1, 18], [1, 18], [19, 78]], this.pPlayerLevel);
    const myStart = getAt(myList, 1);
    const myEnd = getAt(myList, 2);
    for (let i = myStart, e = myEnd; i <= e; i++) {
      add(this.pLL_2ChooseFrom_List, i);
    }
    sendSprite(this.pRCUL_Channel, sym('setBTN_Channel'), this.pBTN_BACK_Channel);
    this.initGame();
  }

  // GM04.dxr #71 on initGame me
  initGame()        {
    this.pLL_Channels_InGame = duplicate(this.pLL_Channels);
    this.pLL_2ChooseFrom_List = movieCall('ShuffleList', this.pLL_2ChooseFrom_List);
    let i = 1;
    for (const myChannel of this.pLL_Channels.slice()) {
      sendSprite(myChannel, sym('set'), getAt(this.pLL_2ChooseFrom_List, i));
      sendSprite(myChannel, sym('place'));
      if (eq(i, count(this.pLL_2ChooseFrom_List))) {
        i = 1;
        continue;
      }
      i = i + 1;
    }
    this.pFS = sym('RCUL_WalkIn');
  }

  // GM04.dxr #71 on RCUL_WalkIn me
  RCUL_WalkIn()        {
    sendSprite(this.pRCUL_Channel, sym('WalkIn'));
    if (!truthy(this.pHelpText)) {
      this.pNextFS = sym('RCUL_OFF');
    } else {
      this.pNextFS = sym('RCUL_UL1');
    }
    this.pFS = 0;
    this.pFH = 6;
  }

  // GM04.dxr #71 on RCUL_OFF me
  RCUL_OFF()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '04RCULSH';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 6;
    this.pNextFS = sym('RCUL_WalkOut');
  }

  // GM04.dxr #71 on RCUL_UL1 me
  RCUL_UL1()        {
    this.pAudioCueChannel = this.pRCUL_Channel;
    const myFile = '04RCUL01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 6;
    this.pNextFS = sym('RCUL_UL2');
  }

  // GM04.dxr #71 on RCUL_UL2 me
  RCUL_UL2()        {
    const myFile = '04RCUL02';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 6;
    this.pNextFS = sym('RCUL_UL3');
  }

  // GM04.dxr #71 on RCUL_UL3 me
  RCUL_UL3()        {
    const myFile = 'RCULSTOP';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 6;
    this.pNextFS = sym('RCUL_UL4');
  }

  // GM04.dxr #71 on RCUL_UL4 me
  RCUL_UL4()        {
    const myFile = '04RCUL04';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 6;
    this.pNextFS = sym('RCUL_WalkOut');
  }

  // GM04.dxr #71 on RCUL_WalkOut me
  RCUL_WalkOut()        {
    sendSprite(this.pRCUL_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('LC_WalkIn');
  }

  // GM04.dxr #71 on LC_WalkIn me
  LC_WalkIn()        {
    let myIDX       ;
    if (!truthy(this.pFixed_LC_Type)) {
      myIDX = call(sym('get'), this.pRIU, sym('LC_Type'));
      if (eq(this.pFQ_Flag, 1)) {
        this.pFQ_Flag = 0;
        if (eq(myIDX, 1)) {
          myIDX = call(sym('get'), this.pRIU, sym('LC_Type'));
        }
      }
    } else {
      myIDX = this.pFixed_LC_Type;
    }
    this.pLC_Type = getAt([sym('RC'), sym('BR'), sym('MX')], myIDX);
    sendSprite(this.pLC_Channel, sym('setData'), this.pLC_Type);
    sendSprite(this.pLC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pFH = 12;
    this.pNextFS = sym('LC_WalkIn_Done');
  }

  // GM04.dxr #71 on LC_WalkIn_Done me
  LC_WalkIn_Done()        {
    const myBCode = cat('04', this.pLC_Type);
    const myLollieProps = value(sprite(getAt(this.pLL_Channels_InGame, random(count(this.pLL_Channels_InGame)))).member.name);
    let myEnFileList        = [cat(myBCode, 'VG09'), cat(myBCode, 'VG10')];
    myEnFileList = movieCall('ShuffleList', myEnFileList);
    this.pLolliePropsAsked_List = [];
    this.pLC_VoiceSeq_List = [];
    let myProp       ;
    if (eq(this.pPlayerLevel, 1)) {
      const myIDX = call(sym('get'), this.pRIU, sym('Q_Type'));
      if (eq(myIDX, 1)) {
        add(this.pLC_VoiceSeq_List, cat(myBCode, 'VG02'));
        myProp = getAt(myLollieProps, 1);
        add(this.pLC_VoiceSeq_List, cat(myBCode, 'VK', getaProp(this.pVKMAP_List, myProp)));
        add(this.pLolliePropsAsked_List, myProp);
      } else {
        if (eq(myIDX, 2)) {
          add(this.pLC_VoiceSeq_List, cat(myBCode, 'VG03'));
          myProp = getAt(myLollieProps, 2);
          add(this.pLC_VoiceSeq_List, cat(myBCode, 'VK', getaProp(this.pVKMAP_List, myProp)));
          add(this.pLolliePropsAsked_List, myProp);
        }
      }
    } else {
      if (eq(this.pPlayerLevel, 2)) {
        add(this.pLC_VoiceSeq_List, cat(myBCode, 'VG02'));
        myProp = getAt(myLollieProps, 1);
        add(this.pLC_VoiceSeq_List, cat(myBCode, 'VK', getaProp(this.pVKMAP_List, myProp)));
        add(this.pLolliePropsAsked_List, myProp);
        add(this.pLC_VoiceSeq_List, getAt(myEnFileList, 1));
        add(this.pLC_VoiceSeq_List, cat(myBCode, 'VG03'));
        myProp = getAt(myLollieProps, 2);
        add(this.pLC_VoiceSeq_List, cat(myBCode, 'VK', getaProp(this.pVKMAP_List, myProp)));
        add(this.pLolliePropsAsked_List, myProp);
      } else {
        if (eq(this.pPlayerLevel, 3)) {
          add(this.pLC_VoiceSeq_List, cat(myBCode, 'VG03'));
          myProp = getAt(myLollieProps, 2);
          add(this.pLC_VoiceSeq_List, cat(myBCode, 'VK', getaProp(this.pVKMAP_List, myProp)));
          add(this.pLolliePropsAsked_List, myProp);
          add(this.pLC_VoiceSeq_List, getAt(myEnFileList, 2));
          add(this.pLC_VoiceSeq_List, cat(myBCode, 'VG04'));
          myProp = getAt(myLollieProps, 3);
          add(this.pLC_VoiceSeq_List, cat(myBCode, 'VK', getaProp(this.pVKMAP_List, myProp)));
          add(this.pLolliePropsAsked_List, myProp);
        }
      }
    }
    this.pFC = count(this.pLC_VoiceSeq_List) + 1;
    this.pFR = 1;
    this.pFS = sym('LC_Talk_SZ');
    this.pFH = 0;
    this.pNextFS = 0;
  }

  // GM04.dxr #71 on LC_Talk_SZ me
  LC_Talk_SZ()        {
    this.pAudioCueChannel = this.pLC_Channel;
    const myIDX = call(sym('get'), this.pRIU, symbol(cat('LC_SZ_', this.pLC_Type)));
    const myFile = cat('04', this.pLC_Type, 'SZ0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('LC_Talk');
  }

  // GM04.dxr #71 on LC_Talk me
  LC_Talk()        {
    if (eq(this.pFR, this.pFC)) {
      this.pFS = 0;
      for (const myChannel of this.pLL_Channels_InGame.slice()) {
        sendSprite(myChannel, sym('enable'));
      }
      sendSprite(this.pLC_Channel, sym('handsUp'));
    } else {
      const myFile = getAt(this.pLC_VoiceSeq_List, this.pFR);
      this.CP_Init(myFile);
      this.pNextFS = this.pFS;
      this.pFS = 0;
      this.pFR = this.pFR + 1;
      this.pFH = 2;
    }
  }

  // GM04.dxr #71 on select me, wChannel
  select(wChannel       )        {
    sendSprite(this.pLC_Channel, sym('holdLollie'), sprite(wChannel).memberNum);
    this.pSelected_Channel = wChannel;
    sendSprite(this.pPLW_Channel, sym('Plof'), sprite(wChannel).loc);
    sendSprite(wChannel, sym('hide'));
    for (const myChannel of this.pLL_Channels_InGame.slice()) {
      sendSprite(myChannel, sym('Disable'));
    }
    const myLolliePropsSelected_List = value(sprite(wChannel).member.name);
    for (const myProp of this.pLolliePropsAsked_List.slice()) {
      this.pMatch = gt(getPos(myLolliePropsSelected_List, myProp), 0) ? 1 : 0;
      if (!truthy(this.pMatch)) {
        break;
      }
    }
    if (eq(this.pMatch, 1)) {
      sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('startflash'));
      deleteOne(this.pLL_Channels_InGame, wChannel);
    }
    this.pFH = 4;
    this.pFS = sym('SNDFX_WINLOOSE');
  }

  // GM04.dxr #71 on SNDFX_WINLOOSE me
  SNDFX_WINLOOSE()        {
    if (!truthy(this.pMatch)) {
      dsPlay(this.pSND_LOOSE);
      this.pFS = sym('LC_TalkWrong');
    } else {
      dsPlay(this.pSND_WIN);
      this.pFS = sym('LC_TalkRight');
    }
  }

  // GM04.dxr #71 on LC_TalkRight me
  LC_TalkRight()        {
    const myIDX = call(sym('get'), this.pRIU, symbol(cat('LC_GD_', this.pLC_Type)));
    const myFile = cat('04', this.pLC_Type, 'GD0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('LC_WalkOut');
  }

  // GM04.dxr #71 on LC_TalkWrong me
  LC_TalkWrong()        {
    const myIDX = call(sym('get'), this.pRIU, symbol(cat('LC_FT_', this.pLC_Type)));
    const myFile = cat('04', this.pLC_Type, 'FT0', myIDX);
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pFH = 0;
    this.pNextFS = sym('LC_TalkWrong_Done');
  }

  // GM04.dxr #71 on LC_TalkWrong_Done me
  LC_TalkWrong_Done()        {
    sendSprite(this.pSelected_Channel, sym('place'));
    sendSprite(this.pPLW_Channel, sym('Plof'), sprite(this.pLC_Channel).loc);
    sendSprite(this.pLC_Channel, sym('handsFree'));
    this.pFS = sym('LC_Talk');
    this.pFH = 6;
    this.pFR = 1;
  }

  // GM04.dxr #71 on LC_WalkOut me
  LC_WalkOut()        {
    sendSprite(this.pLC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('LC_WalkOut_Done');
  }

  // GM04.dxr #71 on LC_WalkOut_Done me
  LC_WalkOut_Done()        {
    sendSprite(getAt(this.pSCLT_Channels, this.pSCLT_Index), sym('stopFlash'));
    this.pFH = 0;
    if (eq(this.pSCLT_Index, count(this.pSCLT_Channels))) {
      this.pFS = 0;
      this.HOERA_INIT();
    } else {
      this.pSCLT_Index = this.pSCLT_Index + 1;
      this.pFS = sym('LC_WalkIn');
    }
  }

  // GM04.dxr #71 on HOERA_INIT me
  HOERA_INIT()        {
    sendSprite(this.pEC_Channel, sym('WalkIn'));
    this.pFS = 0;
    this.pNextFS = sym('HOERA_2');
  }

  // GM04.dxr #71 on HOERA_2 me
  HOERA_2()        {
    this.pAudioCueChannel = this.pEC_Channel;
    const myFile = 'GOVER_01';
    this.CP_Init(myFile);
    this.pFS = 0;
    this.pNextFS = sym('HOERA_3');
  }

  // GM04.dxr #71 on HOERA_3 me
  HOERA_3()        {
    sendSprite(this.pEC_Channel, sym('WalkOut'));
    this.pFS = 0;
    this.pNextFS = sym('HOERA_4');
  }

  // GM04.dxr #71 on HOERA_4 me
  HOERA_4()        {
    this.pFS = sym('GO_MENU');
  }

  // GM04.dxr #71 on BTN_BACK me
  BTN_BACK()        {
    if (!truthy(voidp(this.pTalkFile))) {
      dsDelSound(this.pTalkFile);
    }
    this.pTalkFile = VOID;
    this.pTalkFile_Flag = 0;
    this.pCP_Flag = 0;
    dsPlay(this.pSND_BTN_BACK);
    sendSprite(this.pLC_Channel, sym('halt'));
    sendSprite(this.pRCUL_Channel, sym('halt'));
    sendSprite(this.pEC_Channel, sym('halt'));
    for (const myChannel of this.pSCLT_Channels.slice()) {
      sendSprite(myChannel, sym('halt'));
    }
    this.pFS = sym('GO_MENU');
    this.pFH = 4;
    this.pNextFS = 0;
  }

  // GM04.dxr #71 on GO_MENU me
  GO_MENU()        {
    this.pFS = sym('fadeOut');
    this.pFR = this.pVScale_Count;
  }

  // GM04.dxr #71 on fadeOut me
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

  // GM04.dxr #71 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('BTN_BACK'))) {
      this.pBTN_BACK_Channel = wChannel;
    } else {
      if (eq(wLabel, sym('LB'))) {
        this.pLC_Channel = wChannel;
      } else {
        if (eq(wLabel, sym('LL'))) {
          add(this.pLL_Channels, wChannel);
        } else {
          if (eq(wLabel, sym('RCUL'))) {
            this.pRCUL_Channel = wChannel;
          } else {
            if (eq(wLabel, sym('LC'))) {
              this.pLC_Channel = wChannel;
            } else {
              if (eq(wLabel, sym('PLW'))) {
                this.pPLW_Channel = wChannel;
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
