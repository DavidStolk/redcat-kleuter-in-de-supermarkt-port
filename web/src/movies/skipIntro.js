// Port only (DEVIATIONS.md "Skipping Redcat's intro"; the owner's request 2026-11-02): a click or
// tap skips Redcat's talking intro of MENU (#32 MNU_FRAME) and the games (FE0n_FRAME). The
// original ignores clicks then. The player sends `skipIntro` to the frame script on every mouse
// press (before `mouseDown`); the frame script's `exitFrame` calls `cutIntroTalk` first.
// Nothing of the intro is left out but the speech: each of Redcat's intro lines ends at once, its
// remaining voice cues (mouth, arms, button flash, end cue) run in order in that frame, so the
// frame script's own state machine walks the rest of the intro (help flag, GM01 cheese demo,
// walk-out, enabling the buttons) with all its side effects. A new frame script instance starts
// every visit, so the next visit plays the intro again.
import { dsDelSound } from '../runtime/api.js';
import { getAt, LSymbol, VOID,            } from '../runtime/lingo.js';

/** Redcat's intro lines in every voice.cpd: `0nRCULxx`, `03RCULSn`, `RCULSTOP`. Not used outside
 * the intros (checked in all six frame scripts). */
const INTRO_TALK = /RCUL/i;

/** The voice scheme properties every one of these frame scripts has (CP_Init / CP_Passed). */
                     
                                         
                                          
                                                                            
                                                
                                 
 

const skipping = new WeakSet        ();

/** The voice.cpd name of the line being spoken (CP_Init took its cue list from the same entry). */
function talkName(f           )         {
  if (!f.pCP_Flag) return '';
  const i = (f.pCPD_CPNamesList           ).indexOf(f.pCP_Name_List);
  return i < 0 ? '' : String((f.pCPD_NameList           )[i]);
}

/** A press during the intro: Redcat is speaking an intro line, or the state machine is in one of
 * the `RCUL_*` intro states (walking in, between lines). */
export function requestSkipIntro(f           )       {
  const state = [f.pFS, f.pNextFS].some((s) => s instanceof LSymbol && s.name.startsWith('RCUL_'));
  if (state || INTRO_TALK.test(talkName(f))) skipping.add(f);
}

/** First thing in `exitFrame`: while skipping, an intro line ends before it is (further) played. */
export function cutIntroTalk(f           )       {
  if (!skipping.has(f) || !INTRO_TALK.test(talkName(f))) return;
  dsDelSound(f.pTalkFile);
  f.pTalkFile = VOID;
  f.pTalkFile_Flag = 0;
  f.pCP_Flag = 0;
  f.pFH = 0; // GM04 pauses 6 frames after each line
  for (let i = f.pCP_Index          ; i <= (f.pCP_Count          ); i++) f.CP_Passed(getAt(f.pCP_Name_List, i));
}
