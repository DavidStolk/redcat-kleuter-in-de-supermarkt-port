// GM05.dxr BehaviorScript 29 - FE05_BC_OOG (decomp/GM05/scripts/BehaviorScript 29 - FE05_BC_OOG.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Eye blink animation; pMem is read at Start (the body script may have changed the member).
export class FE05_BC_OOG extends LingoScript {
  static scriptName = 'FE05_BC_OOG';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM05.dxr #29 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pSequenceList = [[1, 2, 2, 0], [2, 2, 2, 2, 0], [1, 2, 0], [1, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM05.dxr #29 on exitFrame me
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
          this.pFH = random(18);
          this.pFR = 0;
          this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pFrameCount = count(this.pSequence);
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM05.dxr #29 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM05.dxr #29 on Start me
  Start()        {
    this.pFS = 1;
    this.pFR = 1;
    this.pFH = random(18);
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
    this.pMem = sprite(this.pSprite).memberNum;
  }
}
