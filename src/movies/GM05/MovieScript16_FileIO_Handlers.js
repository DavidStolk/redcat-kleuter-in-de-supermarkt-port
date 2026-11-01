// GM05.dxr MovieScript 16 - FileIO_Handlers (decomp/GM05/scripts/MovieScript 16 - FileIO_Handlers.ls)
import { closeFile, newObject, OpenFile, readFile, xtra } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript16_FileIO_Handlers              = {
  // GM05.dxr #16 on readTextFile wFile
  readTextFile(wFile       ) {
    let myFileIO = newObject(xtra('FILEIO'));
    OpenFile(myFileIO, wFile, 1);
    const myFileString = readFile(myFileIO);
    closeFile(myFileIO);
    myFileIO = VOID;
    return myFileString;
  },
};
