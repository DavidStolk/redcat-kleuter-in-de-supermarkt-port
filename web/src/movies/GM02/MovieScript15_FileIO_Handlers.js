// GM02.dxr MovieScript 15 - FileIO_Handlers (decomp/GM02/scripts/MovieScript 15 - FileIO_Handlers.ls)
import { closeFile, newObject, OpenFile, readFile, xtra } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript15_FileIO_Handlers              = {
  // GM02.dxr #15 on readTextFile wFile
  readTextFile(wFile       ) {
    let myFileIO = newObject(xtra('FILEIO'));
    OpenFile(myFileIO, wFile, 1);
    const myFileString = readFile(myFileIO);
    closeFile(myFileIO);
    myFileIO = VOID;
    return myFileString;
  },
};
