// INTRO.dxr BehaviorScript 122 (decomp/INTRO/scripts/BehaviorScript 122.ls)
import { call, go, scriptObject, the } from '../../runtime/api.js';
import { getaProp, propList, setaProp, string, sym, symbolp, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class BehaviorScript122 extends LingoScript {
  static scriptName = '';
  pMouseDown_Flag        = VOID; pCueList        = VOID;

  // INTRO.dxr #122 on beginSprite me
  beginSprite()        {
    this.pCueList = propList();
    setaProp(this.pCueList, 13, sym('Rintr_01'));
    setaProp(this.pCueList, 91, sym('BRZF_01'));
    setaProp(this.pCueList, 95, sym('Rintr_02'));
    setaProp(this.pCueList, 150, sym('Mintr_01'));
    setaProp(this.pCueList, 205, sym('Bintr_001'));
    setaProp(this.pCueList, 240, sym('Mintr_02'));
    setaProp(this.pCueList, 278, sym('Bintr_002'));
    setaProp(this.pCueList, 295, sym('Mintr_03'));
    setaProp(this.pCueList, 352, sym('BRZF_02'));
    setaProp(this.pCueList, 356, sym('BRZF_03'));
    setaProp(this.pCueList, 374, sym('Rintr_03'));
    setaProp(this.pCueList, 484, sym('RCZF_03'));
    setaProp(this.pCueList, 509, sym('Rintr_04'));
    setaProp(this.pCueList, 582, sym('RCZF_02'));
    setaProp(this.pCueList, 624, sym('RCZF_02'));
    setaProp(this.pCueList, 663, sym('Mintr_04'));
    setaProp(this.pCueList, 735, sym('Bintr_003'));
    setaProp(this.pCueList, 855, sym('Rintr_05'));
    setaProp(this.pCueList, 862, sym('MXZF_01'));
    setaProp(this.pCueList, 874, sym('BRZF_02'));
    setaProp(this.pCueList, 878, sym('BRZF_03'));
    setaProp(this.pCueList, 883, sym('MXZF_01'));
    setaProp(this.pCueList, 936, sym('Rintr_06'));
    setaProp(this.pCueList, 947, sym('MXZF_01'));
    setaProp(this.pCueList, 982, sym('RCZF_03'));
    setaProp(this.pCueList, 992, sym('MXZF_01'));
    this.pMouseDown_Flag = 0;
  }

  // INTRO.dxr #122 on exitFrame me
  // `play frame script string(myCue)` is the bytecode `play(script(string(myCue)))`: the call goes
  // to the cue script's own `play` handler (lingo_usage.md).
  exitFrame()        {
    const myCue = getaProp(this.pCueList, the.frame + 1);
    if (truthy(symbolp(myCue))) {
      call(sym('play'), scriptObject(string(myCue)));
    }
  }

  // INTRO.dxr #122 on idle me
  idle()        {
    if (!truthy(this.pMouseDown_Flag)) {
      if (truthy(the.mouseDown)) {
        this.pMouseDown_Flag = 1;
        go(1, 'MENU');
      }
    }
  }
}
