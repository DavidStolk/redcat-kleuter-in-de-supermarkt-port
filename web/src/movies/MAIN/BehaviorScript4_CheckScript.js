// MAIN.dxr BehaviorScript 4 - CheckScript (decomp/MAIN/scripts/BehaviorScript 4 - CheckScript.ls)
import { call, G, GetDriveType, getNthFileNameInFolder, go, movieCall, quit, ReadINI, the } from '../../runtime/api.js';
import { add, cat, charOf, EMPTY, eq, length, propList, setaProp, sym, truthy, VOID,            } from '../../runtime/lingo.js';
import { LingoScript } from '../../runtime/scripts.js';

export class CheckScript extends LingoScript {
  static scriptName = 'CheckScript';
  pFS        = VOID; pFH        = VOID; pProject_Path        = VOID; pProject_File        = VOID;
  pCdromDrives_List        = VOID; pDRF_INI_File        = VOID; pDRF_INI_Section        = VOID;
  pDRF_INI_Key        = VOID; pDRF_INI_Code        = VOID;

  // MAIN.dxr #4 on beginSprite me
  beginSprite()        {
    G.gAppSettings = propList();
    setaProp(G.gAppSettings, sym('CURSOR_LEFT'), 5);
    setaProp(G.gAppSettings, sym('CURSOR_TOP'), 5);
    setaProp(G.gAppSettings, sym('CURSOR_RIGHT'), 635);
    setaProp(G.gAppSettings, sym('CURSOR_BOTTOM'), 475);
    this.pDRF_INI_File = 'DREF.ini';
    this.pDRF_INI_Section = 'DREF';
    this.pDRF_INI_Key = 'REF';
    this.pDRF_INI_Code = 'DAVI199901';
    this.pProject_Path = 'DATA\\';
    this.pProject_File = 'START';
    this.pFS = sym('FS_CHECK');
    this.pFH = 24;
  }

  // MAIN.dxr #4 on exitFrame me
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

  // MAIN.dxr #4 on FS_START me
  FS_START()        {
    movieCall('initAppSettings');
    go('START');
  }

  // MAIN.dxr #4 on FS_CHECK me
  FS_CHECK()        {
    this.pFS = 0;
    if (eq(ReadINI(cat(the.pathName, 'NOCD.ini'), 'KOOP', 'DIE'), 'CD')) {
      if (!truthy(this.Check4MaxInstall())) {
        quit();
      } else {
        this.pFS = sym('FS_START');
      }
    } else {
      if (!truthy(this.Check4CD())) {
        go('NOCD');
        return;
      }
      this.Check4MaxInstall();
      this.pFS = sym('FS_START');
    }
  }

  // MAIN.dxr #4 on Check4CD me
  Check4CD()        {
    this.pCdromDrives_List = [];
    const myTemp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const myCount = length(myTemp);
    for (let i = 1; i <= myCount; i++) {
      const myDrive = cat(charOf(myTemp, i), ':');
      if (eq(GetDriveType(myDrive), 5)) {
        add(this.pCdromDrives_List, cat(myDrive, '\\rcksetup\\'));
      }
    }
    let myFound = 0;
    for (const myDrive of this.pCdromDrives_List.slice()) {
      if (truthy(this.fileExist(cat(myDrive, this.pProject_Path), this.pDRF_INI_File))) {
        if (truthy(this.checkdrefCode(myDrive))) {
          myFound = 1;
          setaProp(G.gAppSettings, sym('PATH_DATA'), cat(myDrive, 'DATA\\'));
          break;
        }
      }
    }
    return myFound;
  }

  // MAIN.dxr #4 on Check4MaxInstall me
  Check4MaxInstall()        {
    let myFound = 0;
    if (truthy(this.fileExist(cat(the.pathName, this.pProject_Path), this.pDRF_INI_File))) {
      if (truthy(this.checkdrefCode(the.pathName))) {
        setaProp(G.gAppSettings, sym('PATH_DATA'), cat(the.pathName, 'DATA\\'));
        myFound = 1;
      }
    }
    return myFound;
  }

  // MAIN.dxr #4 on checkdrefCode me, wPath
  checkdrefCode(wPath       )        {
    const myCheck = ReadINI(cat(wPath, this.pProject_Path, this.pDRF_INI_File), this.pDRF_INI_Section, this.pDRF_INI_Key);
    if (eq(myCheck, this.pDRF_INI_Code)) {
      return 1;
    } else {
      return 0;
    }
  }

  // MAIN.dxr #4 on fileExist me, wPath, wFile
  fileExist(wPath       , wFile       )        {
    let myFileFound        = VOID;
    for (let i = 1, n = the.maxinteger; i <= n; i++) {
      myFileFound = getNthFileNameInFolder(wPath, i);
      if (eq(myFileFound, EMPTY) || eq(myFileFound, wFile)) {
        break;
      }
    }
    if (eq(myFileFound, wFile)) {
      return 1;
    } else {
      return 0;
    }
  }
}
