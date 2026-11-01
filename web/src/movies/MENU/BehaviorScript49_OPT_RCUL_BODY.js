// MENU.dxr BehaviorScript 49 - OPT_RCUL_BODY (decomp/MENU/scripts/BehaviorScript 49 - OPT_RCUL_BODY.ls)
import { member, sendSprite, sprite } from '../../runtime/api.js';
import { sym, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class OPT_RCUL_BODY extends LingoScript {
  static scriptName = 'OPT_RCUL_BODY';
  pSprite        = VOID; pMem        = VOID; pMond_Channel        = VOID; pOog_Channel        = VOID;
  pArm1_Channel        = VOID; pArm2_Channel        = VOID;

  // MENU.dxr #49 on beginSprite me
  beginSprite()        {
    this.pSprite = this.spriteNum;
    this.pMem = member('MIDX_RCUL').memberNum;
    this.pMond_Channel = this.pSprite + 1;
    this.pOog_Channel = this.pSprite + 2;
    this.pArm1_Channel = this.pSprite + 3;
    this.pArm2_Channel = this.pSprite + 4;
    sendSprite(0, sym('addChannel'), sym('RCUL'), this.pSprite);
  }

  // MENU.dxr #49 on init me
  init()        {
    sendSprite(this.pOog_Channel, sym('Start'));
  }

  // MENU.dxr #49 on default me
  default()        {
    sendSprite(this.pMond_Channel, sym('stop'));
    sprite(this.pArm1_Channel).memberNum = this.pMem + 13;
    sprite(this.pArm2_Channel).memberNum = this.pMem + 18;
  }

  // MENU.dxr #49 on AX me
  AX()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 13; }
  // MENU.dxr #49 on A1 me
  A1()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 14; }
  // MENU.dxr #49 on A2 me
  A2()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 15; }
  // MENU.dxr #49 on A3 me
  A3()        { sprite(this.pArm1_Channel).memberNum = this.pMem + 16; }

  // MENU.dxr #49 on MX me
  MX()        { sendSprite(this.pMond_Channel, sym('stop')); }
  // MENU.dxr #49 on M1 me
  M1()        { sendSprite(this.pMond_Channel, sym('open')); }
  // MENU.dxr #49 on M2 me
  M2()        { sendSprite(this.pMond_Channel, sym('Talk')); }
}
