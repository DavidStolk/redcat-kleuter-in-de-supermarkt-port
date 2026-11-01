// MENU.dxr BehaviorScript 46 - OPT_SLD_VOICE (decomp/MENU/scripts/BehaviorScript 46 - OPT_SLD_VOICE.ls)
import { dsNewSound, dsSetLoop, dsSetPosition, dsStop, dsSetVolume, dsPlay, call, G, sendSprite, sprite, the } from '../../runtime/api.js';
import { cat, div, getAt, getaProp, getPos, count, max, min, setaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gCursor` is not declared global here: resolves to the global.
export class OPT_SLD_VOICE extends LingoScript {
  static scriptName = 'OPT_SLD_VOICE';
  pSprite        = VOID; pMem        = VOID; pLoc        = VOID; pWidth        = VOID; pVolume        = VOID;
  pSlider_Min        = VOID; pSlider_Max        = VOID; pSlider_Range        = VOID; pSlider_Step        = VOID;
  pClickFlag        = VOID; pSND_ID        = VOID; pVTabel_List        = VOID; pVTabel_Count        = VOID;

  // MENU.dxr #46 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pWidth = sprite(this.pSprite).width;
    this.pVTabel_List = getaProp(G.gAppSettings, sym('VSCALE_VOICE'));
    this.pVTabel_Count = count(this.pVTabel_List);
    this.pSlider_Min = sprite(this.pSprite - 1).left + div(this.pWidth, 2);
    this.pSlider_Max = sprite(this.pSprite - 1).right - div(this.pWidth, 2);
    this.pSlider_Range = sprite(this.pSprite - 1).width - this.pWidth;
    this.pSlider_Step = div(this.pSlider_Range, this.pVTabel_Count - 1);
    const myFile = cat(getaProp(G.gAppSettings, sym('OPT_PATH_VOICE')), 'Test.wav');
    this.pSND_ID = dsNewSound(myFile, 0);
    this.pClickFlag = 0;
    this.pVolume = getaProp(G.gAppSettings, sym('VOLUME_VOICE'));
    let myIDX = getPos(this.pVTabel_List, this.pVolume);
    if (!truthy(myIDX)) {
      myIDX = this.pVTabel_Count;
      this.pVolume = 0;
    }
    myIDX = myIDX - 1;
    dsSetLoop(this.pSND_ID, 1);
    dsSetVolume(this.pSND_ID, this.pVolume);
    sprite(this.pSprite).locH = this.pSlider_Min + (myIDX * this.pSlider_Step);
    sendSprite(0, sym('addChannel'), sym('BTN_SLD'), this.pSprite);
  }

  // MENU.dxr #46 on update me
  update()        {
    const myMouseH = the.mouseH;
    const mySlider_Pos = max(min(myMouseH, this.pSlider_Max), this.pSlider_Min);
    const myIDX = div(mySlider_Pos - this.pSlider_Min, this.pSlider_Step);
    this.pVolume = getAt(this.pVTabel_List, myIDX + 1);
    dsSetVolume(this.pSND_ID, this.pVolume);
    sprite(this.pSprite).locH = this.pSlider_Min + (myIDX * this.pSlider_Step);
  }

  // MENU.dxr #46 on mouseEnter me
  mouseEnter()        {
    call(sym('setState_Active'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // MENU.dxr #46 on mouseLeave me
  mouseLeave()        {
    if (truthy(this.pClickFlag)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // MENU.dxr #46 on mouseUp me
  mouseUp()        {
    if (truthy(this.pClickFlag)) {
      dsStop(this.pSND_ID);
      setaProp(G.gAppSettings, sym('VOLUME_VOICE'), this.pVolume);
      this.pClickFlag = 0;
      sendSprite(0, sym('stopIdleThreading'), this);
      call(sym('setState_Default'), G.gCursor);
      sprite(this.pSprite).memberNum = this.pMem;
    }
  }

  // MENU.dxr #46 on mouseUpOutSide me
  mouseUpOutSide()        {
    if (truthy(this.pClickFlag)) {
      dsStop(this.pSND_ID);
      setaProp(G.gAppSettings, sym('VOLUME_VOICE'), this.pVolume);
      this.pClickFlag = 0;
      sendSprite(0, sym('stopIdleThreading'), this);
      call(sym('setState_Default'), G.gCursor);
      sprite(this.pSprite).memberNum = this.pMem;
    }
  }

  // MENU.dxr #46 on mouseDown me
  mouseDown()        {
    dsSetPosition(this.pSND_ID, 0);
    dsPlay(this.pSND_ID);
    this.pClickFlag = 1;
    sendSprite(0, sym('startIdleThreading'), this);
  }
}
