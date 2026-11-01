// GM02.dxr BehaviorScript 91 - LetterBak_Main (decomp/GM02/scripts/BehaviorScript 91 - LetterBak_Main.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { add, cat, charToNum, count, eq, getAt, getPos, getaProp, gt, neq, random, setAt, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// The letter board ("LetterBak"): pMaxLetters (11) slots, each made of three sprites:
// background (pBakChannel + n), bottle (pFlesChannel + n) and letter (pLetterChannel + n).
export class LetterBak_Main extends LingoScript {
  static scriptName = 'LetterBak_Main';
  pSprite        = VOID; pSND_1        = VOID; pSND_2        = VOID; pFS        = VOID; pFrame        = VOID;
  pFrameCount        = VOID; pSND_Letter        = VOID; pFrameHold        = VOID; pMaxLetters        = VOID;
  pNofLetters        = VOID; pAlfabetList        = VOID; pWordSize        = VOID; pWolkMem        = VOID;
  pBakChannel        = VOID; pFlesChannel        = VOID; pLetterChannel        = VOID; pFlesMem        = VOID;
  pLetterMem        = VOID; pString        = VOID; pBakMemList        = VOID; pBakPosList        = VOID;
  pFlesPosList        = VOID; pSND_LBNW        = VOID; pLetterPosList        = VOID; pLetterList        = VOID;
  pLetterCount        = VOID; pPlaceList        = VOID; pHiLite_Index        = VOID; pHiLite_Flag        = VOID;

