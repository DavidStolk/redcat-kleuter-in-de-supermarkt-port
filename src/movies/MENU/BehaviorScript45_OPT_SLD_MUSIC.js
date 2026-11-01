// MENU.dxr BehaviorScript 45 - OPT_SLD_MUSIC (decomp/MENU/scripts/BehaviorScript 45 - OPT_SLD_MUSIC.ls)
import { dsSetVolume, call, G, sendSprite, sprite, the } from '../../runtime/api.js';
import { div, getAt, getaProp, getPos, count, max, min, setaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gCursor` is not declared global here: resolves to the global.
export class OPT_SLD_MUSIC extends LingoScript {
  static scriptName = 'OPT_SLD_MUSIC';
  pSprite        = VOID; pMem        = VOID; pLoc        = VOID; pWidth        = VOID; pVolume        = VOID;
  pSlider_Min        = VOID; pSlider_Max        = VOID; pSlider_Range        = VOID; pSlider_Step        = VOID;
  pClickFlag        = VOID; pSND_ID        = VOID; pVTabel_List        = VOID; pVTabel_Count        = VOID;

  // MENU.dxr #45 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = sprite(this.pSprite).memberNum;
    this.pWidth = sprite(this.pSprite).width;
    this.pVTabel_List = getaProp(G.gAppSettings, sym('VSCALE_MUSIC'));
    this.pVTabel_Count = count(this.pVTabel_List);
    this.pSlider_Min = sprite(this.pSprite - 1).left + div(this.pWidth, 2);
    this.pSlider_Max = sprite(this.pSprite - 1).right - div(this.pWidth, 2);
    this.pSlider_Range = sprite(this.pSprite - 1).width - this.pWidth;
    this.pSlider_Step = div(this.pSlider_Range, this.pVTabel_Count - 1);
    this.pClickFlag = 0;
    this.pVolume = getaProp(G.gAppSettings, sym('VOLUME_MUSIC'));
    let myIDX = getPos(this.pVTabel_List, this.pVolume);
    if (!truthy(myIDX)) {
      myIDX = this.pVTabel_Count;
      this.pVolume = 0;
    }
    myIDX = myIDX - 1;
    sprite(this.pSprite).locH = this.pSlider_Min + (myIDX * this.pSlider_Step);
    sendSprite(0, sym('addChannel'), sym('BTN_SLD'), this.pSprite);
  }

  // MENU.dxr #45 on update me
  update()        {
    const myMouseH = the.mouseH;
    const mySlider_Pos = max(min(myMouseH, this.pSlider_Max), this.pSlider_Min);
    const myIDX = div(mySlider_Pos - this.pSlider_Min, this.pSlider_Step);
    this.pVolume = getAt(this.pVTabel_List, myIDX + 1);
    dsSetVolume(G.gSND_MenuMusic, this.pVolume);
    sprite(this.pSprite).locH = this.pSlider_Min + (myIDX * this.pSlider_Step);
  }

  // MENU.dxr #45 on mouseEnter me
  mouseEnter()        {
    call(sym('setState_Active'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem + 1;
  }

  // MENU.dxr #45 on mouseLeave me
  mouseLeave()        {
    if (truthy(this.pClickFlag)) {
      return;
    }
    call(sym('setState_Default'), G.gCursor);
    sprite(this.pSprite).memberNum = this.pMem;
  }

  // MENU.dxr #45 on mouseUp me
  mouseUp()        {
    if (truthy(this.pClickFlag)) {
      setaProp(G.gAppSettings, sym('VOLUME_MUSIC'), this.pVolume);
      this.pClickFlag = 0;
      sendSprite(0, sym('stopIdleThreading'), this);
      call(sym('setState_Default'), G.gCursor);
      sprite(this.pSprite).memberNum = this.pMem;
    }
  }

  // MENU.dxr #45 on mouseUpOutSide me
  mouseUpOutSide()        {
    if (truthy(this.pClickFlag)) {
      setaProp(G.gAppSettings, sym('VOLUME_MUSIC'), this.pVolume);
      this.pClickFlag = 0;
      sendSprite(0, sym('stopIdleThreading'), this);
      call(sym('setState_Default'), G.gCursor);
      sprite(this.pSprite).memberNum = this.pMem;
    }
  }

  // MENU.dxr #45 on mouseDown me
  mouseDown()        {
    this.pClickFlag = 1;
    sendSprite(0, sym('startIdleThreading'), this);
  }
}
