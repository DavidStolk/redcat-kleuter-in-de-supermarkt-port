// MENU.dxr MovieScript 25 - FileIO_Handlers (decomp/MENU/scripts/MovieScript 25 - FileIO_Handlers.ls)
import { closeFile, newObject, OpenFile, readFile, xtra } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript25_FileIO_Handlers              = {
  // MENU.dxr #25 on readTextFile wFile
  readTextFile(wFile       ) {
    let myFileIO = newObject(xtra('FILEIO'));
    OpenFile(myFileIO, wFile, 1);
    const myFileString = readFile(myFileIO);
    closeFile(myFileIO);
    myFileIO = VOID;
    return myFileString;
  },
};
