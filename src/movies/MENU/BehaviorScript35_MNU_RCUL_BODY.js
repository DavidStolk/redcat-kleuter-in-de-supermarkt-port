// MENU.dxr BehaviorScript 35 - MNU_RCUL_BODY (decomp/MENU/scripts/BehaviorScript 35 - MNU_RCUL_BODY.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, gt, gteq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class MNU_RCUL_BODY extends LingoScript {
  static scriptName = 'MNU_RCUL_BODY';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pLocH        = VOID; pSND_WalkOut1        = VOID; pSND_WalkOut2        = VOID; pSND_WalkIn        = VOID;
  pMond_Channel        = VOID; pOog_Channel        = VOID; pArm1_Channel        = VOID; pArm2_Channel        = VOID;

  // MENU.dxr #35 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = member('MIDX_RCUL').memberNum;
    this.pLocH = sprite(this.pSprite).locH;
    this.pMond_Channel = this.pSprite + 1;
    this.pOog_Channel = this.pSprite + 2;
    this.pArm1_Channel = this.pSprite + 3;
    this.pArm2_Channel = this.pSprite + 4;
    const myPath = getaProp(G.gAppSettings, sym('MNU_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_WalkIn = dsNewSound(cat(myPath, 'RCZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(myPath, 'RCZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(myPath, 'RCZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, myVolume);
    dsSetVolume(this.pSND_WalkOut1, myVolume);
    dsSetVolume(this.pSND_WalkOut2, myVolume);
    if (gteq(getaProp(G.gAppSettings, sym('MNU_UL')), 0)) {
      const myRE = this.pSprite + 4;
      for (let myChannel = this.pSprite; myChannel <= myRE; myChannel++) {
        sprite(myChannel).locH = -200;
      }
    }
    sendSprite(0, sym('addChannel'), sym('RCUL'), this.pSprite);
  }

  // MENU.dxr #35 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_WalkIn);
    dsDelSound(this.pSND_WalkOut1);
    dsDelSound(this.pSND_WalkOut2);
  }

  // MENU.dxr #35 on exitFrame me
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
              sprite(this.pMond_Channel).memberNum = this.pMem + 7;
              sprite(this.pOog_Channel).memberNum = this.pMem + 10;
              sprite(this.pArm1_Channel).memberNum = this.pMem + 13;
              sprite(this.pArm2_Channel).memberNum = this.pMem + 22;
              sprite(this.pMond_Channel).locH = this.pLocH;
              sprite(this.pOog_Channel).locH = this.pLocH;
              sprite(this.pArm1_Channel).locH = this.pLocH;
              sprite(this.pArm2_Channel).locH = this.pLocH;
              sendSprite(this.pOog_Channel, sym('Start'));
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
            sprite(this.pSprite).memberNum = this.pMem + 5;
            sprite(this.pMond_Channel).locH = -200;
            sprite(this.pOog_Channel).locH = -200;
            sprite(this.pArm1_Channel).locH = -200;
            sprite(this.pArm2_Channel).locH = -200;
            this.pFH = 4;
          } else {
            if (eq(this.pFR, 2)) {
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pSprite).memberNum = this.pMem + 1;
              sprite(this.pMond_Channel).memberNum = this.pMem + 3;
              sprite(this.pSprite + 1).locH = this.pLocH;
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pSprite).memberNum = this.pMem + 2;
                sprite(this.pMond_Channel).locH = -200;
              } else {
                if (eq(this.pFR, 4)) {
                  sprite(this.pSprite).locH = -200;
                } else {
                  if (eq(this.pFR, 5)) {
                    this.pFS = 0;
                    sendSprite(0, sym('EventDone'));
                  }
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
              sprite(this.pArm2_Channel).memberNum = this.pMem + 24;
              this.pFR = 2;
              this.pFH = 1;
            } else {
              if (eq(this.pFR, 2)) {
                sprite(this.pArm2_Channel).memberNum = this.pMem + 25;
                this.pFR = 1;
                this.pFH = 1;
              }
            }
          }
        }
      }
    }
  }

  // MENU.dxr #35 on default me
  default()        {
    sendSprite(this.pMond_Channel, sym('stop'));
    sendSprite(this.pOog_Channel, sym('Start'));
    sprite(this.pArm1_Channel).memberNum = this.pMem + 13;
    sprite(this.pArm2_Channel).memberNum = this.pMem + 22;
    this.pFS = 0;
  }

  // MENU.dxr #35 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // MENU.dxr #35 on WalkOut me
  WalkOut()        {
    sendSprite(this.pOog_Channel, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
    this.pFH = 0;
  }

  // MENU.dxr #35 on AX me
  AX()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 13; }
  // MENU.dxr #35 on A1 me
  A1()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 14; }
  // MENU.dxr #35 on A2 me
  A2()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 15; }
  // MENU.dxr #35 on A3 me
  A3()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 16; }
  // MENU.dxr #35 on A4 me
  A4()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 17; }
  // MENU.dxr #35 on A5 me
  A5()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 18; }
  // MENU.dxr #35 on A6 me
  A6()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 19; }
  // MENU.dxr #35 on A7 me
  A7()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 20; }
  // MENU.dxr #35 on A8 me
  A8()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 21; }
  // MENU.dxr #35 on BX me
  BX()        { sprite(this.pArm2_Channel).memberNum = this.pMem + 22; }
  // MENU.dxr #35 on B1 me
  B1()        { sprite(this.pArm2_Channel).memberNum = this.pMem + 23; }
  // MENU.dxr #35 on B2 me
  B2()        { sprite(this.pArm2_Channel).memberNum = this.pMem + 24; }
  // MENU.dxr #35 on B3 me
  B3()        { sprite(this.pArm2_Channel).memberNum = this.pMem + 25; }
  // MENU.dxr #35 on B4 me
  B4()        { sprite(this.pArm2_Channel).memberNum = this.pMem + 26; }

  // MENU.dxr #35 on MX me
  MX()        { sendSprite(this.pMond_Channel, sym('stop')); }
  // MENU.dxr #35 on M1 me
  M1()        { sendSprite(this.pMond_Channel, sym('open')); }
  // MENU.dxr #35 on M2 me
  M2()        { sendSprite(this.pMond_Channel, sym('Talk')); }
}
