// GM03.dxr BehaviorScript 46 - FE03_RCUL_MOND (decomp/GM03/scripts/BehaviorScript 46 - FE03_RCUL_MOND.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Mouth (talk) animation. `pHold` here plays the role of pFH in the other scripts.
export class FE03_RCUL_MOND extends LingoScript {
  static scriptName = 'FE03_RCUL_MOND';
  pSprite        = VOID; pFS        = VOID; pFrame        = VOID; pMem        = VOID; pHold        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM03.dxr #46 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pSequenceList = [[2, 1, 0], [1, 0], [2, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM03.dxr #46 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (gt(this.pHold, 0)) {
          this.pHold = this.pHold - 1;
          return;
        }
        sprite(this.pSprite).memberNum = this.pMem + getAt(this.pSequence, this.pFrame);
        if (eq(this.pFrame, this.pFrameCount)) {
          this.pFrame = 0;
          this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pFrameCount = count(this.pSequence);
        } else {
          this.pHold = random(2);
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM03.dxr #46 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM03.dxr #46 on open me
  open()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem + random(2);
  }

  // GM03.dxr #46 on Talk me
  Talk()        {
    this.pFS = 1;
    this.pFrame = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
