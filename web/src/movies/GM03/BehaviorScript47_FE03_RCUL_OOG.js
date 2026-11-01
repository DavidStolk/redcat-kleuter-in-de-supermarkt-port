// GM03.dxr BehaviorScript 47 - FE03_RCUL_OOG (decomp/GM03/scripts/BehaviorScript 47 - FE03_RCUL_OOG.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Eye blink animation (hold counter is pHold).
export class FE03_RCUL_OOG extends LingoScript {
  static scriptName = 'FE03_RCUL_OOG';
  pSprite        = VOID; pFS        = VOID; pFrame        = VOID; pMem        = VOID; pHold        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM03.dxr #47 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pSequenceList = [[1, 2, 2, 2, 2, 0], [1, 2, 0], [2, 2, 2, 2, 1, 0], [1, 1, 2, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM03.dxr #47 on exitFrame me
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
          this.pHold = random(18);
          this.pFrame = 0;
          this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pFrameCount = count(this.pSequence);
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM03.dxr #47 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM03.dxr #47 on Start me
  Start()        {
    this.pFS = 1;
    this.pHold = random(18);
    this.pFrame = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
