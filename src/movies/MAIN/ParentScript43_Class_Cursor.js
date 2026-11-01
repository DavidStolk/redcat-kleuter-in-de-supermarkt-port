// MAIN.dxr ParentScript 43 - Class_Cursor (decomp/MAIN/scripts/ParentScript 43 - Class_Cursor.ls)
import { sprite } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Class_Cursor extends LingoScript {
  static scriptName = 'Class_Cursor';
  pSprite        = VOID; pMem        = VOID;

  // MAIN.dxr #43 on new me
  new()        {
    this.pSprite = 119;
    this.pMem = sprite(this.pSprite).memberNum;
    return this;
  }

  // MAIN.dxr #43 on setState_Default me
  setState_Default()        {
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // MAIN.dxr #43 on setState_Active me
  setState_Active()        {
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // MAIN.dxr #43 on setState_Select me
  setState_Select()        {
    sprite(this.pSprite).memberNum = this.pMem + 2;
  }
}
