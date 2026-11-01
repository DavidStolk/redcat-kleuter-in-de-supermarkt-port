// GM01.dxr BehaviorScript 37 - FE01_BC_MOND (decomp/GM01/scripts/BehaviorScript 37 - FE01_BC_MOND.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Mouth (talk) animation; pMem is set by `setMem` (the body script changes the member).
export class FE01_BC_MOND extends LingoScript {
  static scriptName = 'FE01_BC_MOND';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM01.dxr #37 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pSequenceList = [[2, 1, 0], [1, 0], [2, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM01.dxr #37 on exitFrame me
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

  // GM01.dxr #37 on setMem me
  setMem()        {
    this.pMem = sprite(this.pSprite).memberNum;
  }

  // GM01.dxr #37 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM01.dxr #37 on open me
  open()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem + random(2);
  }

  // GM01.dxr #37 on Talk me
  Talk()        {
    this.pFS = 1;
    this.pFR = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
