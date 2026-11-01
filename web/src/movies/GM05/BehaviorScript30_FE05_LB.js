// GM05.dxr BehaviorScript 30 - FE05_LB (decomp/GM05/scripts/BehaviorScript 30 - FE05_LB.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, charToNum, eq, getAt, getaProp, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE05_LB extends LingoScript {
  static scriptName = 'FE05_LB';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID; pLocH        = VOID;
  pLetterMIDX        = VOID; pPlofMIDX        = VOID; pPlofMem        = VOID; pCallBackFlag        = VOID;
  pEnable        = VOID; pSND_LB        = VOID;

  // GM05.dxr #30 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pLocH = sprite(this.pSprite).locH;
    this.pLetterMIDX = member('MIDX_FE05_LT').memberNum;
    this.pPlofMIDX = member('MIDX_FE05_LBPLOF').memberNum;
    this.pCallBackFlag = 0;
    sprite(this.pSprite).locH = -400;
    sprite(this.pSprite + 1).locH = -400;
    this.pEnable = 0;
    const myPath = getaProp(G.gAppSettings, sym('FE05_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_LB = dsNewSound(cat(myPath, 'LB_SHOW.wav'), 0);
    dsSetVolume(this.pSND_LB, myVolume);
    sendSprite(0, sym('addChannel'), sym('LB'), this.pSprite);
  }

  // GM05.dxr #30 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_LB);
          sprite(this.pSprite).memberNum = this.pMem + 2;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).memberNum = this.pMem + 3;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pSprite).memberNum = this.pMem + 4;
            } else {
              if (eq(this.pFR, 4)) {
                sprite(this.pSprite).memberNum = this.pMem + 5;
                sprite(this.pSprite + 1).locH = this.pLocH;
              } else {
                if (eq(this.pFR, 5)) {
                  this.pFS = 0;
                  sendSprite(0, sym('EventDone'));
                }
              }
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          if (eq(this.pFR, 1)) {
            sprite(this.pSprite + 1).locH = -100;
            sprite(this.pSprite).memberNum = this.pPlofMem;
          } else {
            if (eq(this.pFR, 2)) {
              sprite(this.pSprite).memberNum = this.pPlofMem + 1;
            } else {
              if (eq(this.pFR, 3)) {
                sprite(this.pSprite).locH = -100;
                this.pFS = 0;
                return;
              }
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM05.dxr #30 on halt me
  halt()        {
    this.pFS = 0;
  }

  // GM05.dxr #30 on setCallBack me
  setCallBack()        {
    this.pCallBackFlag = 1;
  }

  // GM05.dxr #30 on reset me, wLetter, wLocH
  reset(wLetter       , wLocH       )        {
    this.pLocH = wLocH;
    this.pCallBackFlag = 0;
    this.pEnable = 1;
    sprite(this.pSprite).memberNum = this.pMem;
    sprite(this.pSprite + 1).memberNum = this.pLetterMIDX + charToNum(wLetter) - 64;
    sprite(this.pSprite).locH = this.pLocH;
    sprite(this.pSprite + 1).locH = this.pLocH;
  }

  // GM05.dxr #30 on hideLetter me
  hideLetter()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
    sprite(this.pSprite + 1).locH = -400;
  }

  // GM05.dxr #30 on showLetter me
  showLetter()        {
    this.pFS = 1;
    this.pFR = 1;
  }

  // GM05.dxr #30 on Plof me
  Plof()        {
    if (!truthy(this.pEnable)) {
      return;
    }
    this.pEnable = 0;
    this.pPlofMem = this.pPlofMIDX + getAt([1, 3, 5], random(3));
    this.pFR = 1;
    this.pFS = 2;
  }
}
