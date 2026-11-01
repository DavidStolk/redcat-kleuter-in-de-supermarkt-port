// GM03.dxr ParentScript 12 - Class_Cursor (decomp/GM03/scripts/ParentScript 12 - Class_Cursor.ls)
import { sprite } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Class_Cursor extends LingoScript {
  static scriptName = 'Class_Cursor';
  pSprite        = VOID; pMem        = VOID;

  // GM03.dxr #12 on new me
  new()        {
    this.pSprite = 119;
    this.pMem = sprite(this.pSprite).memberNum;
    return this;
  }

  // GM03.dxr #12 on setState_Default me
  setState_Default()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // GM03.dxr #12 on setState_Active me
  setState_Active()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // GM03.dxr #12 on setState_Select me
  setState_Select()        {
    sprite(this.pSprite).memberNum = this.pMem + 2;
  }
}
