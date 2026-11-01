// MENU.dxr BehaviorScript 47 - OPT_SLD_SNDFX (decomp/MENU/scripts/BehaviorScript 47 - OPT_SLD_SNDFX.ls)
import { dsNewSound, dsSetLoop, dsSetPosition, dsStop, dsSetVolume, dsPlay, call, G, sendSprite, sprite, the } from '../../runtime/api.js';
import { cat, div, getAt, getaProp, getPos, getLast, count, max, min, setaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gCursor` is not declared global here: resolves to the global.
export class OPT_SLD_SNDFX extends LingoScript {
  static scriptName = 'OPT_SLD_SNDFX';
  pSprite        = VOID; pMem        = VOID; pLoc        = VOID; pWidth        = VOID; pVolume        = VOID;
  pSlider_Min        = VOID; pSlider_Max        = VOID; pSlider_Range        = VOID; pSlider_Step        = VOID;
  pClickFlag        = VOID; pSND_ID        = VOID; pVTabel_List        = VOID; pVTabel_Count        = VOID;

  // MENU.dxr #47 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pWidth = sprite(this.pSprite).width;
    this.pVTabel_List = getaProp(G.gAppSettings, sym('VSCALE_SNDFX'));
    this.pVTabel_Count = count(this.pVTabel_List);
    this.pSlider_Min = sprite(this.pSprite - 1).left + div(this.pWidth, 2);
    this.pSlider_Max = sprite(this.pSprite - 1).right - div(this.pWidth, 2);
    this.pSlider_Range = sprite(this.pSprite - 1).width - this.pWidth;
    this.pSlider_Step = div(this.pSlider_Range, this.pVTabel_Count - 1);
    const myFile = cat(getaProp(G.gAppSettings, sym('OPT_PATH_SNDFX')), 'Test.wav');
    this.pSND_ID = dsNewSound(myFile, 0);
    this.pClickFlag = 0;
    this.pVolume = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    let myIDX = getPos(this.pVTabel_List, this.pVolume);
    if (!truthy(myIDX)) {
      myIDX = this.pVTabel_Count;
      this.pVolume = getLast(this.pVTabel_List);
    }
    myIDX = myIDX - 1;
    dsSetLoop(this.pSND_ID, 1);
    dsSetVolume(this.pSND_ID, this.pVolume);
    sprite(this.pSprite).locH = this.pSlider_Min + (myIDX * this.pSlider_Step);
    sendSprite(0, sym('addChannel'), sym('BTN_SLD'), this.pSprite);
  }

  // MENU.dxr #47 on update me
  update()        {
    const myMouseH = the.mouseH;
    const mySlider_Pos = max(min(myMouseH, this.pSlider_Max), this.pSlider_Min);
    const myIDX = div(mySlider_Pos - this.pSlider_Min, this.pSlider_Step);
    this.pVolume = getAt(this.pVTabel_List, myIDX + 1);
    dsSetVolume(this.pSND_ID, this.pVolume);
    sprite(this.pSprite).locH = this.pSlider_Min + (myIDX * this.pSlider_Step);
  }

  // MENU.dxr #47 on mouseEnter me
  mouseEnter()        {
    call(sym('setState_Active'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // MENU.dxr #47 on mouseLeave me
  mouseLeave()        {
    if (truthy(this.pClickFlag)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // MENU.dxr #47 on mouseUp me
  mouseUp()        {
    if (truthy(this.pClickFlag)) {
      dsStop(this.pSND_ID);
      setaProp(G.gAppSettings, sym('VOLUME_SNDFX'), this.pVolume);
      this.pClickFlag = 0;
      sendSprite(0, sym('stopIdleThreading'), this);
      call(sym('setState_Default'), G.gCursor);
      sprite(this.pSprite).memberNum = this.pMem;
    }
  }

  // MENU.dxr #47 on mouseUpOutSide me
  mouseUpOutSide()        {
    if (truthy(this.pClickFlag)) {
      dsStop(this.pSND_ID);
      setaProp(G.gAppSettings, sym('VOLUME_SNDFX'), this.pVolume);
      this.pClickFlag = 0;
      sendSprite(0, sym('stopIdleThreading'), this);
      call(sym('setState_Default'), G.gCursor);
      sprite(this.pSprite).memberNum = this.pMem;
    }
  }

  // MENU.dxr #47 on mouseDown me
  mouseDown()        {
    dsPlay(this.pSND_ID);
    this.pClickFlag = 1;
    sendSprite(0, sym('startIdleThreading'), this);
  }
}
