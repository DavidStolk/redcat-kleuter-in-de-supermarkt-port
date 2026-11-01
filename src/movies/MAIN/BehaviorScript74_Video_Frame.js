// MAIN.dxr BehaviorScript 74 - Video Frame (decomp/MAIN/scripts/BehaviorScript 74 - Video Frame.ls)
import { call, go, member, preLoad, sprite, the } from '../../runtime/api.js';
import { eq, point, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class Video_Frame extends LingoScript {
  static scriptName = 'Video Frame';
  pFS        = VOID; pDown_Flag        = VOID; pVideo_Channel        = VOID; pVideo_Mem        = VOID;
  pVideo_Present        = VOID; pVideo_Duration        = VOID;

  // MAIN.dxr #74 on beginSprite me
  beginSprite()        {
    this.pVideo_Mem = member('Video');
    this.pVideo_Present = the.videoForWindowsPresent;
    this.pVideo_Channel = 120;
    this.pDown_Flag = 0;
    this.pFS = sym('FS_Init');
  }

  // MAIN.dxr #74 on exitFrame me
  exitFrame()        {
    if (!truthy(this.pFS)) {
    } else {
      call(this.pFS, this);
    }
    go(the.frame);
  }

  // MAIN.dxr #74 on idle
  idle()        {
    if (!truthy(this.pDown_Flag)) {
      if (truthy(the.mouseDown)) {
        this.pDown_Flag = 1;
        go(1, 'INTRO');
        this.pFS = 0;
      }
    }
  }

  // MAIN.dxr #74 on FS_Init me
  FS_Init()        {
    if (truthy(this.pVideo_Present)) {
      preLoad(member(this.pVideo_Mem));
      this.pVideo_Duration = member(this.pVideo_Mem).duration;
      sprite(this.pVideo_Channel).loc = point(320, 240);
      sprite(this.pVideo_Channel).member = this.pVideo_Mem;
      this.pFS = sym('FS_PlayVideo');
    } else {
      go(1, 'INTRO');
      this.pFS = 0;
    }
  }

  // MAIN.dxr #74 on FS_PlayVideo me
  FS_PlayVideo()        {
    if (eq(sprite(this.pVideo_Channel).movieTime, this.pVideo_Duration)) {
      go(1, 'INTRO');
      this.pFS = 0;
    }
  }
}
