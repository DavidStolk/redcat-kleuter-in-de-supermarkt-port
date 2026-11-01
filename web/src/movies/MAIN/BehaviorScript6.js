// MAIN.dxr BehaviorScript 6 (decomp/MAIN/scripts/BehaviorScript 6.ls)
import { call, G, go, quit, sendSprite, SetCursorPos, sprite, the, updateStage } from '../../runtime/api.js';
import { add, eq, getaProp, getPos, max, min, neq, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class BehaviorScript6 extends LingoScript {
  static scriptName = 'BehaviorScript 6';
  pFS        = VOID; pFH        = VOID; pBTN_Channels        = VOID;
  pCRS_L        = VOID; pCRS_T        = VOID; pCRS_R        = VOID; pCRS_B        = VOID;

  // MAIN.dxr #6 on beginSprite me
  beginSprite()        {
    this.pCRS_L = getaProp(G.gAppSettings, sym('CURSOR_LEFT'));
    this.pCRS_T = getaProp(G.gAppSettings, sym('CURSOR_TOP'));
    this.pCRS_R = getaProp(G.gAppSettings, sym('CURSOR_RIGHT'));
    this.pCRS_B = getaProp(G.gAppSettings, sym('CURSOR_BOTTOM'));
    this.pFS = 0;
    this.pFH = 0;
    this.pBTN_Channels = [];
  }

  // MAIN.dxr #6 on idle me
  idle()        {
    const myMH = the.mouseH;
    const myMV = the.mouseV;
    const myRH = min(this.pCRS_R, max(this.pCRS_L, myMH));
    const myRV = min(this.pCRS_B, max(this.pCRS_T, myMV));
    if (neq(myMH, myRH) || neq(myMV, myRV)) {
      SetCursorPos(the.stageLeft + myRH, the.stageTop + myRV);
    }
    sprite(119).locH = the.mouseH;
    sprite(119).locV = the.mouseV;
    updateStage();
  }

  // MAIN.dxr #6 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
    } else {
      if (!truthy(this.pFH)) {
        call(this.pFS, this);
      } else {
        this.pFH = this.pFH - 1;
      }
    }
    go(the.frame);
  }

  // MAIN.dxr #6 on BTN_CLICK me, wChannel
  BTN_CLICK(wChannel       )        {
    for (const myChannel of this.pBTN_Channels.slice()) {
      sendSprite(myChannel, sym('Disable'));
    }
    if (eq(getPos(this.pBTN_Channels, wChannel), 1)) {
      this.pFS = sym('FS_QUIT');
    } else {
      if (eq(getPos(this.pBTN_Channels, wChannel), 2)) {
        this.pFS = sym('FS_VERIFY');
      }
    }
  }

  // MAIN.dxr #6 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('BTN'))) {
      add(this.pBTN_Channels, wChannel);
    }
  }

  // MAIN.dxr #6 on FS_QUIT me
  FS_QUIT()        {
    this.pFS = 0;
    quit();
  }

  // MAIN.dxr #6 on FS_VERIFY me
  FS_VERIFY()        {
    this.pFS = 0;
    sprite(119).locH = -200;
    go('VERIFY');
  }
}
