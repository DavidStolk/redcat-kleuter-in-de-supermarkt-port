// GM03.dxr BehaviorScript 43 - FE03_KASSA (decomp/GM03/scripts/BehaviorScript 43 - FE03_KASSA.ls)
import { member, sendSprite, sprite } from '../../runtime/api.js';
import { add, count, duplicate, eq, getAt, plus, random, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class FE03_KASSA extends LingoScript {
  static scriptName = 'FE03_KASSA';
  pFS        = VOID; pFrame        = VOID; pLocH        = VOID; pMemList        = VOID; pChannels        = VOID;
  pBTN_Channels        = VOID; pBTN_UP_MemList        = VOID; pBTN_DN_MemList        = VOID; pBTN_Count        = VOID;
  pBTN_Index        = VOID;

  // GM03.dxr #43 on beginSprite me
  beginSprite()        {
    const mySprite = this.spriteNum;
    const myMem = member('MIDX_FE03_KASSA_BTN').memberNum;
    this.pLocH = sprite(mySprite + 1).locH;
    this.pChannels = [];
    for (let i = 1; i <= 9; i++) {
      const myChannel = mySprite + i;
      add(this.pChannels, myChannel);
      sprite(myChannel).locH = -200;
    }
    this.pMemList = plus([31, 19, 1], myMem);
    this.pFS = 0;
    sendSprite(0, sym('addChannel'), sym('Kassa'), mySprite);
  }

  // GM03.dxr #43 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (eq(this.pFrame, 1)) {
          this.pFrame = 2;
          this.pBTN_Index = random(this.pBTN_Count);
          sprite(getAt(this.pBTN_Channels, this.pBTN_Index)).memberNum = getAt(this.pBTN_DN_MemList, this.pBTN_Index);
        } else {
          if (eq(this.pFrame, 2)) {
            this.pFrame = 1;
            sprite(getAt(this.pBTN_Channels, this.pBTN_Index)).memberNum = getAt(this.pBTN_UP_MemList, this.pBTN_Index);
          }
        }
      }
    }
  }

  // GM03.dxr #43 on display me, wLevel
  display(wLevel       )        {
    this.pBTN_Channels = [];
    this.pBTN_UP_MemList = [];
    this.pBTN_DN_MemList = [];
    const myC = wLevel * 3;
    for (let i = 1; i <= myC; i++) {
      const myChannel = getAt(this.pChannels, i);
      const myMem = getAt(this.pMemList, wLevel) + ((i - 1) * 2);
      add(this.pBTN_Channels, myChannel);
      sprite(myChannel).locH = this.pLocH;
      sprite(myChannel).memberNum = myMem;
      add(this.pBTN_UP_MemList, myMem);
    }
    this.pBTN_DN_MemList = duplicate(this.pBTN_UP_MemList);
    this.pBTN_DN_MemList = plus(this.pBTN_DN_MemList, 1);
    this.pBTN_Count = count(this.pBTN_Channels);
  }

  // GM03.dxr #43 on startflash me
  startflash()        {
    this.pFS = 1;
    this.pFrame = 1;
  }

  // GM03.dxr #43 on stopFlash me
  stopFlash()        {
    this.pFS = 0;
    let i = 1;
    for (const myChannel of this.pBTN_Channels.slice()) {
      sprite(myChannel).memberNum = getAt(this.pBTN_UP_MemList, i);
      i = i + 1;
    }
  }
}
