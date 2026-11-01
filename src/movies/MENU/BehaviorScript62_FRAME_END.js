// MENU.dxr BehaviorScript 62 - FRAME_END (decomp/MENU/scripts/BehaviorScript 62 - FRAME_END.ls)
import {
  call, dsClose, dsDelSound, dsIsPlaying, dsNewSound, dsOpen, dsPlay, dsSetVolume, G, go, KeysUnBlock, sendSprite,
  SetCursorPos, sprite, the, updateStage,
} from '../../runtime/api.js';
import { add, cat, eq, getPos, getaProp, max, min, neq, setaProp, sym, truthy, VOID, voidp,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

// `gAppSettings` is not declared global here: resolves to the global.
export class FRAME_END extends LingoScript {
  static scriptName = 'FRAME_END';
  pFS        = VOID; pFH        = VOID; pBTN_Channels        = VOID; pPath_Audio_Music        = VOID;
  pPath_Audio_Voice        = VOID; pPath_Audio_SndFx        = VOID; pLevel_Audio_Music        = VOID;
  pLevel_Audio_Voice        = VOID; pLevel_Audio_SndFx        = VOID; pCRS_L        = VOID;
  pCRS_T        = VOID; pCRS_R        = VOID; pCRS_B        = VOID;

  // MENU.dxr #62 on beginSprite me
  beginSprite()        {
    this.pPath_Audio_Music = getaProp(G.gAppSettings, sym('MNU_PATH_MUSIC'));
    this.pPath_Audio_Voice = getaProp(G.gAppSettings, sym('MNU_PATH_VOICE'));
    this.pPath_Audio_SndFx = getaProp(G.gAppSettings, sym('MNU_PATH_SNDFX'));
    this.pLevel_Audio_Music = getaProp(G.gAppSettings, sym('VOLUME_MUSIC'));
    this.pLevel_Audio_Voice = getaProp(G.gAppSettings, sym('VOLUME_VOICE'));
    this.pLevel_Audio_SndFx = getaProp(G.gAppSettings, sym('VOLUME_SNDFX'));
    this.pCRS_L = getaProp(G.gAppSettings, sym('CURSOR_LEFT'));
    this.pCRS_T = getaProp(G.gAppSettings, sym('CURSOR_TOP'));
    this.pCRS_R = getaProp(G.gAppSettings, sym('CURSOR_RIGHT'));
    this.pCRS_B = getaProp(G.gAppSettings, sym('CURSOR_BOTTOM'));
    dsOpen();
    if (!truthy(voidp(G.gSND_MenuBTN))) {
      dsDelSound(G.gSND_MenuBTN);
      G.gSND_MenuBTN = VOID;
    }
    G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_Voice, 'STOP_01.wav'), 0);
    dsSetVolume(G.gSND_MenuBTN, this.pLevel_Audio_Voice);
    dsPlay(G.gSND_MenuBTN);
    this.pBTN_Channels = [];
    this.pFS = 0;
    this.pFH = 0;
  }

  // MENU.dxr #62 on endSprite (no `me` parameter)
  endSprite()        {
    dsClose();
  }

  // MENU.dxr #62 on exitFrame me
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

  // MENU.dxr #62 on idle me
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

  // MENU.dxr #62 on InitFrame me
  InitFrame()        {
  }

  // MENU.dxr #62 on BTN_CLICK me, wChannel
  BTN_CLICK(wChannel       )        {
    if (!truthy(voidp(G.gSND_MenuBTN))) {
      dsDelSound(G.gSND_MenuBTN);
      G.gSND_MenuBTN = VOID;
    }
    if (eq(getPos(this.pBTN_Channels, wChannel), 1)) {
      G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_Voice, 'STOP_03.wav'), 0);
      this.pFS = sym('FS_back');
    } else {
      if (eq(getPos(this.pBTN_Channels, wChannel), 2)) {
        G.gSND_MenuBTN = dsNewSound(cat(this.pPath_Audio_Voice, 'STOP_02.wav'), 0);
        this.pFS = sym('FS_QUIT');
      }
    }
    dsSetVolume(G.gSND_MenuBTN, this.pLevel_Audio_Voice);
    dsPlay(G.gSND_MenuBTN);
    for (const myChannel of this.pBTN_Channels.slice()) {
      sendSprite(myChannel, sym('Disable'));
    }
  }

  // MENU.dxr #62 on addChannel me, wLabel, wChannel
  addChannel(wLabel       , wChannel       )        {
    if (eq(wLabel, sym('BTN'))) {
      add(this.pBTN_Channels, wChannel);
    }
  }

  // MENU.dxr #62 on FS_QUIT me
  // `set FS to 0` assigns a local variable FS (not the property pFS): pFS stays #FS_QUIT (original quirk).
  FS_QUIT()        {
    if (truthy(dsIsPlaying(G.gSND_MenuBTN))) {
      return;
    }
    if (eq(the.runMode, 'Projector')) {
      KeysUnBlock();
    }
    go('QUIT');
    const FS = 0;
  }

  // MENU.dxr #62 on FS_back me
  // `set FS to 0` is again a local variable (original quirk).
  FS_back()        {
    if (truthy(dsIsPlaying(G.gSND_MenuBTN))) {
      return;
    }
    setaProp(G.gAppSettings, sym('MNU_UL'), -1);
    G.gSND_MenuMusic = VOID;
    go('MENU');
    const FS = 0;
  }
}