  // GM02.dxr #91 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMaxLetters = 11;
    this.pWolkMem = member('LetterBakWolk').memberNum;
    this.pBakChannel = this.pSprite;
    this.pFlesChannel = this.pSprite + this.pMaxLetters;
    this.pLetterChannel = this.pFlesChannel + this.pMaxLetters;
    this.pFlesMem = sprite(this.pFlesChannel).memberNum;
    this.pLetterMem = sprite(this.pLetterChannel).memberNum;
    this.pBakMemList = [];
    this.pBakPosList = [];
    let myC = this.pBakChannel + this.pMaxLetters - 1;
    for (let myChannel = this.pBakChannel; myChannel <= myC; myChannel++) {
      add(this.pBakMemList, sprite(myChannel).memberNum);
      add(this.pBakPosList, sprite(myChannel).loc);
      sprite(myChannel).locH = -100;
    }
    this.pFlesPosList = [];
    myC = this.pFlesChannel + this.pMaxLetters - 1;
    for (let myChannel = this.pFlesChannel; myChannel <= myC; myChannel++) {
      add(this.pFlesPosList, sprite(myChannel).loc);
      sprite(myChannel).locH = -100;
    }
    this.pLetterPosList = [];
    myC = this.pLetterChannel + this.pMaxLetters - 1;
    for (let myChannel = this.pLetterChannel; myChannel <= myC; myChannel++) {
      add(this.pLetterPosList, sprite(myChannel).loc);
      sprite(myChannel).locH = -100;
    }
    this.pFS = 0;
    const myPath = getaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'));
    const myVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pSND_LBNW = dsNewSound(cat(myPath, 'LBNW.wav'), 0);
    dsSetVolume(this.pSND_LBNW, myVolume);
    this.hide();
    sendSprite(0, sym('addChannel'), sym('LB'), this.pSprite);
  }

  // GM02.dxr #91 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        dsPlay(this.pSND_LBNW);
        for (let i = 1, n = this.pLetterCount; i <= n; i++) {
          sprite(this.pBakChannel + i - 1).memberNum = getAt(this.pBakMemList, i);
          sprite(this.pBakChannel + i - 1).loc = getAt(this.pBakPosList, i);
          sprite(this.pFlesChannel + i - 1).loc = getAt(this.pFlesPosList, i);
          sprite(this.pFlesChannel + i - 1).memberNum = this.pFlesMem;
          sprite(this.pLetterChannel + i - 1).loc = getAt(this.pLetterPosList, i);
          sprite(this.pLetterChannel + i - 1).memberNum = this.pLetterMem + (charToNum(getAt(this.pLetterList, i)) - 65);
        }
        this.pFS = 0;
        sendSprite(0, sym('EventDone'));
        return;
      } else {
        if (eq(this.pFS, 2)) {
          if (eq(this.pFrame, 1)) {
            for (let i = 1, n = this.pLetterCount; i <= n; i++) {
              sprite(this.pBakChannel + i - 1).memberNum = this.pWolkMem + random(5) - 1;
              sprite(this.pFlesChannel + i - 1).locH = -100;
              sprite(this.pLetterChannel + i - 1).locH = -100;
            }
          } else {
            if (eq(this.pFrame, 2)) {
              for (let i = 1, n = this.pLetterCount; i <= n; i++) {
                sprite(this.pBakChannel + i - 1).memberNum = sprite(this.pBakChannel + i - 1).memberNum + 5;
              }
            } else {
              if (eq(this.pFrame, 3)) {
                for (let i = 1, n = this.pLetterCount; i <= n; i++) {
                  sprite(this.pBakChannel + i - 1).locH = -100;
                }
                this.pFS = 0;
                sendSprite(0, sym('EventDone'));
                return;
              }
            }
          }
          this.pFrame = this.pFrame + 1;
        }
      }
    }
  }

  // GM02.dxr #91 on display me
  display()        {
    this.pFrame = 1;
    this.pFS = 1;
  }

  // GM02.dxr #91 on setWord me, wList
  setWord(wList       )        {
    this.pHiLite_Index = 1;
    this.pHiLite_Flag = 1;
    this.pLetterList = wList;
    this.pLetterCount = count(this.pLetterList);
    this.pFrameCount = this.pLetterCount;
    this.pPlaceList = [];
    for (let i = 1, n = this.pLetterCount; i <= n; i++) {
      add(this.pPlaceList, 0);
    }
    const pOffsetList        = []; // not declared as a property in the original: a local
    void pOffsetList;
  }

  // GM02.dxr #91 on halt me
  halt()        {
    this.pFS = 0;
  }

  // GM02.dxr #91 on remove me
  remove()        {
    this.pFS = 2;
    this.pFrame = 1;
  }

  // GM02.dxr #91 on hide me
  hide()        {
    const c = this.pMaxLetters - 1;
    for (let i = 0; i <= c; i++) {
      sprite(this.pBakChannel + i).locH = -100;
      sprite(this.pFlesChannel + i).locH = -100;
      sprite(this.pLetterChannel + i).locH = -100;
    }
  }

  // GM02.dxr #91 on placeFles me, wLetter
  placeFles(wLetter       )        {
    if (gt(getPos(this.pLetterList, wLetter), 0)) {
      let myIndex        = 0;
      for (let i = 1, n = this.pLetterCount; i <= n; i++) {
        if (neq(getAt(this.pLetterList, i), wLetter)) {
          continue;
        }
        if (eq(getAt(this.pPlaceList, i), 1)) {
          continue;
        }
        myIndex = i;
        setAt(this.pPlaceList, myIndex, 1);
        break;
      }
      if (!truthy(myIndex)) {
      } else {
        sprite(this.pFlesChannel + myIndex - 1).memberNum = this.pFlesMem + 1;
      }
    }
  }

  // GM02.dxr #91 on hilite me
  hilite()        {
    if (eq(this.pHiLite_Flag, 1)) {
      this.pHiLite_Flag = 2;
      if (gt(this.pHiLite_Index, this.pLetterCount)) {
        for (let i = 1, n = this.pLetterCount; i <= n; i++) {
          sprite(this.pFlesChannel + i - 1).memberNum = this.pFlesMem + 2;
        }
      } else {
        sprite(this.pFlesChannel + this.pHiLite_Index - 1).memberNum = this.pFlesMem + 2;
        this.pHiLite_Index = this.pHiLite_Index + 1;
      }
    } else {
      if (eq(this.pHiLite_Flag, 2)) {
        if (gt(this.pHiLite_Index, this.pLetterCount)) {
          for (let i = 1, n = this.pLetterCount; i <= n; i++) {
            sprite(this.pFlesChannel + i - 1).memberNum = this.pFlesMem + 1;
          }
        } else {
          sprite(this.pFlesChannel + this.pHiLite_Index - 2).memberNum = this.pFlesMem + 1;
        }
        this.pHiLite_Flag = 1;
      }
    }
  }
}
