// MAIN.dxr: ported scripts (port/PORTING.md). Not ported, never attached or instantiated
// (decomp/notes/movie_flow.md): BehaviorScript 5 - Button, BehaviorScript 7, BehaviorScript 52 - ZZZ.
                                                             
import { CheckScript } from './BehaviorScript4_CheckScript.js';
import { BehaviorScript6 } from './BehaviorScript6.js';
import { BTN } from './BehaviorScript8_BTN.js';
import { Video_Frame } from './BehaviorScript74_Video_Frame.js';
import { MovieScript3 } from './MovieScript3.js';
import { MovieScript14_APPSETTINGS } from './MovieScript14_APPSETTINGS.js';
import { Class_Cursor } from './ParentScript43_Class_Cursor.js';

const MAIN               = {
  scripts: { 4: CheckScript, 6: BehaviorScript6, 8: BTN, 43: Class_Cursor, 74: Video_Frame },
  movieScripts: [MovieScript3, MovieScript14_APPSETTINGS],
};
export default MAIN;
