// GM01.dxr MovieScript 23 - FileIO_Handlers (decomp/GM01/scripts/MovieScript 23 - FileIO_Handlers.ls)
import { closeFile, newObject, OpenFile, readFile, xtra } from '../../runtime/api.js';
import { VOID,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript23_FileIO_Handlers              = {
  // GM01.dxr #23 on readTextFile wFile
  readTextFile(wFile       ) {
    let myFileIO = newObject(xtra('FILEIO'));
    OpenFile(myFileIO, wFile, 1);
    const myFileString = readFile(myFileIO);
    closeFile(myFileIO);
    myFileIO = VOID;
    return myFileString;
  },
};
