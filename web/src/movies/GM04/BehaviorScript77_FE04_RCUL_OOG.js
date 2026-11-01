// GM04.dxr BehaviorScript 77 - FE04_RCUL_OOG (decomp/GM04/scripts/BehaviorScript 77 - FE04_RCUL_OOG.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Eye blink animation of Redcat (identical script text in GM04 #77).
export class FE04_RCUL_OOG extends LingoScript {
  static scriptName = 'FE04_RCUL_OOG';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pSprite        = VOID; pMem        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM04.dxr #77 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pSequenceList = [[1, 2, 2, 2, 2, 0], [1, 3, 3, 2, 2, 2, 2, 0], [1, 2, 2, 2, 2, 2, 0], [1, 1, 1, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM04.dxr #77 on exitFrame me
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

  // GM04.dxr #77 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM04.dxr #77 on Start me
  Start()        {
    this.pFS = 1;
    this.pFH = random(18);
    this.pFR = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
