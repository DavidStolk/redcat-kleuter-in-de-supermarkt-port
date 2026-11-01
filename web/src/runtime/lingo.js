// Lingo values and the value builtins of Director 6 (decomp/notes/lingo_usage.md, "Lingo builtin
// functions"). Representation used by every ported script:
//   integer/float -> number (Lingo keeps the distinction: see LFloat below)
//   string        -> string           symbol      -> LSymbol (interned, case-insensitive)
//   linear list   -> JS array (1-based through getAt/setAt/...)
//   property list -> PropList          point/rect  -> LPoint/LRect
//   VOID          -> VOID (undefined)  objects     -> script instances (classes in movies/)
// Rules: decomp/notes/runtime.md.

export const VOID = undefined;
                        

/** Interned symbol; Lingo symbols compare case-insensitively (#PATH_DATA = #path_data). */
export class LSymbol {
           name        ;
  constructor(name        ) { this.name = name; }
  toString()         { return '#' + this.name; }
}
const symbols = new Map                 ();
export function sym(name        )          {
  const key = name.toLowerCase();
  let s = symbols.get(key);
  if (!s) { s = new LSymbol(name); symbols.set(key, s); }
  return s;
}

/** A float that is integral (e.g. `float(3)`), kept apart from integers for ilk/string/div. */
export class LFloat {
           v        ;
  constructor(v        ) { this.v = v; }
  valueOf()         { return this.v; }
}

export class LPoint {
  locH        ; locV        ;
  constructor(h        , v        ) { this.locH = h; this.locV = v; }
}
export class LRect {
  left        ; top        ; right        ; bottom        ;
  constructor(l        , t        , r        , b        ) { this.left = l; this.top = t; this.right = r; this.bottom = b; }
  get width()         { return this.right - this.left; }
  get height()         { return this.bottom - this.top; }
}
export function point(h        , v        )         { return new LPoint(h, v); }
export function rect(l        , t        , r        , b        )        { return new LRect(l, t, r, b); }

/** Property list `[key: value, ...]` (ordered; keys compared with Lingo `=`). */
export class PropList {
  keys          = [];
  values          = [];
  constructor(entries                        ) {
    if (entries) for (const [k, v] of entries) { this.keys.push(k); this.values.push(v); }
  }
  indexOf(key       )         {
    for (let i = 0; i < this.keys.length; i++) if (eq(this.keys[i], key)) return i;
    return -1;
  }
}
export function propList(...kv         )           {
  const p = new PropList();
  for (let i = 0; i + 1 < kv.length; i += 2) { p.keys.push(kv[i]); p.values.push(kv[i + 1]); }
  return p;
}

/** Thrown by `abort`: ends every running handler of the current event. */
export class LingoAbort extends Error {}

/** Handler dispatch on script instances (set by scripts.ts to avoid an import cycle). */
export const dispatch   
                                                
                                                              
  = { has: () => false, call: () => VOID };

function isInstance(x       )          {
  return x !== null && typeof x === 'object' && !Array.isArray(x) && !(x instanceof PropList)
    && !(x instanceof LSymbol) && !(x instanceof LPoint) && !(x instanceof LRect) && !(x instanceof LFloat);
}
/** Lingo sends a builtin's call to the first argument's script when it defines that handler. */
function sendsTo(obj       , handler        )          { return isInstance(obj) && dispatch.has(obj, handler); }

// ---- numbers -------------------------------------------------------------------------------
export function num(x       )         {
  if (typeof x === 'number') return x;
  if (x instanceof LFloat) return x.v;
  if (x === VOID || x === null) return 0;
  if (typeof x === 'string') { const n = Number(x.trim()); return Number.isFinite(n) ? n : 0; }
  return 0;
}
export function isFloat(x       )          { return x instanceof LFloat || (typeof x === 'number' && !Number.isInteger(x)); }

