// GM05.dxr MovieScript 13 - Handlers (decomp/GM05/scripts/MovieScript 13 - Handlers.ls)
// Identical script text in GM05 #13.
import { add, charOf, count, deleteAt, deleteOne, duplicate, eq, getAt, getPropAt, ilk, length, numToChar, propList, random, setaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript13_Handlers              = {
  // GM05.dxr #13 on getLetterList wString
  getLetterList(wString       ) {
    const myLST        = [];
    const myC = length(wString);
    for (let i = 1; i <= myC; i++) {
      add(myLST, charOf(wString, i));
    }
    return myLST;
  },

  // GM05.dxr #13 on getLetterListNotInWord wList
  getLetterListNotInWord(wList       ) {
    const myLST        = [];
    for (let i = 65; i <= 90; i++) {
      add(myLST, numToChar(i));
    }
    for (const i of wList.slice()) {
      deleteOne(myLST, i);
    }
    return myLST;
  },

  // GM05.dxr #13 on ShuffleList wList
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
