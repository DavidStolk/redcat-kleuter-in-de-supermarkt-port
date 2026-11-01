// GM03.dxr BehaviorScript 54 - FE03_EC_OOG (decomp/GM03/scripts/BehaviorScript 54 - FE03_EC_OOG.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Eye blink animation (identical script text in several members/movies: tools/clone_ports.py).
export class FE03_EC_OOG extends LingoScript {
  static scriptName = 'FE03_EC_OOG';
  pSprite        = VOID; pFS        = VOID; pFrame        = VOID; pMem        = VOID; pFH        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM03.dxr #54 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pSequenceList = [[1, 2, 2, 2, 2, 0], [1, 2, 0], [2, 2, 2, 2, 1, 0], [1, 1, 1, 0]];
    this.pSequenceCount = count(this.pSequenceList);
  }

  // GM03.dxr #54 on exitFrame me
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
          this.pFH = random(18);
          this.pFrame = 0;
          this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pFrameCount = count(this.pSequence);
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM03.dxr #54 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM03.dxr #54 on Start me
  Start()        {
    this.pFS = 1;
    this.pFH = random(18);
    this.pFrame = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