/** Lingo truth: VOID and 0 are false; every other value is true. TODO(faithful): D6 `not` on a
 * string or list is not checked against the original (the game only tests numbers/symbols/VOID). */
export function truthy(x       )          {
  if (x === VOID || x === null) return false;
  if (typeof x === 'number') return x !== 0;
  if (x instanceof LFloat) return x.v !== 0;
  if (typeof x === 'boolean') return x;
  return true;
}
export function not(x       )         { return truthy(x) ? 0 : 1; }
export function bool(b         )         { return b ? 1 : 0; }

/** `a / b`: integer division (truncated) when both are integers, else float. */
export function div(a       , b       )         {
  const x = num(a), y = num(b);
  if (!isFloat(a) && !isFloat(b)) {
    if (y === 0) throw new Error('Lingo: division by zero');
    return Math.trunc(x / y);
  }
  return x / y;
}
export function mod(a       , b       )         { return Math.trunc(num(a)) % Math.trunc(num(b)); }

/** Lingo `+ - *` where an operand may be a point or a linear list (element-wise, a number
 * applies to every element; the result has the left operand's type). Plain numbers: use TS
 * operators. A float operand gives a float (an integral float stays an LFloat). */
function arith(a       , b       , f                                  )        {
  if (a instanceof LPoint || b instanceof LPoint) {
    // A point is a two-element list to arithmetic: point + [h, v] works (GM03 FE03_BLN).
    const hv = (x       )                   => x instanceof LPoint ? [x.locH, x.locV] : Array.isArray(x) ? [num(x[0]), num(x[1])] : [num(x), num(x)];
    const [ah, av] = hv(a), [bh, bv] = hv(b);
    return new LPoint(f(ah, bh), f(av, bv));
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    const n = Array.isArray(a) && Array.isArray(b) ? Math.min(a.length, b.length) : (Array.isArray(a) ? a : b).length;
    const out          = [];
    for (let i = 0; i < n; i++) out.push(arith(Array.isArray(a) ? a[i] : a, Array.isArray(b) ? b[i] : b, f));
    return out;
  }
  const r = f(num(a), num(b));
  return (isFloat(a) || isFloat(b)) && Number.isInteger(r) ? new LFloat(r) : r;
}
export function plus(a       , b       )        { return arith(a, b, (x, y) => x + y); }
export function minus(a       , b       )        { return arith(a, b, (x, y) => x - y); }
export function times(a       , b       )        { return arith(a, b, (x, y) => x * y); }

export function integer(x       )        {
  if (typeof x === 'string') { const n = Number(x.trim()); return Number.isFinite(n) ? Math.round(n) : VOID; }
  if (x === VOID) return VOID;
  // Director rounds floats to the nearest integer (half away from zero).
  const n = num(x);
  return n < 0 ? -Math.round(-n) : Math.round(n);
}
export function float(x       )                  {
  const n = num(x);
  return Number.isInteger(n) ? new LFloat(n) : n;
}

// ---- comparison ----------------------------------------------------------------------------
/** Lingo `=`: numbers by value, strings case-insensitive, symbols by identity (a symbol equals a
 * string of the same name, case-insensitive), lists element-wise. */
