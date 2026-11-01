// GM02.dxr BehaviorScript 242 - BC_MOND (decomp/GM02/scripts/BehaviorScript 242 - BC_MOND.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Mouth (talk) animation; pMem is set by `setMem` (the body script changes the member).
export class BC_MOND extends LingoScript {
  static scriptName = 'BC_MOND';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM02.dxr #242 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pSequenceList = [[2, 1, 0], [1, 0], [2, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM02.dxr #242 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (gt(this.pFH, 0)) {
          this.pFH = this.pFH - 1;
          return;
        }
        sprite(this.pSprite).memberNum = this.pMem + getAt(this.pSequence, this.pFR);
        if (eq(this.pFR, this.pFrameCount)) {
          this.pFR = 0;
          this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pFrameCount = count(this.pSequence);
        } else {
          this.pFH = random(2);
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM02.dxr #242 on setMem me
  setMem()        {
    this.pMem = sprite(this.pSprite).memberNum;
  }

  // GM02.dxr #242 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM02.dxr #242 on open me
  open()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem + random(2);
  }

  // GM02.dxr #242 on Talk me
  Talk()        {
    this.pFS = 1;
    this.pFR = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
