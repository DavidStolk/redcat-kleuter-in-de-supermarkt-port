// GM04.dxr BehaviorScript 75 - FE04_RCUL_BODY (decomp/GM04/scripts/BehaviorScript 75 - FE04_RCUL_BODY.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE04_RCUL_BODY extends LingoScript {
  static scriptName = 'FE04_RCUL_BODY';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pLocH        = VOID; pBTN_Channels        = VOID; pBTN_Channel        = VOID; pSND_WalkOut1        = VOID;
  pSND_WalkOut2        = VOID; pSND_WalkIn        = VOID;

  // GM04.dxr #75 on beginSprite me
  beginSprite()        {
    const gAppSettings = G.gAppSettings;
    this.pSprite = this.spriteNum;
    this.pMem = member('MIDX_FE04_RCUL').memberNum;
    this.pLocH = 500;
    const myPath = getaProp(gAppSettings, sym('FE04_PATH_SNDFX'));
    const myVolume = getaProp(gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_WalkIn = dsNewSound(cat(myPath, 'RCZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(myPath, 'RCZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(myPath, 'RCZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, myVolume);
    dsSetVolume(this.pSND_WalkOut1, myVolume);
    dsSetVolume(this.pSND_WalkOut2, myVolume);
    sprite(this.pSprite).locH = -200;
    sprite(this.pSprite + 1).locH = -200;
    sprite(this.pSprite + 2).locH = -200;
    sprite(this.pSprite + 3).locH = -200;
    this.pBTN_Channel = 0;
    sendSprite(0, sym('addChannel'), sym('RCUL'), this.pSprite);
  }

  // GM04.dxr #75 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_WalkIn);
    dsDelSound(this.pSND_WalkOut1);
    dsDelSound(this.pSND_WalkOut2);
  }

  // GM04.dxr #75 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_WalkIn);
          sprite(this.pSprite).memberNum = this.pMem + 3;
          sprite(this.pSprite).locH = this.pLocH;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).memberNum = this.pMem + 4;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pSprite).memberNum = this.pMem + 6;
              sprite(this.pSprite + 1).memberNum = this.pMem + 7;
              sprite(this.pSprite + 2).memberNum = this.pMem + 10;
              sprite(this.pSprite + 3).memberNum = this.pMem + 14;
              sprite(this.pSprite + 1).locH = this.pLocH;
              sprite(this.pSprite + 2).locH = this.pLocH;
              sprite(this.pSprite + 3).locH = this.pLocH;
              this.pFS = 0;
              sendSprite(this.pSprite + 2, sym('Start'));
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
          if (eq(this.pFR, 1)) {
            dsPlay(this.pSND_WalkOut1);
            sprite(this.pSprite + 1).locH = -200;
            sprite(this.pSprite + 2).locH = -200;
            sprite(this.pSprite + 3).locH = -200;
            sprite(this.pSprite).memberNum = this.pMem + 5;
            this.pFH = 4;
          } else {
            if (eq(this.pFR, 2)) {
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pSprite).memberNum = this.pMem + 3;
              sprite(this.pSprite + 1).memberNum = this.pMem + 1;
              sprite(this.pSprite + 1).locH = this.pLocH;
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pSprite).locH = -200;
                sprite(this.pSprite + 1).memberNum = this.pMem + 2;
              } else {
                if (eq(this.pFR, 4)) {
                  sprite(this.pSprite + 1).locH = -200;
                  this.pFS = 0;
                  sendSprite(0, sym('EventDone'));
                }
              }
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM04.dxr #75 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM04.dxr #75 on WalkOut me
  WalkOut()        {
    sendSprite(this.pSprite + 2, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
  }

  // GM04.dxr #75 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(this.pSprite + 1, sym('stop'));
    sendSprite(this.pSprite + 2, sym('stop'));
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM04.dxr #75 on A1 me
  A1()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 15;
  }

  // GM04.dxr #75 on A2 me
  A2()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 16;
  }

  // GM04.dxr #75 on A3 me
  A3()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 17;
  }

  // GM04.dxr #75 on A4 me
  A4()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 18;
  }

  // GM04.dxr #75 on A5 me
  A5()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 19;
  }

  // GM04.dxr #75 on A6 me
  A6()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 20;
  }

  // GM04.dxr #75 on A7 me
  A7()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 21;
  }

  // GM04.dxr #75 on AX me
  AX()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 14;
  }

  // GM04.dxr #75 on S1 me
  S1()        {
    sendSprite(this.pBTN_Channel, sym('startflash'));
  }

  // GM04.dxr #75 on SX me
  SX()        {
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM04.dxr #75 on MX me
  MX()        {
    sendSprite(this.pSprite + 1, sym('stop'));
  }

  // GM04.dxr #75 on M1 me
  M1()        {
    sendSprite(this.pSprite + 1, sym('open'));
  }

  // GM04.dxr #75 on M2 me
  M2()        {
    sendSprite(this.pSprite + 1, sym('Talk'));
  }

  // GM04.dxr #75 on setBTN_Channel me, wChannel
  setBTN_Channel(wChannel       )        {
    this.pBTN_Channel = wChannel;
  }
}