export function eq(a       , b       )          {
  if (a === b) return true;
  const an = typeof a === 'number' || a instanceof LFloat, bn = typeof b === 'number' || b instanceof LFloat;
  if (an && bn) return num(a) === num(b);
  // TODO(faithful): VOID = 0 as true is unverified for D6 (the game tests VOID with voidp()).
  if (a === VOID || b === VOID) return (a === VOID && (b === VOID || (bn && num(b) === 0))) || (b === VOID && an && num(a) === 0);
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
  if (a instanceof LSymbol && typeof b === 'string') return a.name.toLowerCase() === b.toLowerCase();
  if (b instanceof LSymbol && typeof a === 'string') return b.name.toLowerCase() === a.toLowerCase();
  if (an && typeof b === 'string') return num(a) === Number(b);
  if (bn && typeof a === 'string') return num(b) === Number(a);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
  if (a instanceof LPoint && b instanceof LPoint) return a.locH === b.locH && a.locV === b.locV;
  if (a instanceof LRect && b instanceof LRect) return a.left === b.left && a.top === b.top && a.right === b.right && a.bottom === b.bottom;
  return false;
}
export function neq(a       , b       )          { return !eq(a, b); }
function cmp(a       , b       )         {
  if (typeof a === 'string' && typeof b === 'string') {
    const x = a.toLowerCase(), y = b.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  return num(a) - num(b);
}
export function lt(a       , b       )          { return cmp(a, b) < 0; }
export function gt(a       , b       )          { return cmp(a, b) > 0; }
export function lteq(a       , b       )          { return cmp(a, b) <= 0; }
export function gteq(a       , b       )          { return cmp(a, b) >= 0; }

// ---- strings -------------------------------------------------------------------------------
/** `string(x)` (also what `&` does to non-strings). Floats use `the floatPrecision` = 4. */
export function string(x       )         {
  if (typeof x === 'string') return x;
  if (x === VOID || x === null) return '';
  if (typeof x === 'number') return Number.isInteger(x) ? String(x) : x.toFixed(4);
  if (x instanceof LFloat) return x.v.toFixed(4);
  if (x instanceof LSymbol) return x.name;
  return literal(x);
}
/** Lingo literal form of a value, as `put`/`string` of a list print it. */
export function literal(x       )         {
  if (typeof x === 'string') return '"' + x + '"';
  if (x instanceof LSymbol) return '#' + x.name;
  if (Array.isArray(x)) return '[' + x.map(literal).join(', ') + ']';
  if (x instanceof PropList) {
    if (x.keys.length === 0) return '[:]';
    return '[' + x.keys.map((k, i) => literal(k) + ': ' + literal(x.values[i])).join(', ') + ']';
  }
  if (x instanceof LPoint) return 'point(' + x.locH + ', ' + x.locV + ')';
  if (x instanceof LRect) return 'rect(' + [x.left, x.top, x.right, x.bottom].join(', ') + ')';
  if (x === VOID) return '<Void>';
  return string(x);
}
/** `a & b` */
export function cat(...parts         )         { return parts.map(string).join(''); }
/** `a && b` */
export function catSp(...parts         )         { return parts.map(string).join(' '); }
export function length(s       )         { return string(s).length; }
export function charToNum(s       )         { const t = string(s); return t.length ? t.charCodeAt(0) : 0; }
export function numToChar(n       )         { return String.fromCharCode(num(n)); }
/** `char i of s` / `char i to j of s` (1-based). */
export function charOf(s       , i        , j         = i)         { return string(s).substring(i - 1, j); }
/** `word i of s`: words separated by spaces, tabs and returns. */
export function wordOf(s       , i        )         { return string(s).split(/[ \t\r\n]+/).filter((w) => w !== '')[i - 1] ?? ''; }
/** `the number of lines in s`. */
export function lineCount(s       )         { return string(s).split('\r').length; }
/** `line i of s`: lines separated by RETURN (`\r`). */
export function lineOf(s       , i        )         { return string(s).split('\r')[i - 1] ?? ''; }
/** `delete char i of s` -> the new string. */
export function deleteChar(s       , i        , j         = i)         { const t = string(s); return t.substring(0, i - 1) + t.substring(j); }
export const RETURN = '\r';
export const EMPTY = '';
export const QUOTE = '"';

// ---- types ---------------------------------------------------------------------------------
export function voidp(x       )         { return bool(x === VOID || x === null); }
export function listp(x       )         { return bool(Array.isArray(x) || x instanceof PropList); }
export function symbolp(x       )         { return bool(x instanceof LSymbol); }
export function symbol(x       )          { return x instanceof LSymbol ? x : sym(string(x)); }
/** `ilk(x)` and `ilk(x, #type)` */
export function ilk(x       , type          )        {
  let t        ;
  if (typeof x === 'number') t = Number.isInteger(x) ? 'integer' : 'float';
  else if (x instanceof LFloat) t = 'float';
  else if (typeof x === 'string') t = 'string';
  else if (x instanceof LSymbol) t = 'symbol';
  else if (Array.isArray(x)) t = 'list';
  else if (x instanceof PropList) t = 'propList';
  else if (x instanceof LPoint) t = 'point';
  else if (x instanceof LRect) t = 'rect';
  else if (x === VOID) t = 'void';
  else t = 'instance';
  if (type === undefined) return sym(t);
  const want = type.name.toLowerCase();
  if (want === 'list') return bool(t === 'list' || t === 'propList' || t === 'point' || t === 'rect');
  if (want === 'linearlist') return bool(t === 'list');
  if (want === 'number') return bool(t === 'integer' || t === 'float');
  return bool(want === t.toLowerCase());
}

// ---- lists ---------------------------------------------------------------------------------
function badList(fn        , l       )        { throw new Error('Lingo ' + fn + ': not a list: ' + literal(l)); }

export function count(l       )         {
  if (sendsTo(l, 'count')) return dispatch.call(l, 'count', []);
  if (Array.isArray(l)) return l.length;
  if (l instanceof PropList) return l.keys.length;
  if (typeof l === 'string') return l.length;
  return badList('count', l);
}
export function getAt(l       , i       )        {
  if (sendsTo(l, 'getAt')) return dispatch.call(l, 'getAt', [i]);
  const n = num(i);
  if (Array.isArray(l)) { if (n < 1 || n > l.length) throw new Error('Lingo getAt: index out of range ' + n); return l[n - 1]; }
  if (l instanceof PropList) { if (n < 1 || n > l.keys.length) throw new Error('Lingo getAt: index out of range ' + n); return l.values[n - 1]; }
  if (l instanceof LPoint) return n === 1 ? l.locH : l.locV;
  if (l instanceof LRect) return [l.left, l.top, l.right, l.bottom][n - 1];
  return badList('getAt', l);
}
export function setAt(l       , i       , v       )       {
  if (sendsTo(l, 'setAt')) { dispatch.call(l, 'setAt', [i, v]); return; }
  const n = num(i);
  if (Array.isArray(l)) { while (l.length < n - 1) l.push(0); l[n - 1] = v; return; }
  if (l instanceof PropList) { l.values[n - 1] = v; return; }
  badList('setAt', l);
}
export function getLast(l       )        {
  if (Array.isArray(l)) return l.length ? l[l.length - 1] : VOID;
  if (l instanceof PropList) return l.values.length ? l.values[l.values.length - 1] : VOID;
  return badList('getLast', l);
}
export function getPropAt(l       , i       )        {
  if (l instanceof PropList) return l.keys[num(i) - 1];
  return badList('getPropAt', l);
}
/** `add(list, v)`; sent to a script instance's `add` handler when the first argument is one
 * (e.g. RandomIndexUnit). Linear lists only (sorted lists are not used by the game). */
export function add(l       , ...args         )        {
  if (sendsTo(l, 'add')) return dispatch.call(l, 'add', args);
  if (Array.isArray(l)) { l.push(args[0]); return VOID; }
  return badList('add', l);
}
export function addAt(l       , i       , v       )       {
  if (Array.isArray(l)) { l.splice(num(i) - 1, 0, v); return; }
  badList('addAt', l);
}
export function addProp(l       , k       , v       )       {
  if (l instanceof PropList) { l.keys.push(k); l.values.push(v); return; }
  badList('addProp', l);
}
export function deleteAt(l       , i       )       {
  if (sendsTo(l, 'deleteAt')) { dispatch.call(l, 'deleteAt', [i]); return; }
  const n = num(i) - 1;
  if (Array.isArray(l)) { if (n >= 0 && n < l.length) l.splice(n, 1); return; }
  if (l instanceof PropList) { if (n >= 0 && n < l.keys.length) { l.keys.splice(n, 1); l.values.splice(n, 1); } return; }
  badList('deleteAt', l);
}
export function deleteOne(l       , v       )       {
  if (Array.isArray(l)) { const i = l.findIndex((x) => eq(x, v)); if (i >= 0) l.splice(i, 1); return; }
  if (l instanceof PropList) { const i = l.values.findIndex((x) => eq(x, v)); if (i >= 0) { l.keys.splice(i, 1); l.values.splice(i, 1); } return; }
  badList('deleteOne', l);
}
/** `getPos(list, v)`: 1-based position of the value, 0 if absent. */
export function getPos(l       , v       )         {
  if (sendsTo(l, 'getPos')) return dispatch.call(l, 'getPos', [v]);
  if (Array.isArray(l)) return l.findIndex((x) => eq(x, v)) + 1;
  if (l instanceof PropList) return l.values.findIndex((x) => eq(x, v)) + 1;
  return badList('getPos', l);
}
/** `getaProp(list, key)`: VOID when the property is missing; on a linear list = getAt. */
export function getaProp(l       , key       )        {
  if (sendsTo(l, 'getaProp')) return dispatch.call(l, 'getaProp', [key]);
  if (l instanceof PropList) { const i = l.indexOf(key); return i < 0 ? VOID : l.values[i]; }
  if (Array.isArray(l)) { const n = num(key); return n >= 1 && n <= l.length ? l[n - 1] : VOID; }
  if (isInstance(l) && key instanceof LSymbol) return (l                         )[key.name];
  return badList('getaProp', l);
}
export function getProp(l       , key       )        {
  if (l instanceof PropList) { const i = l.indexOf(key); if (i < 0) throw new Error('Lingo getProp: property not found ' + literal(key)); return l.values[i]; }
  return getaProp(l, key);
}
/** `setaProp(list, key, v)`: replaces the value or adds the property at the end. */
export function setaProp(l       , key       , v       )       {
  if (sendsTo(l, 'setaProp')) { dispatch.call(l, 'setaProp', [key, v]); return; }
  if (l instanceof PropList) { const i = l.indexOf(key); if (i < 0) { l.keys.push(key); l.values.push(v); } else l.values[i] = v; return; }
  if (Array.isArray(l)) { setAt(l, key, v); return; }
  if (isInstance(l) && key instanceof LSymbol) { (l                         )[key.name] = v; return; }
  badList('setaProp', l);
}
/** `duplicate(list)`: deep copy of lists (nested lists too); other values are returned as is. */
export function duplicate(l       )        {
  if (sendsTo(l, 'duplicate')) return dispatch.call(l, 'duplicate', []);
  if (Array.isArray(l)) return l.map(duplicate);
  if (l instanceof PropList) { const p = new PropList(); p.keys = l.keys.slice(); p.values = l.values.map(duplicate); return p; }
  if (l instanceof LPoint) return new LPoint(l.locH, l.locV);
  if (l instanceof LRect) return new LRect(l.left, l.top, l.right, l.bottom);
  return l;
}
/** `min(list)` / `min(a, b, ...)` */
export function min(...a         )        {
  const xs          = a.length === 1 && Array.isArray(a[0]) ? a[0] : a.length === 1 && a[0] instanceof PropList ? a[0].values : a;
  if (!xs.length) return 0;
  return xs.reduce((m, x) => (lt(x, m) ? x : m));
}
export function max(...a         )        {
  const xs          = a.length === 1 && Array.isArray(a[0]) ? a[0] : a.length === 1 && a[0] instanceof PropList ? a[0].values : a;
  if (!xs.length) return 0;
  return xs.reduce((m, x) => (gt(x, m) ? x : m));
}

// ---- math ----------------------------------------------------------------------------------
export const pi = Math.PI;
export function sin(x       )         { return Math.sin(num(x)); }
export function cos(x       )         { return Math.cos(num(x)); }
export function atan(x       )         { return Math.atan(num(x)); }
export function sqrt(x       )         { return Math.sqrt(num(x)); }
export function power(a       , b       )         { return Math.pow(num(a), num(b)); }
export const maxinteger = 2147483647;

// ---- random --------------------------------------------------------------------------------
// TODO(faithful): the D6 projector's generator is not decoded (decomp/notes/runtime.md, "Builtins").
let rng               = Math.random;
/** Repeatable sequence for debugging (`?seed=`); mulberry32. */
export function setRandomSeed(seed        )       {
  let s = seed >>> 0;
  rng = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** `random(n)`: integer 1..n. */
export function random(n       )         {
  const m = Math.trunc(num(n));
  if (m < 1) return 1;
  return 1 + Math.floor(rng() * m);
}

// ---- value() -------------------------------------------------------------------------------
/** `value(string)`: evaluates a Lingo literal (numbers, strings, symbols, lists, property lists,
 * VOID/TRUE/FALSE). The game uses it to parse voice.cpd (decomp/formats/voice_cpd.md). Anything
 * that is not a literal (an expression or variable name) gives VOID. */
export function value(src       )        {
  if (typeof src !== 'string') return src;
  const p = new LiteralParser(src);
  try {
    p.ws();
    if (p.eof()) return VOID;
    const v = p.parse();
    p.ws();
    return p.eof() ? v : VOID;
  } catch {
    return VOID;
  }
}
class LiteralParser {
  s        ; i = 0;
  constructor(s        ) { this.s = s; }
  eof()          { return this.i >= this.s.length; }
  ws()       {
    while (!this.eof()) {
      const c = this.s[this.i];
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n' || c === '¬') this.i++; // ¬ = line continuation
      else break;
    }
  }
  parse()        {
    this.ws();
    const c = this.s[this.i];
    if (c === '[') return this.list();
    if (c === '"') { const j = this.s.indexOf('"', this.i + 1); if (j < 0) throw new Error('string'); const t = this.s.substring(this.i + 1, j); this.i = j + 1; return t; }
    if (c === '#') { this.i++; return sym(this.ident()); }
    const m = /^[-+]?(\d+\.\d*|\.\d+|\d+)/.exec(this.s.substring(this.i));
    if (m) { this.i += m[0].length; return m[0].includes('.') ? float(Number(m[0])) : Number(m[0]); }
    const id = this.ident().toLowerCase();
    if (id === 'void') return VOID;
    if (id === 'true') return 1;
    if (id === 'false') return 0;
    if (id === 'empty') return '';
    throw new Error('not a literal');
  }
  ident()         {
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.s.substring(this.i));
    if (!m) throw new Error('ident');
    this.i += m[0].length;
    return m[0];
  }
  list()        {
    this.i++; this.ws();
    if (this.s[this.i] === ':') { this.i++; this.ws(); if (this.s[this.i] !== ']') throw new Error('[:]'); this.i++; return new PropList(); }
    if (this.s[this.i] === ']') { this.i++; return []; }
    const items          = []; let prop                  = null;
    for (;;) {
      const v = this.parse(); this.ws();
      if (this.s[this.i] === ':') {
        this.i++;
        const w = this.parse();
        if (!prop) { if (items.length) throw new Error('mixed list'); prop = new PropList(); }
        prop.keys.push(v); prop.values.push(w); this.ws();
      } else {
        if (prop) throw new Error('mixed list');
        items.push(v);
      }
      if (this.s[this.i] === ',') { this.i++; continue; }
      if (this.s[this.i] === ']') { this.i++; return prop ?? items; }
      throw new Error('list');
    }
  }
}
