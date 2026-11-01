// GM03.dxr ParentScript 18 - RandomIndexUnit (decomp/GM03/scripts/ParentScript 18 - RandomIndexUnit.ls)
import { add, count, deleteAt, duplicate, eq, getAt, getLast, getPos, ilk, random, setAt, symbol, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Callers use `add(obj, label, n)` / `get(obj, label)`; inside, `add(pLabel_List, ...)` is the
// list builtin (the first argument is a list, not this script).
export class RandomIndexUnit extends LingoScript {
  static scriptName = 'RandomIndexUnit';
  pLabel_List        = VOID; pIndex_List        = VOID; pSize_List        = VOID; pData_List        = VOID;

  // GM03.dxr #18 on new me
  new()        {
    this.pLabel_List = [];
    this.pIndex_List = [];
    this.pSize_List = [];
    this.pData_List = [];
    return this;
  }

  // GM03.dxr #18 on add me, wLabel, wCount
  add(wLabel       , wCount       )        {
    if (eq(ilk(wLabel), sym('string'))) {
      wLabel = symbol(wLabel);
    }
    add(this.pLabel_List, wLabel);
    add(this.pIndex_List, 1);
    add(this.pSize_List, wCount);
    const myLST1          = [];
    for (let i = 1, n = wCount; i <= n; i++) {
      add(myLST1, i);
    }
    add(this.pData_List, this.shuffle(myLST1));
  }

  // GM03.dxr #18 on get me, wLabel
  get(wLabel       )        {
    if (eq(ilk(wLabel), sym('string'))) {
      wLabel = symbol(wLabel);
    }
    const myPos = getPos(this.pLabel_List, wLabel);
    const myIndex = getAt(this.pIndex_List, myPos);
    const mySize = getAt(this.pSize_List, myPos);
    let myData = getAt(this.pData_List, myPos);
    if (eq(myIndex, 1)) {
      myData = this.shuffle(myData);
      setAt(this.pData_List, myPos, myData);
    }
    if (eq(myIndex, mySize)) {
      setAt(this.pIndex_List, myPos, 1);
    } else {
      setAt(this.pIndex_List, myPos, myIndex + 1);
    }
    return getAt(myData, myIndex);
  }

  // GM03.dxr #18 on shuffle me, wList
  // `getLast(wList, 1)`: the extra argument is ignored by the builtin.
  shuffle(wList       )        {
    const myLST1          = [];
    const myLST2 = duplicate(wList);
    let myC = count(myLST2);
    while (truthy(myC)) {
      const myIndex = random(myC);
      add(myLST1, getAt(myLST2, myIndex));
      deleteAt(myLST2, myIndex);
      myC = count(myLST2);
    }
    if (eq(getLast(wList), getAt(myLST1, 1))) {
      deleteAt(myLST1, 1);
      add(myLST1, getLast(wList));
    }
    return myLST1;
  }
}
