// GM03.dxr MovieScript 14 - circulerFunctions (decomp/GM03/scripts/MovieScript 14 - circulerFunctions.ls)
import { add, count, atan, cos, deleteAt, div, duplicate, eq, float, getAt, getPropAt, gteq, ilk, integer, lt, lteq, max, min, neq, pi, point, power, propList, random, setaProp, sin, sqrt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript14_circulerFunctions              = {
  // GM03.dxr #14 on ShuffleList wList
  // The property-list branch duplicates `wPropList`, a name that is not a parameter (VOID in the
  // original); kept as is. This handler comes first in cast order, so it is the one that runs
  // (MovieScript 17 has a handler of the same name).
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

  // GM03.dxr #14 on getNextPoint wP1, wP2, wNextDist
  getNextPoint(wP1       , wP2       , wNextDist       ) {
    const myP1V = wP1.locV;
    const myP1H = wP1.locH;
    const myP2V = wP2.locV;
    const myP2H = wP2.locH;
    const X = myP2H - myP1H;
    const Y = myP2V - myP1V;
    let angle       ;
    if (eq(Y, 0)) {
      angle = atan(float(X)) * -180 / pi;
    } else {
      angle = atan(div(float(X), Y)) * -180 / pi;
    }
    if (gteq(Y, 0) && gteq(X, 0)) {
      angle = integer(180 + angle);
    } else {
      if (lt(X, 0) && gteq(Y, 0)) {
        angle = integer(180 + angle);
      } else {
        if (lt(Y, 0) && lt(X, 0)) {
          angle = integer(360 + angle);
        } else {
          angle = integer(angle);
        }
      }
    }
    angle = angle - 90;
    if (lt(angle, 0)) {
      angle = 360 + angle;
    }
    if (eq(angle, 360)) {
      angle = 0;
    }
    const myDist = sqrt(power(max(myP1H, myP2H) - min(myP1H, myP2H), 2) + power(max(myP1V, myP2V) - min(myP1V, myP2V), 2));
    let nextP       ;
    if (lteq(myDist, wNextDist)) {
      nextP = wP2;
    } else {
      nextP = point(myP1H + (cos(angle * pi / 180) * wNextDist), myP1V + (sin(angle * pi / 180) * wNextDist));
    }
    return nextP;
  },
};
