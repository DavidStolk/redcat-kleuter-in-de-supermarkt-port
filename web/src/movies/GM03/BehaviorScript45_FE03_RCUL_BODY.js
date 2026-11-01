// GM03.dxr BehaviorScript 45 - FE03_RCUL_BODY (decomp/GM03/scripts/BehaviorScript 45 - FE03_RCUL_BODY.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE03_RCUL_BODY extends LingoScript {
  static scriptName = 'FE03_RCUL_BODY';
  pSprite        = VOID; pFS        = VOID; pFrame        = VOID; pMem        = VOID; pHold        = VOID;
  pLocH        = VOID; pFH        = VOID; pChannels        = VOID; pKAS_Channel        = VOID;
  pPL_Channel        = VOID; pSND_WalkIn        = VOID; pSND_WalkOut1        = VOID; pSND_WalkOut2        = VOID;
  pBTN_Channels        = VOID; pBTN_Channel        = VOID; pBody_Channel        = VOID; pMond_Channel        = VOID;
  pOog_Channel        = VOID; pHand_Channel        = VOID;

  // GM03.dxr #45 on beginSprite me
  beginSprite()        {
    this.pBody_Channel = this.spriteNum;
    this.pMond_Channel = this.pBody_Channel + 1;
    this.pOog_Channel = this.pBody_Channel + 2;
    this.pHand_Channel = this.pBody_Channel + 3;
    this.pMem = member('MIDX_FE03_RCUL').memberNum;
    this.pLocH = sprite(this.pBody_Channel).locH;
    const myPath = getaProp(G.gAppSettings, sym('FE03_PATH_SNDFX'));
    const myLevel = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_WalkIn = dsNewSound(cat(myPath, 'RCZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(myPath, 'RCZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(myPath, 'RCZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, myLevel);
    dsSetVolume(this.pSND_WalkOut1, myLevel);
    dsSetVolume(this.pSND_WalkOut2, myLevel);
    sprite(this.pBody_Channel).locH = -200;
    sprite(this.pMond_Channel).locH = -200;
    sprite(this.pOog_Channel).locH = -200;
    sprite(this.pHand_Channel).locH = -200;
    sendSprite(0, sym('addChannel'), sym('RCUL'), this.pBody_Channel);
  }

  // GM03.dxr #45 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFrame, 1)) {
          dsPlay(this.pSND_WalkIn);
          sprite(this.pBody_Channel).locH = this.pLocH;
          sprite(this.pBody_Channel).memberNum = this.pMem + 1;
        } else {
          if (eq(this.pFrame, 2)) {
            sprite(this.pBody_Channel).memberNum = this.pMem + 2;
          } else {
            if (eq(this.pFrame, 3)) {
              sprite(this.pBody_Channel).memberNum = this.pMem + 3;
              sprite(this.pMond_Channel).locH = this.pLocH;
              sprite(this.pMond_Channel).memberNum = this.pMem + 4;
              sprite(this.pOog_Channel).locH = this.pLocH;
              sprite(this.pOog_Channel).memberNum = this.pMem + 7;
              sprite(this.pHand_Channel).locH = this.pLocH;
              sprite(this.pHand_Channel).memberNum = this.pMem + 10;
              this.pFS = 0;
              sendSprite(this.pOog_Channel, sym('Start'));
              sendSprite(0, sym('EventDone'));
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          if (gt(this.pFH, 0)) {
            this.pFH = this.pFH - 1;
            return;
          }
          if (eq(this.pFrame, 1)) {
            dsPlay(this.pSND_WalkOut1);
            sprite(this.pBody_Channel).memberNum = this.pMem + 33;
            sprite(this.pMond_Channel).locH = -200;
            sprite(this.pOog_Channel).locH = -200;
            sprite(this.pHand_Channel).locH = -200;
            this.pFH = 2;
          } else {
            if (eq(this.pFrame, 2)) {
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pBody_Channel).memberNum = this.pMem + 1;
              sprite(this.pMond_Channel).locH = this.pLocH;
              sprite(this.pMond_Channel).memberNum = this.pMem + 34;
            } else {
              if (eq(this.pFrame, 3)) {
                sprite(this.pBody_Channel).locH = -200;
                sprite(this.pMond_Channel).memberNum = this.pMem + 35;
              } else {
                if (eq(this.pFrame, 4)) {
                  sprite(this.pMond_Channel).locH = -200;
                  this.pFS = 0;
                  sendSprite(0, sym('EventDone'));
                }
              }
            }
          }
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM03.dxr #45 on init me, wKAS_Channel, wPL_Channel
  init(wKAS_Channel       , wPL_Channel       )        {
    this.pKAS_Channel = wKAS_Channel;
    this.pPL_Channel = wPL_Channel;
  }

  // GM03.dxr #45 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFrame = 1;
  }

  // GM03.dxr #45 on WalkOut me
  WalkOut()        {
    sendSprite(this.pOog_Channel, sym('stop'));
    this.pFS = 2;
    this.pFH = 0;
    this.pFrame = 1;
  }

  // GM03.dxr #45 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(this.pKAS_Channel, sym('stopFlash'));
    sendSprite(this.pMond_Channel, sym('stop'));
    sendSprite(this.pMond_Channel, sym('stop'));
    sendSprite(this.pOog_Channel, sym('stop'));
  }

  // GM03.dxr #45 on setDefault me
  setDefault()        {
    sprite(this.pBody_Channel).memberNum = this.pMem + 3;
    sprite(this.pMond_Channel).memberNum = this.pMem + 4;
    sprite(this.pOog_Channel).memberNum = this.pMem + 7;
    sprite(this.pHand_Channel).memberNum = this.pMem + 10;
    sprite(this.pBody_Channel).locH = this.pLocH;
    sprite(this.pMond_Channel).locH = this.pLocH;
    sprite(this.pOog_Channel).locH = this.pLocH;
    sprite(this.pHand_Channel).locH = this.pLocH;
    sendSprite(this.pOog_Channel, sym('Start'));
    sendSprite(this.pMond_Channel, sym('stop'));
  }

  // GM03.dxr #45 on A1 me
  A1()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 11;
  }

  // GM03.dxr #45 on A2 me
  A2()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 12;
  }

  // GM03.dxr #45 on A3 me
  A3()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 13;
  }

  // GM03.dxr #45 on A4 me
  A4()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 14;
  }

  // GM03.dxr #45 on A5 me
  A5()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 15;
  }

  // GM03.dxr #45 on A6 me
  A6()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 16;
  }

  // GM03.dxr #45 on A7 me
  A7()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 17;
  }

  // GM03.dxr #45 on AX me
  AX()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 10;
  }

  // GM03.dxr #45 on S1 me
  S1()        {
    sendSprite(this.pBTN_Channel, sym('startflash'));
  }

  // GM03.dxr #45 on SX me
  SX()        {
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM03.dxr #45 on MX me
  MX()        {
    sendSprite(this.pMond_Channel, sym('stop'));
  }

  // GM03.dxr #45 on M1 me
  M1()        {
    sendSprite(this.pMond_Channel, sym('open'));
  }

  // GM03.dxr #45 on M2 me
  M2()        {
    sendSprite(this.pMond_Channel, sym('Talk'));
  }

  // GM03.dxr #45 on KS me
  KS()        {
    sendSprite(this.pKAS_Channel, sym('startflash'));
  }

  // GM03.dxr #45 on KX me
  KX()        {
    sendSprite(this.pKAS_Channel, sym('stopFlash'));
  }

  // GM03.dxr #45 on setBTN_Channel me, wChannel
  setBTN_Channel(wChannel       )        {
    this.pBTN_Channel = wChannel;
  }
}
