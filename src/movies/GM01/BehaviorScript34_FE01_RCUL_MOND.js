// GM01.dxr BehaviorScript 34 - FE01_RCUL_MOND (decomp/GM01/scripts/BehaviorScript 34 - FE01_RCUL_MOND.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Mouth (talk) animation.
export class FE01_RCUL_MOND extends LingoScript {
  static scriptName = 'FE01_RCUL_MOND';
  pSprite        = VOID; pFS        = VOID; pFrame        = VOID; pMem        = VOID; pFH        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM01.dxr #34 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pSequenceList = [[2, 1, 0], [1, 0], [2, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM01.dxr #34 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (gt(this.pFH, 0)) {
          this.pFH = this.pFH - 1;
          return;
        }
        sprite(this.pSprite).memberNum = this.pMem + getAt(this.pSequence, this.pFrame);
        if (eq(this.pFrame, this.pFrameCount)) {
          this.pFrame = 0;
          this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pFrameCount = count(this.pSequence);
        } else {
          this.pFH = random(2);
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM01.dxr #34 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM01.dxr #34 on open me
  open()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem + random(2);
  }

  // GM01.dxr #34 on Talk me
  Talk()        {
    this.pFS = 1;
    this.pFrame = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
