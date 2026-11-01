// GM02.dxr ParentScript 21 - Class_Cursor (decomp/GM02/scripts/ParentScript 21 - Class_Cursor.ls)
import { sprite } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Class_Cursor extends LingoScript {
  static scriptName = 'Class_Cursor';
  pSprite        = VOID; pMem        = VOID;

  // GM02.dxr #21 on new me
  new()        {
    this.pSprite = 119;
    this.pMem = sprite(this.pSprite).memberNum;
    return this;
  }

  // GM02.dxr #21 on setState_Default me
  setState_Default()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM02.dxr #21 on setState_Active me
  setState_Active()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // GM02.dxr #21 on setState_Select me
  setState_Select()        {
    sprite(this.pSprite).memberNum = this.pMem + 2;
  }
}
