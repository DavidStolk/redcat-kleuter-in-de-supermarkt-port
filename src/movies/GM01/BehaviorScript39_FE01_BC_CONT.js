// GM01.dxr BehaviorScript 39 - FE01_BC_CONT (decomp/GM01/scripts/BehaviorScript 39 - FE01_BC_CONT.ls)
import { member, sendSprite, sprite } from '../../runtime/api.js';
import { add, count, eq, getAt, gt, plus, sym, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE01_BC_CONT extends LingoScript {
  static scriptName = 'FE01_BC_CONT';
  pSprite        = VOID; pLoc        = VOID; pNofSprites        = VOID; pData        = VOID; pFrameList        = VOID;
  pFrameIndex        = VOID; pFrameCount        = VOID; pTopChannel        = VOID;

  // GM01.dxr #39 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pTopChannel = this.pSprite + 5;
    sendSprite(0, sym('addChannel'), sym('CONT'), this.pSprite);
  }

  // GM01.dxr #39 on update me
  update()        {
    if (gt(this.pFrameIndex, this.pFrameCount)) {
      this.hide();
      return;
    }
    const myMemList = getAt(this.pFrameList, this.pFrameIndex);
    let i = this.pSprite;
    for (const myMem of (myMemList           ).slice()) {
      sprite(i).loc = this.pLoc;
      sprite(i).memberNum = myMem;
      i = i + 1;
    }
    for (let Y = i, n = this.pTopChannel; Y <= n; Y++) {
      sprite(Y).locH = -1000;
    }
    this.pFrameIndex = this.pFrameIndex + 1;
  }

  // GM01.dxr #39 on hide me
  hide()        {
    for (let s = this.pSprite, n = this.pTopChannel; s <= n; s++) {
      sprite(s).locH = -1000;
    }
  }

  // GM01.dxr #39 on setAnim me, wIndex
  setAnim(wIndex       )        {
    this.pFrameList = getAt(this.pData, wIndex);
    this.pFrameIndex = 1;
    this.pFrameCount = count(this.pFrameList);
  }

  // GM01.dxr #39 on setLoc me, wLoc
  setLoc(wLoc       )        {
    this.pLoc = wLoc;
  }

  // GM01.dxr #39 on setData me, wType
  setData(wType       )        {
    this.pData = [];
    const myMem = member('MIDX_FE01_BCCONTENT').memberNum;
    if (eq(wType, 1)) {
      add(this.pData, [[15]]);
      add(this.pData, [[18]]);
      add(this.pData, [[21]]);
      add(this.pData, [[14], [14, 16]]);
      add(this.pData, [[17], [17, 19]]);
      add(this.pData, [[20], [20, 22]]);
    } else {
      if (eq(wType, 2)) {
        add(this.pData, [[18]]);
        add(this.pData, [[21]]);
        add(this.pData, [[17], [17, 19]]);
        add(this.pData, [[20], [20, 22]]);
        add(this.pData, [[17], [17, 18], [17, 18, 19]]);
        add(this.pData, [[20], [20, 21], [20, 21, 22]]);
      } else {
        if (eq(wType, 3)) {
          add(this.pData, [[10], [1]]);
          add(this.pData, [[9], [9, 11], [2]]);
          add(this.pData, [[9], [9, 10], [9, 10, 11], [3]]);
          add(this.pData, [[7], [7, 11], [7, 11, 13], [7, 11, 13, 9], [4]]);
          add(this.pData, [[7], [7, 11], [7, 11, 13], [7, 11, 13, 9], [7, 11, 13, 9, 10], [5]]);
          add(this.pData, [[7], [7, 8], [7, 8, 9], [7, 8, 9, 11], [7, 8, 9, 11, 12], [7, 8, 9, 11, 12, 13], [6]]);
        }
      }
    }
    this.pData = plus(this.pData, myMem);
  }
}
