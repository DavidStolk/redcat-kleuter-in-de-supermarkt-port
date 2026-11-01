// GM02.dxr MovieScript 14 - List_Handlers (decomp/GM02/scripts/MovieScript 14 - List_Handlers.ls)
import { add, count, deleteAt, duplicate, eq, getAt, getPropAt, ilk, propList, random, setaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript14_List_Handlers              = {
  // GM02.dxr #14 on ShuffleList wList
  // The property-list branch duplicates `wPropList`, a name that is not a parameter (VOID in the
  // original); kept as is.
  ShuffleList(wList       ) {
    const myFirstVal = getAt(wList, 1);
    let myLST1       ;
    if (eq(ilk(wList), sym('propList'))) {
      myLST1 = propList();
      const wPropList        = VOID;
      const myLST2 = duplicate(wPropList);
      let myC = count(myLST2);
      while (truthy(myC)) {
        const myIndex = random(myC);
        setaProp(myLST1, getPropAt(myLST2, myIndex), getAt(myLST2, myIndex));
        deleteAt(myLST2, myIndex);
        myC = count(myLST2);
      }
    } else {
      myLST1 = [];
      const myLST2 = duplicate(wList);
      let myC = count(myLST2);
      while (truthy(myC)) {
        const myIndex = random(myC);
        add(myLST1, getAt(myLST2, myIndex));
        deleteAt(myLST2, myIndex);
        myC = count(myLST2);
      }
    }
    if (eq(myFirstVal, getAt(myLST1, 1))) {
      deleteAt(myLST1, 1);
      add(myLST1, myFirstVal);
    }
    return myLST1;
  },
};
