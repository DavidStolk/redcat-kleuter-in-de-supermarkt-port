// GM04.dxr BehaviorScript 78 - LC_BODY (decomp/GM04/scripts/BehaviorScript 78 - LC_BODY.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class LC_BODY extends LingoScript {
  static scriptName = 'LC_BODY';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pChannels        = VOID; pSprite        = VOID;
  pMem        = VOID; pLocH        = VOID; pLocV        = VOID; pC_Mem        = VOID;
  pSND_WalkOut1        = VOID; pSND_WalkOut2        = VOID; pSND_WalkIn        = VOID; pSND_Path        = VOID;
  pSND_Volume        = VOID; pBody_Channel        = VOID; pMond_Channel        = VOID; pOog_Channel        = VOID;
  pHand_Channel        = VOID; pLolly_Channel        = VOID;

  // GM04.dxr #78 on beginSprite me
  beginSprite()        {
    const gAppSettings = G.gAppSettings;
    this.pBody_Channel = this.spriteNum;
    this.pMond_Channel = this.pBody_Channel + 1;
    this.pOog_Channel = this.pBody_Channel + 2;
    this.pLolly_Channel = this.pBody_Channel - 2;
    this.pHand_Channel = this.pBody_Channel - 1;
    this.pSND_Path = getaProp(gAppSettings, sym('FE04_PATH_SNDFX'));
    this.pSND_Volume = getaProp(gAppSettings, sym('VOLUME_SNDFX'));
    for (let myChannel = this.pLolly_Channel, e = this.pOog_Channel; myChannel <= e; myChannel++) {
      sprite(myChannel).locH = -400;
    }
    sendSprite(0, sym('addChannel'), sym('LC'), this.pBody_Channel);
  }

  // GM04.dxr #78 on exitFrame me
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
            sprite(this.pBody_Channel).memberNum = this.pMem + 4;
            this.pFH = 3;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pBody_Channel).memberNum = this.pMem + 6;
              sprite(this.pMond_Channel).memberNum = this.pMem + 7;
              sprite(this.pMond_Channel).locH = this.pLocH;
              sprite(this.pOog_Channel).memberNum = this.pMem + 10;
              sprite(this.pOog_Channel).locH = this.pLocH;
              sprite(this.pHand_Channel).memberNum = this.pMem + 13;
              sprite(this.pHand_Channel).locH = this.pLocH;
              this.pFS = 0;
              sendSprite(this.pOog_Channel, sym('Start'));
              sendSprite(this.pMond_Channel, sym('setMem'));
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
            sprite(this.pBody_Channel).memberNum = this.pMem + 5;
            sprite(this.pMond_Channel).locH = -400;
            sprite(this.pOog_Channel).locH = -400;
            sprite(this.pHand_Channel).locH = -400;
            this.pFH = 8;
          } else {
            if (eq(this.pFR, 2)) {
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pLolly_Channel).locH = -400;
              sprite(this.pBody_Channel).memberNum = this.pMem + 3;
              sprite(this.pMond_Channel).memberNum = this.pMem + 1;
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pBody_Channel).memberNum = this.pMem + 2;
                sprite(this.pMond_Channel).locH = -400;
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
        } else {
          if (eq(this.pFS, 3)) {
            sprite(this.pLolly_Channel).locH = -400;
            sprite(this.pHand_Channel).memberNum = this.pMem + 13;
            this.pFS = 0;
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM04.dxr #78 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFH = 0;
    this.pFR = 1;
  }

  // GM04.dxr #78 on WalkOut me
  WalkOut()        {
    sendSprite(this.pOog_Channel, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM04.dxr #78 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(this.pMond_Channel, sym('stop'));
    sendSprite(this.pOog_Channel, sym('stop'));
  }

  // GM04.dxr #78 on setData me, wType
  setData(wType       )        {
    this.pSND_WalkIn = dsNewSound(cat(this.pSND_Path, wType, 'ZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(this.pSND_Path, wType, 'ZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(this.pSND_Path, wType, 'ZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, this.pSND_Volume);
    dsSetVolume(this.pSND_WalkOut1, this.pSND_Volume);
    dsSetVolume(this.pSND_WalkOut2, this.pSND_Volume);
    if (eq(wType, sym('RC'))) {
      this.pLocH = 455;
      this.pLocV = 356;
      this.pMem = member('MIDX_FE04_LCRC').memberNum;
    } else {
      if (eq(wType, sym('BR'))) {
        this.pLocH = 455;
        this.pLocV = 356;
        this.pMem = member('MIDX_FE04_LCBR').memberNum;
      } else {
        if (eq(wType, sym('MX'))) {
          this.pLocH = 455;
          this.pLocV = 356;
          this.pMem = member('MIDX_FE04_LCMX').memberNum;
        }
      }
    }
    for (let myChannel = this.pBody_Channel, e = this.pHand_Channel; myChannel <= e; myChannel++) {
      sprite(myChannel).locV = this.pLocV;
    }
  }

  // GM04.dxr #78 on M1 me
  M1()        {
    sendSprite(this.pMond_Channel, sym('open'));
  }

  // GM04.dxr #78 on M2 me
  M2()        {
    sendSprite(this.pMond_Channel, sym('Talk'));
  }

  // GM04.dxr #78 on MX me
  MX()        {
    sendSprite(this.pMond_Channel, sym('stop'));
  }

  // GM04.dxr #78 on handsFree me
  handsFree()        {
    this.pFS = 3;
  }

  // GM04.dxr #78 on handsUp me
  handsUp()        {
    sprite(this.pHand_Channel).memberNum = this.pMem + 14;
  }

  // GM04.dxr #78 on holdLollie me, wMem
  holdLollie(wMem       )        {
    sprite(this.pLolly_Channel).memberNum = wMem;
    sprite(this.pLolly_Channel).locH = this.pLocH;
    sprite(this.pHand_Channel).memberNum = this.pMem + 15;
  }
}
