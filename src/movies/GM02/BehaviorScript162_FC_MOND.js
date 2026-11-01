// GM02.dxr BehaviorScript 162 - FC_MOND (decomp/GM02/scripts/BehaviorScript 162 - FC_MOND.ls)
import { sendSprite, sprite } from '../../runtime/api.js';
import { count, eq, getAt, gt, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Mouth (talk) animation of a bottle-holding character.
export class FC_MOND extends LingoScript {
  static scriptName = 'FC_MOND';
  pSprite        = VOID; pFS        = VOID; pFrame        = VOID; pMem        = VOID; pHold        = VOID;
  pSequenceList        = VOID; pSequenceCount        = VOID; pSequence        = VOID; pFrameCount        = VOID;

  // GM02.dxr #162 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pSequenceList = [[2, 1, 0], [1, 0], [2, 0]];
    this.pSequenceCount = count(this.pSequenceList);
    sendSprite(0, sym('addChannel'), sym('FCMOND'), this.pSprite);
  }

  // GM02.dxr #162 on exitFrame me
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

  // GM02.dxr #162 on setMem me
  setMem()        {
    this.pMem = sprite(this.pSprite).memberNum;
  }

  // GM02.dxr #162 on stop me
  stop()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM02.dxr #162 on open me
  open()        {
    this.pFS = 0;
    sprite(this.pSprite).memberNum = this.pMem + random(2);
  }

  // GM02.dxr #162 on Talk me
  Talk()        {
    this.pFS = 1;
    this.pFrame = 1;
    this.pSequence = getAt(this.pSequenceList, random(this.pSequenceCount));
    this.pFrameCount = count(this.pSequence);
  }
}
