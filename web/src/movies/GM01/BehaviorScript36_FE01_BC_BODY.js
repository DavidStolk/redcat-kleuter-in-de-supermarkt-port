// GM01.dxr BehaviorScript 36 - FE01_BC_BODY (decomp/GM01/scripts/BehaviorScript 36 - FE01_BC_BODY.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getAt, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE01_BC_BODY extends LingoScript {
  static scriptName = 'FE01_BC_BODY';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pChannels        = VOID; pSprite        = VOID;
  pMem        = VOID; pLocH        = VOID; pLocV        = VOID; pC_Mem        = VOID; pSND_WalkOut1        = VOID;
  pSND_WalkOut2        = VOID; pSND_WalkIn        = VOID; pSND_Path        = VOID; pSND_Volume        = VOID;
  pBord_Channel        = VOID; pCont_Channel        = VOID; pBody_Channel        = VOID; pMond_Channel        = VOID;
  pOog_Channel        = VOID;

  // GM01.dxr #36 on beginSprite me
  beginSprite()        {
    this.pBord_Channel = this.spriteNum;
    this.pCont_Channel = this.pBord_Channel + 1;
    this.pBody_Channel = this.pBord_Channel + 7;
    this.pMond_Channel = this.pBord_Channel + 8;
    this.pOog_Channel = this.pBord_Channel + 9;
    this.pSND_Path = getaProp(G.gAppSettings, sym('FE01_PATH_SNDFX'));
    this.pSND_Volume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    const myCharacter = 'BR';
    this.pSND_WalkIn = dsNewSound(cat(this.pSND_Path, myCharacter, 'ZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(this.pSND_Path, myCharacter, 'ZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(this.pSND_Path, myCharacter, 'ZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, -10000);
    dsSetVolume(this.pSND_WalkOut1, -10000);
    dsSetVolume(this.pSND_WalkOut2, -10000);
    this.pLocH = sprite(this.pBord_Channel).locH;
    for (let myChannel = this.pBord_Channel, n = this.pOog_Channel; myChannel <= n; myChannel++) {
      sprite(myChannel).locH = -400;
    }
    sendSprite(0, sym('addChannel'), sym('BC'), this.pBord_Channel);
  }

  // GM01.dxr #36 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_WalkIn);
    dsDelSound(this.pSND_WalkOut1);
    dsDelSound(this.pSND_WalkOut2);
  }

  // GM01.dxr #36 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (gt(this.pFH, 0)) {
          this.pFH = this.pFH - 1;
          return;
        }
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_WalkIn);
          sprite(this.pBody_Channel).memberNum = this.pMem + 3;
          sprite(this.pBody_Channel).locH = this.pLocH;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pBord_Channel).memberNum = this.pMem + 5;
            sprite(this.pBord_Channel).locH = this.pLocH;
            sprite(this.pBody_Channel).memberNum = this.pMem + 6;
            this.pFH = 3;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pBody_Channel).memberNum = this.pMem + 8;
              sprite(this.pMond_Channel).memberNum = this.pMem + 9;
              sprite(this.pMond_Channel).locH = this.pLocH;
              sprite(this.pOog_Channel).memberNum = this.pMem + 12;
              sprite(this.pOog_Channel).locH = this.pLocH;
              this.pFS = 0;
              sendSprite(this.pMond_Channel, sym('setMem'));
              sendSprite(this.pOog_Channel, sym('Start'));
              sendSprite(0, sym('EventDone'));
              return;
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
            sprite(this.pBody_Channel).memberNum = this.pMem + 7;
            sprite(this.pMond_Channel).locH = -400;
            sprite(this.pOog_Channel).locH = -400;
            this.pFH = 8;
          } else {
            if (eq(this.pFR, 2)) {
              sendSprite(this.pCont_Channel, sym('hide'));
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pBord_Channel).memberNum = this.pMem + 4;
              sprite(this.pBody_Channel).memberNum = this.pMem + 1;
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pBord_Channel).locH = -400;
                sprite(this.pBody_Channel).memberNum = this.pMem + 2;
              } else {
                if (eq(this.pFR, 4)) {
                  sprite(this.pBody_Channel).locH = -400;
                  this.pFS = 0;
                  sendSprite(0, sym('EventDone'));
                  return;
                }
              }
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM01.dxr #36 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFH = 0;
    this.pFR = 1;
  }

  // GM01.dxr #36 on WalkOut me
  WalkOut()        {
    sendSprite(this.pOog_Channel, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM01.dxr #36 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(this.pMond_Channel, sym('stop'));
    sendSprite(this.pOog_Channel, sym('stop'));
  }

  // GM01.dxr #36 on setData me, wType
  setData(wType       )        {
    const myCharacter = getAt(['BR', 'BR', 'MX', 'MX'], wType);
    this.pSND_WalkIn = dsNewSound(cat(this.pSND_Path, myCharacter, 'ZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(this.pSND_Path, myCharacter, 'ZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(this.pSND_Path, myCharacter, 'ZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, this.pSND_Volume);
    dsSetVolume(this.pSND_WalkOut1, this.pSND_Volume);
    dsSetVolume(this.pSND_WalkOut2, this.pSND_Volume);
    if (eq(wType, 1)) {
      this.pLocH = 350;
      this.pLocV = 342;
      this.pMem = member('MIDX_FE01_BCBR1').memberNum;
    } else {
      if (eq(wType, 2)) {
        this.pLocH = 360;
        this.pLocV = 148;
        this.pMem = member('MIDX_FE01_BCBR2').memberNum;
      } else {
        if (eq(wType, 3)) {
          this.pLocH = 380;
          this.pLocV = 318;
          this.pMem = member('MIDX_FE01_BCMX1').memberNum;
        } else {
          if (eq(wType, 4)) {
            this.pLocH = 320;
            this.pLocV = 192;
            this.pMem = member('MIDX_FE01_BCMX2').memberNum;
          }
        }
      }
    }
    for (let myChannel = this.pBord_Channel, n = this.pOog_Channel; myChannel <= n; myChannel++) {
      sprite(myChannel).locV = this.pLocV;
    }
  }

  // GM01.dxr #36 on c me
  c()        {
    sendSprite(this.pCont_Channel, sym('update'));
  }

  // GM01.dxr #36 on M1 me
  M1()        {
    sendSprite(this.pMond_Channel, sym('open'));
  }

  // GM01.dxr #36 on M2 me
  M2()        {
    sendSprite(this.pMond_Channel, sym('Talk'));
  }

  // GM01.dxr #36 on MX me
  MX()        {
    sendSprite(this.pMond_Channel, sym('stop'));
  }
}
