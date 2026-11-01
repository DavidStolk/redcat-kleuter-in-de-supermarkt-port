// GM02.dxr BehaviorScript 241 - BC_BODY (decomp/GM02/scripts/BehaviorScript 241 - BC_BODY.ls)
import { dsNewSound, dsPlay, dsSetVolume, G, member, sendSprite, sprite } from '../../runtime/api.js';
import { cat, eq, getAt, getLast, getaProp, gt, plus, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// Word-speaking character ("BC": #RC, #BR or #MX) next to the LetterBak.
export class BC_BODY extends LingoScript {
  static scriptName = 'BC_BODY';
  pFS        = VOID; pFR        = VOID; pFH        = VOID; pChannels        = VOID; pSprite        = VOID;
  pMem        = VOID; pLocH        = VOID; pLocV        = VOID; pC_Mem        = VOID; pSND_WalkOut1        = VOID;
  pSND_WalkOut2        = VOID; pSND_WalkIn        = VOID; pSND_Path        = VOID; pSND_Volume        = VOID;
  pLB_Channel        = VOID;

  // GM02.dxr #241 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pChannels = plus([0, 2, 3, 4], this.pSprite);
    this.pSND_Path = getaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'));
    this.pSND_Volume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    sendSprite(0, sym('addChannel'), sym('BC'), this.pSprite);
  }

  // GM02.dxr #241 on exitFrame me
  exitFrame()        {
    let myChannel       ;
    if (!truthy(this.pFS)) {
      return;
    } else {
      if (eq(this.pFS, 1)) {
        if (gt(this.pFH, 0)) {
          this.pFH = this.pFH - 1;
          return;
        }
        if (eq(this.pFR, 1)) {
          dsPlay(this.pSND_WalkIn);
          myChannel = getAt(this.pChannels, 1);
          sprite(myChannel).memberNum = this.pMem + 3;
          sprite(myChannel).locH = this.pLocH;
        } else {
          if (eq(this.pFR, 2)) {
            myChannel = getAt(this.pChannels, 1);
            sprite(myChannel).memberNum = this.pMem + 4;
            myChannel = getAt(this.pChannels, 2);
            sprite(myChannel).memberNum = this.pMem + 5;
            sprite(myChannel).locH = this.pLocH;
            sprite(this.pSprite + 1).memberNum = this.pC_Mem;
            sprite(this.pSprite + 1).locV = this.pLocV;
            sprite(this.pSprite + 1).locH = this.pLocH;
            this.pFH = 3;
          } else {
            if (eq(this.pFR, 3)) {
              myChannel = getAt(this.pChannels, 1);
              sprite(myChannel).memberNum = this.pMem + 4;
              myChannel = getAt(this.pChannels, 2);
              sprite(myChannel).memberNum = this.pMem + 7;
              myChannel = getAt(this.pChannels, 3);
              sprite(myChannel).memberNum = this.pMem + 8;
              sprite(myChannel).locH = this.pLocH;
              myChannel = getAt(this.pChannels, 4);
              sprite(myChannel).memberNum = this.pMem + 11;
              sprite(myChannel).locH = this.pLocH;
              sendSprite(getLast(this.pChannels), sym('Start'));
              this.pFS = 0;
              sendSprite(getAt(this.pChannels, 3), sym('setMem'));
              sendSprite(0, sym('EventDone'));
              return;
            }
          }
        }
      } else {
        if (eq(this.pFS, 2)) {
          if (gt(this.pFH, 0)) {
            this.pFH = this.pFH - 1;
            return;
          }
          if (eq(this.pFR, 1)) {
            dsPlay(this.pSND_WalkOut1);
            myChannel = getAt(this.pChannels, 2);
            sprite(myChannel).memberNum = this.pMem + 6;
            myChannel = getAt(this.pChannels, 3);
            sprite(myChannel).locH = -400;
            myChannel = getAt(this.pChannels, 4);
            sprite(myChannel).locH = -400;
            this.pFH = 3;
          } else {
            if (eq(this.pFR, 2)) {
              dsPlay(this.pSND_WalkOut2);
              sprite(this.pSprite + 1).locV = -200;
              sprite(this.pSprite + 1).locH = -200;
              myChannel = getAt(this.pChannels, 1);
              sprite(myChannel).memberNum = this.pMem + 3;
              myChannel = getAt(this.pChannels, 2);
              sprite(myChannel).memberNum = this.pMem + 1;
            } else {
              if (eq(this.pFR, 3)) {
                myChannel = getAt(this.pChannels, 1);
                sprite(myChannel).memberNum = this.pMem + 2;
                myChannel = getAt(this.pChannels, 2);
                sprite(myChannel).locH = -400;
              } else {
                if (eq(this.pFR, 4)) {
                  myChannel = getAt(this.pChannels, 1);
                  sprite(myChannel).locH = -400;
                  this.pFS = 0;
                  sendSprite(0, sym('EventDone'));
                  return;
                }
              }
            }
          }
        }
      }
    }
    this.pFR = this.pFR + 1;
  }

  // GM02.dxr #241 on WalkIn me
  WalkIn()        {
    this.pFS = 1;
    this.pFH = 0;
    this.pFR = 1;
  }

  // GM02.dxr #241 on WalkOut me
  WalkOut()        {
    sendSprite(getLast(this.pChannels), sym('stop'));
    this.pFS = 2;
    this.pFR = 1;
    this.pFH = 0;
  }

  // GM02.dxr #241 on halt me
  halt()        {
    this.pFS = 0;
    sendSprite(getAt(this.pChannels, 3), sym('stop'));
    sendSprite(getLast(this.pChannels), sym('stop'));
  }

  // GM02.dxr #241 on setData me, wCharacter, wMem
  setData(wCharacter       , wMem       )        {
    this.pC_Mem = wMem;
    this.pSND_WalkIn = dsNewSound(cat(this.pSND_Path, wCharacter, 'ZF_01.wav'), 0);
    this.pSND_WalkOut1 = dsNewSound(cat(this.pSND_Path, wCharacter, 'ZF_02.wav'), 0);
    this.pSND_WalkOut2 = dsNewSound(cat(this.pSND_Path, wCharacter, 'ZF_03.wav'), 0);
    dsSetVolume(this.pSND_WalkIn, this.pSND_Volume);
    dsSetVolume(this.pSND_WalkOut1, this.pSND_Volume);
    dsSetVolume(this.pSND_WalkOut2, this.pSND_Volume);
    if (eq(wCharacter, sym('RC'))) {
      this.pLocH = 210;
      this.pLocV = 156;
      this.pMem = member('MIDX_FE02_BRDRC').memberNum;
    } else {
      if (eq(wCharacter, sym('BR'))) {
        this.pLocH = 240;
        this.pLocV = 121;
        this.pMem = member('MIDX_FE02_BRDBR').memberNum;
      } else {
        if (eq(wCharacter, sym('MX'))) {
          this.pLocH = 240;
          this.pLocV = 167;
          this.pMem = member('MIDX_FE02_BRDMX').memberNum;
        }
      }
    }
    for (const myChannel of this.pChannels.slice()) {
      sprite(myChannel).locV = this.pLocV;
    }
  }

  // GM02.dxr #241 on setLB_Channel me, wChannel
  setLB_Channel(wChannel       )        {
    this.pLB_Channel = wChannel;
  }

  // GM02.dxr #241 on c me
  c()        {
    sendSprite(this.pLB_Channel, sym('hilite'));
  }

  // GM02.dxr #241 on MX me
  MX()        {
    sendSprite(getAt(this.pChannels, 3), sym('stop'));
  }

  // GM02.dxr #241 on M1 me
  M1()        {
    sendSprite(getAt(this.pChannels, 3), sym('open'));
  }

  // GM02.dxr #241 on M2 me
  M2()        {
    sendSprite(getAt(this.pChannels, 3), sym('Talk'));
  }
}
