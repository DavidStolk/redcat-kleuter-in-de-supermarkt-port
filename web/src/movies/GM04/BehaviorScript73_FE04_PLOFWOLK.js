// GM04.dxr BehaviorScript 73 - FE04_PLOFWOLK (decomp/GM04/scripts/BehaviorScript 73 - FE04_PLOFWOLK.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE04_PLOFWOLK extends LingoScript {
  static scriptName = 'FE04_PLOFWOLK';
  pFS        = VOID; pFR        = VOID; pSprite        = VOID; pMem        = VOID; pLoc        = VOID;
  pSND_Plof        = VOID;

  // GM04.dxr #73 on beginSprite me
  beginSprite()        {
    const gAppSettings = G.gAppSettings;
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    sprite(this.pSprite).locH = -400;
    const myPath = getaProp(gAppSettings, sym('FE04_PATH_SNDFX'));
    const myVolume = getaProp(gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_Plof = dsNewSound(cat(myPath, 'LLZF_01.wav'), 0);
    dsSetVolume(this.pSND_Plof, myVolume);
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('PLW'), this.pSprite);
  }

  // GM04.dxr #73 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_Plof);
          sprite(this.pSprite).loc = this.pLoc;
          sprite(this.pSprite).memberNum = this.pMem;
        } else {
          if (eq(this.pFR, 2)) {
            sprite(this.pSprite).memberNum = this.pMem + 1;
          } else {
            if (eq(this.pFR, 3)) {
              sprite(this.pSprite).locH = -400;
              this.pFS = 0;
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM04.dxr #73 on Plof me, wLoc
  Plof(wLoc       )        {
    this.pLoc = wLoc;
    this.pFS = 1;
    this.pFR = 1;
  }
}
