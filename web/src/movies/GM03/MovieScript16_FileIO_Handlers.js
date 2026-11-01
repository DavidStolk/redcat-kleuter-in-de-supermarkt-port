// GM03.dxr MovieScript 16 - FileIO_Handlers (decomp/GM03/scripts/MovieScript 16 - FileIO_Handlers.ls)
import { closeFile, newObject, OpenFile, readFile, xtra } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript16_FileIO_Handlers              = {
  // GM03.dxr #16 on readTextFile wFile
  readTextFile(wFile       ) {
    let myFileIO = newObject(xtra('FILEIO'));
    OpenFile(myFileIO, wFile, 1);
    const myFileString = readFile(myFileIO);
    closeFile(myFileIO);
    myFileIO = VOID;
    return myFileString;
  },
};
