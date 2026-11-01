// GM03.dxr BehaviorScript 52 - FE03_BLN (decomp/GM03/scripts/BehaviorScript 52 - FE03_BLN.ls)
import { call, dsNewSound, dsPlay, dsSetVolume, G, member, movieCall, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, float, getaProp, gt, minus, plus, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `setState_Default(gCursor)` without `global gCursor` resolves to the global (see GM01 BTN_BACK).
export class FE03_BLN extends LingoScript {
  static scriptName = 'FE03_BLN';
  pSprite        = VOID; pFS        = VOID; pFH        = VOID; pMemList        = VOID; pFR        = VOID;
  pMem        = VOID; pGetalMem        = VOID; pLocV        = VOID; pLocH        = VOID; pEnable        = VOID;
  pGridLoc        = VOID; pFlowStep        = VOID; pAccelerate        = VOID; pBLN_MRF        = VOID;
  pGTL_MRF        = VOID; pBLN_NUM        = VOID; pSND_BLOB        = VOID; pSND_BLKN        = VOID;

  // GM03.dxr #52 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pBLN_MRF = member('MIDX_FE03_BALLON').memberNum;
    this.pGTL_MRF = member('MIDX_FE03_BALLON_NUM').memberNum;
    this.pFS = 0;
    this.pEnable = 0;
    const myPath = getaProp(G.gAppSettings, sym('FE03_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_BLOB = dsNewSound(cat(myPath, 'BLOP_01.wav'), 0);
    dsSetVolume(this.pSND_BLOB, myVolume);
    this.pSND_BLKN = dsNewSound(cat(myPath, 'BLKN_01.wav'), 0);
    dsSetVolume(this.pSND_BLKN, myVolume);
    sendSprite(0, sym('addChannel'), sym('BLN'), this.pSprite);
  }

  // GM03.dxr #52 on mouseEnter me
  mouseEnter()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Active'), G.gCursor);
  }

  // GM03.dxr #52 on mouseLeave me
  mouseLeave()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
  }

  // GM03.dxr #52 on mouseDown me
  mouseDown()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    this.pEnable = 0;
    this.pFR = 1;
    this.pFS = 3;
    dsPlay(this.pSND_BLKN);
  }

  // GM03.dxr #52 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          sprite(this.pSprite).locV = this.pLocV;
          sprite(this.pSprite).locH = this.pLocH;
          sprite(this.pSprite).memberNum = this.pBLN_MRF + 1;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).memberNum = this.pBLN_MRF + 2;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pSprite).memberNum = this.pBLN_MRF + 3;
            } else {
              if (eq(this.pFR, 4)) {
                sprite(this.pSprite).memberNum = this.pBLN_MRF + 4;
                sprite(this.pSprite + 1).locV = this.pLocV;
                sprite(this.pSprite + 1).locH = this.pLocH;
                sprite(this.pSprite + 1).memberNum = this.pGTL_MRF + this.pBLN_NUM;
                this.pEnable = 1;
                this.pFS = 2;
              }
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          const myNextPoint = movieCall('getNextPoint', sprite(this.pSprite).loc, this.pGridLoc, this.pFlowStep);
          sprite(this.pSprite).loc = myNextPoint;
          sprite(this.pSprite + 1).loc = myNextPoint;
          if (truthy(this.pAccelerate)) {
            this.pFlowStep = plus(this.pFlowStep, 0.20000000000000001);
            if (gt(this.pFlowStep, 10)) {
              this.pAccelerate = 0;
            }
          } else {
            if (gt(this.pFlowStep, 4)) {
              this.pFlowStep = minus(this.pFlowStep, 0.20000000000000001);
            }
          }
          if (eq(myNextPoint, this.pGridLoc)) {
            this.pFS = 0;
          }
        } else {
          if (eq(this.pFS, 3)) {
            if (eq(this.pFR, 1)) {
              sprite(this.pSprite + 1).locH = -400;
              sprite(this.pSprite).memberNum = this.pBLN_MRF + 5;
            } else {
              if (eq(this.pFR, 2)) {
                sprite(this.pSprite).memberNum = this.pBLN_MRF + 6;
              } else {
                if (eq(this.pFR, 3)) {
                  sprite(this.pSprite).locH = -400;
                  this.pFS = 0;
                }
              }
            }
          } else {
            if (eq(this.pFS, 4)) {
              // pFS is never set to 4 in this movie (dead code, kept).
              const myNextPoint = plus(this.pGridLoc, [-3 + random(6), -3 + random(6)]);
              sprite(this.pSprite).loc = myNextPoint;
              sprite(this.pSprite + 1).loc = myNextPoint;
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM03.dxr #52 on blowUp me, wLoc, wNum, wGridLoc
  blowUp(wLoc       , wNum       , wGridLoc       )        {
    dsPlay(this.pSND_BLOB);
    this.pGridLoc = wGridLoc;
    this.pFlowStep = float(2);
    this.pAccelerate = 1;
    this.pFR = 1;
    this.pFS = 1;
    this.pFH = random(2) - 1;
    this.pLocV = wLoc.locV;
    this.pLocH = wLoc.locH;
    this.pBLN_NUM = wNum;
    this.pEnable = 0;
  }

  // GM03.dxr #52 on halt me
  halt()        {
    this.pFS = 0;
  }
}
