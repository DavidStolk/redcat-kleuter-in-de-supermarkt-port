// DirectOS Xtra 1.2.2 (001.x32) and FileIO Xtra (003.x32) replacements; decomp/notes/xtras.md.
// The DirectSound Xtra is in directsound.ts.
import { VIRTUAL_ROOT,             } from './assets.js';

/** Win32 GetPrivateProfileString as DirectOS `ReadINI(file, section, key)`: section and key match
 * case-insensitively, the value is trimmed, "" when the file, section or key is missing. */
export function parseIni(text        , section        , key        )         {
  let inSection = false;
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = raw.trim();
    if (line === '' || line.startsWith(';')) continue;
    if (line.startsWith('[')) {
      const end = line.indexOf(']');
      inSection = end > 0 && line.substring(1, end).trim().toLowerCase() === section.toLowerCase();
      continue;
    }
    if (!inSection) continue;
    const eq = line.indexOf('=');
    if (eq > 0 && line.substring(0, eq).trim().toLowerCase() === key.toLowerCase()) {
      let v = line.substring(eq + 1).trim();
      if (v.length >= 2 && ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"))) v = v.substring(1, v.length - 1);
      return v;
    }
  }
  return '';
}

/** Win32 GetDriveType result codes the game tests. */
export const DRIVE_NO_ROOT_DIR = 1;
export const DRIVE_CDROM = 5;

export class DirectOS {
          assets        ;
  /** Moves the game's view of the mouse (see DECISIONS.md "Cursor confinement", option (a)). */
          setMouse                                ;
  constructor(assets        , setMouse                                ) { this.assets = assets; this.setMouse = setMouse; }

  /** `SetCursorPos(x, y)`: screen coordinates; the stage is at screen (0, 0) (`the stageLeft/Top`). */
  SetCursorPos(x         , y         )         { this.setMouse(Number(x) || 0, Number(y) || 0); return 0; }
  /** `KeysBlock()` / `KeysUnBlock()`: no browser equivalent (DEVIATIONS.md). */
  KeysBlock()         { return 0; }
  KeysUnBlock()         { return 0; }
  ReadINI(file         , section         , key         )         {
    if (!this.assets.exists(String(file))) return '';
    return parseIni(this.assets.textFile(String(file)), String(section), String(key));
  }
  /** `GetDriveType("D:")`: the virtual CD drive is a CD-ROM; every other letter has no root dir. */
  GetDriveType(root         )         {
    const r = String(root).toUpperCase().replace(/\\$/, '');
    return r === VIRTUAL_ROOT.substring(0, 2).toUpperCase() ? DRIVE_CDROM : DRIVE_NO_ROOT_DIR;
  }
}

/** FileIO instance (`new(xtra("FILEIO"))`): read-only access to the preloaded text files. */
export class FileIO {
          assets        ;
          file                = null;
  constructor(assets        ) { this.assets = assets; }
  openFile(name         , _mode         )         { this.file = String(name); return 0; }
  readFile()         { return this.file === null ? '' : this.assets.textFile(this.file); }
  closeFile()         { this.file = null; return 0; }
}
