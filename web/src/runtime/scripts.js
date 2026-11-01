// Script model for the hand-ported Lingo (approach A, DECISIONS.md).
// - A behaviour or parent script is a TS class extending LingoScript; Lingo `property` variables
//   are fields (initialised to VOID), handlers are methods with the original names (`me` = this).
// - A movie script is a plain object of handlers (global functions of that movie).
// - Lingo handler names are case-insensitive: dispatch looks methods up by lower-case name.
import { dispatch, LSymbol, VOID,            } from './lingo.js';

export class LingoScript {
  /** `the spriteNum of me` (0 for the frame behaviour, VOID for parent-script instances). */
  spriteNum        = VOID;
  /** The script member this instance was made from (`script "Name"`). */
                                    
}

                                                                            
                                                                      

/** Per movie: the cast-member number -> script class for behaviours/parent scripts, and the movie
 * scripts (event handlers prepareMovie/startMovie/stopMovie and global handlers). */
                               
                                       
                              
 

const methodCache = new WeakMap                             ();
function methodsOf(obj        )                      {
  const proto = Object.getPrototypeOf(obj);
  const plain = proto === Object.prototype || proto === null;
  const key = plain ? obj : proto;
  let m = methodCache.get(key);
  if (m) return m;
  m = new Map();
  if (plain) {
    // Movie script: own function properties.
    for (const name of Object.keys(obj)) if (typeof (obj                           )[name] === 'function') m.set(name.toLowerCase(), name);
  } else {
    // Class instance: walk the prototype chain (most-derived wins), stop at LingoScript/Object.
    for (let p = proto; p && p !== Object.prototype && p !== LingoScript.prototype; p = Object.getPrototypeOf(p)) {
      for (const name of Object.getOwnPropertyNames(p)) {
        if (name === 'constructor') continue;
        const d = Object.getOwnPropertyDescriptor(p, name);
        if (d && typeof d.value === 'function' && !m.has(name.toLowerCase())) m.set(name.toLowerCase(), name);
      }
    }
  }
  methodCache.set(key, m);
  return m;
}
function handlerName(h                  )         { return (typeof h === 'string' ? h : h.name).toLowerCase(); }

export function hasHandler(obj       , handler                  )          {
  if (obj === null || typeof obj !== 'object') return false;
  return methodsOf(obj).has(handlerName(handler));
}
/** Calls `handler` on `obj` with `me` = obj; returns {handled, result}. */
export function callHandler(obj       , handler                  , args         )                                      {
  if (obj === null || typeof obj !== 'object') return { handled: false, result: VOID };
  const name = methodsOf(obj).get(handlerName(handler));
  if (!name) return { handled: false, result: VOID };
  return { handled: true, result: (obj                                            )[name](...args) };
}

dispatch.has = (obj, h) => hasHandler(obj, h);
dispatch.call = (obj, h, args) => callHandler(obj, h, args).result;
