// GM02.dxr BehaviorScript 321 - RCUL_BODY (decomp/GM02/scripts/BehaviorScript 321 - RCUL_BODY.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Redcat explaining the game (walk in/out, mouth sprite +1, blink sprite +2, hand sprite +3).
export class RCUL_BODY extends LingoScript {
  static scriptName = 'RCUL_BODY';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pLocH        = VOID; pBTN_Channels        = VOID; pBTN_Channel        = VOID; pSND_WalkOut1        = VOID;
  pSND_WalkOut2        = VOID; pSND_WalkIn        = VOID;

  // GM02.dxr #321 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = member('MIDX_FE02_RCUL').memberNum;
    this.pLocH = 508;
    const myPath = getaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'));
    this.pSND_WalkIn = dsNewSound(cat(myPath, 'RCZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(myPath, 'RCZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(myPath, 'RCZF_03.wav'), 0);
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
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

  // GM02.dxr #321 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_WalkIn);
    dsDelSound(this.pSND_WalkOut1);
    dsDelSound(this.pSND_WalkOut2);
  }

  // GM02.dxr #321 on exitFrame me
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

  // GM02.dxr #321 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM02.dxr #321 on WalkOut me
  WalkOut()        {
    sendSprite(this.pSprite + 2, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
  }

  // GM02.dxr #321 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(this.pSprite + 2, sym('stop'));
    sendSprite(this.pSprite + 1, sym('stop'));
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM02.dxr #321 on A1 me
  A1()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 15;
  }

  // GM02.dxr #321 on A2 me
  A2()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 16;
  }

  // GM02.dxr #321 on A3 me
  A3()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 17;
  }

  // GM02.dxr #321 on A4 me
  A4()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 18;
  }

  // GM02.dxr #321 on A5 me
  A5()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 19;
  }

  // GM02.dxr #321 on A6 me
  A6()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 20;
  }

  // GM02.dxr #321 on A7 me
  A7()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 21;
  }

  // GM02.dxr #321 on AX me
  AX()        {
    sprite(this.pSprite + 3).memberNum = this.pMem + 14;
  }

  // GM02.dxr #321 on SX me
  SX()        {
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM02.dxr #321 on S1 me
  S1()        {
    sendSprite(this.pBTN_Channel, sym('startflash'));
  }

  // GM02.dxr #321 on MX me
  MX()        {
    sendSprite(this.pSprite + 1, sym('stop'));
  }

  // GM02.dxr #321 on M1 me
  M1()        {
    sendSprite(this.pSprite + 1, sym('open'));
  }

  // GM02.dxr #321 on M2 me
  M2()        {
    sendSprite(this.pSprite + 1, sym('Talk'));
  }

  // GM02.dxr #321 on setBTN_Channel me, wChannel
  setBTN_Channel(wChannel       )        {
    this.pBTN_Channel = wChannel;
  }
}
