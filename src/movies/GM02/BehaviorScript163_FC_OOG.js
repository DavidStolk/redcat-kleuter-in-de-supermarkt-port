// GM02.dxr BehaviorScript 163 - FC_OOG (decomp/GM02/scripts/BehaviorScript 163 - FC_OOG.ls)
import { sprite } from '../../runtime/api.js';
import { count, eq, getAt, lteq, plus, random, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Eye animation of a bottle-holding character (member offsets per blink sequence).
export class FC_OOG extends LingoScript {
  static scriptName = 'FC_OOG';
  pSprite        = VOID; pMemList        = VOID; pMem        = VOID; pMemOffsetList        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pPlay        = VOID; pFrame        = VOID;
  pCount        = VOID;

  // GM02.dxr #163 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMemOffsetList = [[1, 2, 2, 2, 1, 0], [2, 2, 1, 0], [1, 2, 0, 0, 2, 2, 2, 1, 0], [2, 7, 7, 7, 7, 2, 2, 0], [2, 8, 8, 8, 8, 2, 2, 0]];
    this.pSequenceCount = count(this.pMemOffsetList);
  }

  // GM02.dxr #163 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pPlay)) {
      return;
    } else {
      if (eq(this.pPlay, 1)) {
        if (eq(this.pFrame, this.pCount)) {
          this.pMemList = getAt(this.pSequenceList, random(this.pSequenceCount));
          this.pCount = count(this.pMemList);
          this.pPlay = 2;
          this.pFrame = 0;
        }
      } else {
        if (lteq(this.pFrame, this.pCount)) {
          sprite(this.pSprite).memberNum = getAt(this.pMemList, this.pFrame);
        } else {
          this.pPlay = 1;
          this.pFrame = 0;
          this.pCount = 6 + random(18);
        }
      }
    }
    this.pFrame = this.pFrame + 1;
  }

  // GM02.dxr #163 on Start me
  Start()        {
    this.pMem = sprite(this.pSprite).memberNum;
    this.pSequenceList = plus(this.pMemOffsetList, this.pMem);
    this.pFrame = 1;
    this.pCount = 1;
    this.pPlay = 1;
  }

  // GM02.dxr #163 on stop me
  stop()        {
    this.pPlay = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }
}
