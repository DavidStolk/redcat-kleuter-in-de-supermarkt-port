// GM01.dxr MovieScript 22 - Handlers (decomp/GM01/scripts/MovieScript 22 - Handlers.ls)
import {
  add, addAt, cat, catSp, charOf, count, deleteAt, deleteChar, div, duplicate, eq, getAt, getPropAt, gt, ilk,
  propList, random, setaProp, string, sym, truthy, VOID, wordOf,            
} from '../../runtime/lingo.js';
import { member, put, sprite } from '../../runtime/api.js';
                                                            

export const MovieScript22_Handlers              = {
  // GM01.dxr #22 on getScriptName wScript
  // `delete char -30000 of myName` (decompiled form of "delete the last char") is ported as deleting the
  // last character. Debug helper, never called in the game.
  getScriptName(wScript       ) {
    let myName        = wordOf(string(wScript), 2);
    myName = deleteChar(myName, 1);
    myName = deleteChar(myName, string(myName).length); // TODO(faithful): `delete char -30000 of myName` semantics unverified
    if (!(eq(charOf(string(wScript), 1), '<'))) {
      myName = deleteChar(myName, string(myName).length); // TODO(faithful): same as above
    }
    return myName;
  },

  // GM01.dxr #22 on showBehaviors
  showBehaviors() {
    for (let i = 1; i <= 120; i++) {
      const myMem = sprite(i).scriptNum;
      const myCast = sprite(i).castLibNum;
      if (gt(myMem, 0)) {
        put(catSp(cat('S:', i), cat('M:', myMem), cat('C:', myCast), cat('N:', member(myMem, myCast).name)));
      }
    }
  },

  // GM01.dxr #22 on makeRandomList_1 wCount
  makeRandomList_1(wCount       ) {
    const c = div(wCount, 2);
    const L          = [];
    for (let i = 1, n = c; i <= n; i++) {
      add(L, i);
      add(L, i);
    }
    for (let i = 1, n = c; i <= n; i++) {
      addAt(L, random(i), i);
    }
    for (let i = 1, n = c; i <= n; i++) {
      addAt(L, random(i), i);
    }
    return L;
  },

  // GM01.dxr #22 on ShuffleList wList
  // The property-list branch duplicates `wPropList`, a name that is not a parameter (VOID in the
  // original); kept as is.
  ShuffleList(wList       ) {
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
    return myLST1;
  },
};
