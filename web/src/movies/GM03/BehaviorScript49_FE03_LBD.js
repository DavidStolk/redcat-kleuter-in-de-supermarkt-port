// GM03.dxr BehaviorScript 49 - FE03_LBD (decomp/GM03/scripts/BehaviorScript 49 - FE03_LBD.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, div, eq, getaProp, gt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE03_LBD extends LingoScript {
  static scriptName = 'FE03_LBD';
  pFS        = VOID; pFH        = VOID; pFrame        = VOID; pSprite        = VOID; pMem        = VOID;
  pLocH        = VOID; pWolkMem        = VOID; pSND_Display        = VOID; pSND_Plof        = VOID;
  pEnableKassaButtonsFlag        = VOID; pAudioFlag        = VOID;

  // GM03.dxr #49 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pLocH = sprite(this.pSprite).locH;
    sprite(this.pSprite).locH = -300;
    const myMem = sprite(this.pSprite).memberNum;
    this.pWolkMem = myMem + 1;
    const myPath = getaProp(G.gAppSettings, sym('FE03_PATH_SNDFX'));
    const myLevel = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_Display = dsNewSound(cat(myPath, 'LBDFX_01.wav'), 0);
    this.pSND_Plof = dsNewSound(cat(myPath, 'LBDFX_02.wav'), 0);
    dsSetVolume(this.pSND_Display, myLevel);
    this.pSND_Plof = dsNewSound(cat(myPath, 'LBDFX_02.wav'), 0);
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('LBD'), this.pSprite);
  }

  // GM03.dxr #49 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFrame, 1)) {
          if (truthy(this.pAudioFlag)) {
            dsPlay(this.pSND_Plof);
          }
          sprite(this.pSprite).memberNum = this.pWolkMem;
        } else {
          if (eq(this.pFrame, 2)) {
            sprite(this.pSprite).memberNum = this.pWolkMem + 1;
          } else {
            if (eq(this.pFrame, 3)) {
              sprite(this.pSprite).locH = -300;
              this.pFS = 0;
              sendSprite(0, sym('EventDone'));
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          let myLocH = sprite(this.pSprite).locH;
          if (!truthy(this.pEnableKassaButtonsFlag)) {
            if (gt(sprite(this.pSprite).left, 0)) {
              this.pEnableKassaButtonsFlag = 1;
              sendSprite(0, sym('enable_Kassa'));
            }
          }
          if (myLocH < 530) {
            myLocH = myLocH + 6;
            sprite(this.pSprite).locH = myLocH;
          } else {
            this.pFS = 0;
            sendSprite(0, sym('EventDone'));
          }
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM03.dxr #49 on display me
  display()        {
    sprite(this.pSprite).locH = this.pLocH;
  }

  // GM03.dxr #49 on Plof me, wFlag
  Plof(wFlag       )        {
    this.pAudioFlag = wFlag;
    this.pFS = 1;
    this.pFrame = 1;
  }

  // GM03.dxr #49 on halt me
  halt()        {
    this.pFS = 0;
  }

  // GM03.dxr #49 on roll me
  roll()        {
    sprite(this.pSprite).locH = 0 - div(member(this.pMem).width, 2) - 2;
    this.pEnableKassaButtonsFlag = 0;
    this.pFS = 2;
  }

  // GM03.dxr #49 on setMem me, wMem
  setMem(wMem       )        {
    this.pMem = wMem;
    sprite(this.pSprite).memberNum = this.pMem;
  }
}
