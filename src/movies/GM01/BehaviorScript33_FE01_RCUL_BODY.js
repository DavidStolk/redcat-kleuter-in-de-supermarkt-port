// GM01.dxr BehaviorScript 33 - FE01_RCUL_BODY (decomp/GM01/scripts/BehaviorScript 33 - FE01_RCUL_BODY.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { add, cat, eq, getAt, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE01_RCUL_BODY extends LingoScript {
  static scriptName = 'FE01_RCUL_BODY';
  pSprite        = VOID; pFS        = VOID; pFR        = VOID; pMem        = VOID; pFH        = VOID;
  pLocH        = VOID; pChannels        = VOID; pSND_WalkOut1        = VOID; pSND_WalkOut2        = VOID;
  pSND_WalkIn        = VOID; pMemList        = VOID; pA1_Channel        = VOID; pBTN_Channels        = VOID;
  pBTN_Channel        = VOID;

  // GM01.dxr #33 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = member('MIDX_FE01_RCUL').memberNum;
    this.pA1_Channel = this.pSprite + 3;
    this.pLocH = sprite(this.pSprite).locH;
    const myPath = getaProp(G.gAppSettings, sym('FE01_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_WalkIn = dsNewSound(cat(myPath, 'RCZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(myPath, 'RCZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(myPath, 'RCZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, myVolume);
    dsSetVolume(this.pSND_WalkOut1, myVolume);
    dsSetVolume(this.pSND_WalkOut2, myVolume);
    this.pMemList = [];
    sprite(this.pSprite).locH = -200;
    add(this.pMemList, sprite(this.pSprite).memberNum);
    let myChannel = this.pSprite + 1;
    sprite(myChannel).locH = -200;
    add(this.pMemList, sprite(myChannel).memberNum);
    myChannel = this.pSprite + 2;
    sprite(myChannel).locH = -200;
    add(this.pMemList, sprite(myChannel).memberNum);
    myChannel = this.pSprite + 3;
    sprite(myChannel).locH = -200;
    add(this.pMemList, sprite(myChannel).memberNum);
    myChannel = this.pSprite + 4;
    sprite(myChannel).locH = -200;
    add(this.pMemList, sprite(myChannel).memberNum);
    sendSprite(0, sym('addChannel'), sym('RCUL'), this.pSprite);
  }

  // GM01.dxr #33 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_WalkIn);
    dsDelSound(this.pSND_WalkOut1);
    dsDelSound(this.pSND_WalkOut2);
  }

  // GM01.dxr #33 on exitFrame me
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
              sprite(this.pSprite + 3).memberNum = this.pMem + 13;
              sprite(this.pSprite + 4).memberNum = this.pMem + 20;
              sprite(this.pSprite + 1).locH = this.pLocH;
              sprite(this.pSprite + 2).locH = this.pLocH;
              sprite(this.pSprite + 3).locH = this.pLocH;
              sprite(this.pSprite + 4).locH = this.pLocH;
              sendSprite(this.pSprite + 2, sym('Start'));
              sendSprite(0, sym('EventDone'));
              this.pFS = 0;
              return;
            }
          }
        }
        this.pFR = this.pFR + 1;
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
            sprite(this.pSprite + 4).locH = -200;
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
          this.pFR = this.pFR + 1;
        } else {
          if (eq(this.pFS, 3)) {
            if (gt(this.pFH, 0)) {
              this.pFH = this.pFH - 1;
              return;
            }
            if (eq(this.pFR, 1)) {
              sprite(this.pSprite + 4).memberNum = this.pMem + 21;
              this.pFR = 2;
              this.pFH = 1;
            } else {
              if (eq(this.pFR, 2)) {
                sprite(this.pSprite + 4).memberNum = this.pMem + 22;
                this.pFR = 1;
                this.pFH = 1;
              }
            }
          }
        }
      }
    }
  }

  // GM01.dxr #33 on default me
  default()        {
    sprite(this.pSprite).locH = this.pLocH;
    sprite(this.pSprite).memberNum = getAt(this.pMemList, 1);
    sprite(this.pSprite + 1).locH = this.pLocH;
    sprite(this.pSprite + 1).memberNum = getAt(this.pMemList, 2);
    sprite(this.pSprite + 2).locH = this.pLocH;
    sprite(this.pSprite + 2).memberNum = getAt(this.pMemList, 3);
    sprite(this.pSprite + 3).locH = this.pLocH;
    sprite(this.pSprite + 3).memberNum = getAt(this.pMemList, 4);
    sprite(this.pSprite + 4).locH = this.pLocH;
    sprite(this.pSprite + 4).memberNum = getAt(this.pMemList, 5);
    sendSprite(this.pSprite + 2, sym('Start'));
    this.pFS = 0;
  }

  // GM01.dxr #33 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM01.dxr #33 on WalkOut me
  WalkOut()        {
    sendSprite(this.pSprite + 2, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM01.dxr #33 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(this.pSprite + 1, sym('stop'));
    sendSprite(this.pSprite + 2, sym('stop'));
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM01.dxr #33 on AX me
  AX()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 13;
  }

  // GM01.dxr #33 on A1 me
  A1()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 14;
  }

  // GM01.dxr #33 on A2 me
  A2()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 15;
  }

  // GM01.dxr #33 on A3 me
  A3()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 16;
  }

  // GM01.dxr #33 on A4 me
  A4()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 17;
  }

  // GM01.dxr #33 on A5 me
  A5()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 18;
  }

  // GM01.dxr #33 on A6 me
  A6()        {
    sprite(this.pA1_Channel).memberNum = this.pMem + 19;
  }

  // GM01.dxr #33 on B1 me
  B1()        {
    this.pFS = 3;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM01.dxr #33 on BX me
  BX()        {
    sprite(this.pSprite + 4).memberNum = this.pMem + 20;
    this.pFS = 0;
  }

  // GM01.dxr #33 on S1 me
  S1()        {
    sendSprite(this.pBTN_Channel, sym('startflash'));
  }

  // GM01.dxr #33 on SX me
  SX()        {
    sendSprite(this.pBTN_Channel, sym('stopFlash'));
  }

  // GM01.dxr #33 on MX me
  MX()        {
    sendSprite(this.pSprite + 1, sym('stop'));
  }

  // GM01.dxr #33 on M1 me
  M1()        {
    sendSprite(this.pSprite + 1, sym('open'));
  }

  // GM01.dxr #33 on M2 me
  M2()        {
    sendSprite(this.pSprite + 1, sym('Talk'));
  }

  // GM01.dxr #33 on setBTN_Channel me, wChannel
  setBTN_Channel(wChannel       )        {
    this.pBTN_Channel = wChannel;
  }
}
