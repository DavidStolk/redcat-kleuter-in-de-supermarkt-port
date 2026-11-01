// GM02.dxr BehaviorScript 45 - FE02_EC_BODY (decomp/GM02/scripts/BehaviorScript 45 - FE02_EC_BODY.ls)
import { dsDelSound, dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// End character (game-over cheer): walks in, talks (sprites +3..+5), walks out.
// Sound path is #FE01_PATH_SNDFX (sic, as in the original).
export class FE02_EC_BODY extends LingoScript {
  static scriptName = 'FE02_EC_BODY';
  pSprite        = VOID; pFS        = VOID; pFR        = VOID; pMem        = VOID; pFH        = VOID;
  pLocH        = VOID; pChannels        = VOID; pSND_WalkOut1        = VOID; pSND_WalkOut2        = VOID;
  pSND_WalkIn        = VOID; pMemList        = VOID; pA1_Channel        = VOID; pBTN_Channels        = VOID;
  pBTN_Channel        = VOID;

  // GM02.dxr #45 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = member('MIDX_FE02_EC').memberNum;
    this.pLocH = 327;
    const myPath = getaProp(G.gAppSettings, sym('FE01_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_WalkIn = dsNewSound(cat(myPath, 'RCZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(myPath, 'RCZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(myPath, 'RCZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, myVolume);
    dsSetVolume(this.pSND_WalkOut1, myVolume);
    dsSetVolume(this.pSND_WalkOut2, myVolume);
    sendSprite(0, sym('addChannel'), sym('EC'), this.pSprite);
  }

  // GM02.dxr #45 on endSprite me
  endSprite()        {
    dsDelSound(this.pSND_WalkIn);
    dsDelSound(this.pSND_WalkOut1);
    dsDelSound(this.pSND_WalkOut2);
  }

  // GM02.dxr #45 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_WalkIn);
          sprite(this.pSprite).memberNum = this.pMem + 1;
          sprite(this.pSprite + 1).memberNum = this.pMem + 2;
          sprite(this.pSprite).locH = this.pLocH;
          sprite(this.pSprite + 1).locH = this.pLocH;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).locH = -600;
            sprite(this.pSprite + 1).locH = -600;
            sprite(this.pSprite + 2).memberNum = this.pMem + 7;
            sprite(this.pSprite + 2).locH = this.pLocH;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pSprite + 2).memberNum = this.pMem + 9;
              sprite(this.pSprite + 3).locH = this.pLocH;
              sprite(this.pSprite + 4).locH = this.pLocH;
              sprite(this.pSprite + 5).locH = this.pLocH;
              sendSprite(this.pSprite + 3, sym('Start'));
              sendSprite(this.pSprite + 4, sym('Start'));
              sendSprite(this.pSprite + 5, sym('Start'));
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
            sprite(this.pSprite + 3).locH = -200;
            sprite(this.pSprite + 4).locH = -200;
            sprite(this.pSprite + 5).locH = -200;
            sprite(this.pSprite + 2).memberNum = this.pMem + 8;
            this.pFH = 4;
          } else {
            if (eq(this.pFR, 2)) {
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pSprite).memberNum = this.pMem + 3;
              sprite(this.pSprite + 1).memberNum = this.pMem + 4;
              sprite(this.pSprite + 2).memberNum = this.pMem + 5;
              sprite(this.pSprite).locH = this.pLocH;
              sprite(this.pSprite + 1).locH = this.pLocH;
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pSprite).locH = -600;
                sprite(this.pSprite + 1).locH = -600;
                sprite(this.pSprite + 2).memberNum = this.pMem + 6;
              } else {
                if (eq(this.pFR, 4)) {
                  sprite(this.pSprite + 2).locH = -600;
                  this.pFS = 0;
                  sendSprite(0, sym('EventDone'));
                }
              }
            }
          }
          this.pFR = this.pFR + 1;
        }
      }
    }
  }

  // GM02.dxr #45 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM02.dxr #45 on WalkOut me
  WalkOut()        {
    sendSprite(this.pSprite + 3, sym('stop'));
    sendSprite(this.pSprite + 4, sym('stop'));
    sendSprite(this.pSprite + 5, sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM02.dxr #45 on halt me
  halt()        {
    sendSprite(this.pSprite + 3, sym('stop'));
    sendSprite(this.pSprite + 4, sym('stop'));
    sendSprite(this.pSprite + 5, sym('stop'));
    this.pFS = 0;
  }
}
