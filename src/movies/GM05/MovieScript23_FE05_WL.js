// GM05.dxr MovieScript 23 - FE05_WL (decomp/GM05/scripts/MovieScript 23 - FE05_WL.ls)
import { add, eq, propList, sym,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript23_FE05_WL              = {
  // GM05.dxr #23 on getWordDataList wNiveau
  getWordDataList(wNiveau       ) {
    const myList        = [];
    if (eq(wNiveau, 1)) {
      add(myList, propList(sym('W'), 'AAP', sym('T'), 101, sym('LG'), 1));
      add(myList, propList(sym('W'), 'ARM', sym('T'), 102, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BAD', sym('T'), 103, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BAL', sym('T'), 104, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BED', sym('T'), 105, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BEEN', sym('T'), 106, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BEER', sym('T'), 107, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BEL', sym('T'), 108, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BOOM', sym('T'), 109, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BOOT', sym('T'), 110, sym('LG'), 1));
      add(myList, propList(sym('W'), 'BUS', sym('T'), 111, sym('LG'), 1));
      add(myList, propList(sym('W'), 'DAK', sym('T'), 112, sym('LG'), 1));
      add(myList, propList(sym('W'), 'DEUR', sym('T'), 113, sym('LG'), 1));
      add(myList, propList(sym('W'), 'DOOS', sym('T'), 114, sym('LG'), 1));
      add(myList, propList(sym('W'), 'EI', sym('T'), 115, sym('LG'), 1));
      add(myList, propList(sym('W'), 'GEIT', sym('T'), 116, sym('LG'), 1));
      add(myList, propList(sym('W'), 'HAAR', sym('T'), 117, sym('LG'), 1));
      add(myList, propList(sym('W'), 'HAAS', sym('T'), 118, sym('LG'), 1));
      add(myList, propList(sym('W'), 'HEK', sym('T'), 119, sym('LG'), 1));
      add(myList, propList(sym('W'), 'HOED', sym('T'), 120, sym('LG'), 1));
      add(myList, propList(sym('W'), 'HUIS', sym('T'), 121, sym('LG'), 1));
      add(myList, propList(sym('W'), 'JAS', sym('T'), 122, sym('LG'), 1));
      add(myList, propList(sym('W'), 'KAAS', sym('T'), 123, sym('LG'), 1));
      add(myList, propList(sym('W'), 'KAM', sym('T'), 124, sym('LG'), 1));
      add(myList, propList(sym('W'), 'KAR', sym('T'), 125, sym('LG'), 1));
      add(myList, propList(sym('W'), 'MAAN', sym('T'), 128, sym('LG'), 1));
      add(myList, propList(sym('W'), 'MES', sym('T'), 129, sym('LG'), 1));
      add(myList, propList(sym('W'), 'MIER', sym('T'), 130, sym('LG'), 1));
      add(myList, propList(sym('W'), 'MOK', sym('T'), 131, sym('LG'), 1));
      add(myList, propList(sym('W'), 'MOND', sym('T'), 132, sym('LG'), 1));
      add(myList, propList(sym('W'), 'MUUR', sym('T'), 134, sym('LG'), 1));
      add(myList, propList(sym('W'), 'OOG', sym('T'), 135, sym('LG'), 1));
      add(myList, propList(sym('W'), 'OOR', sym('T'), 136, sym('LG'), 1));
      add(myList, propList(sym('W'), 'PAN', sym('T'), 137, sym('LG'), 1));
      add(myList, propList(sym('W'), 'PEN', sym('T'), 138, sym('LG'), 1));
      add(myList, propList(sym('W'), 'PET', sym('T'), 139, sym('LG'), 1));
      add(myList, propList(sym('W'), 'POT', sym('T'), 141, sym('LG'), 1));
      add(myList, propList(sym('W'), 'RAAM', sym('T'), 142, sym('LG'), 1));
      add(myList, propList(sym('W'), 'ROK', sym('T'), 143, sym('LG'), 1));
      add(myList, propList(sym('W'), 'SOK', sym('T'), 144, sym('LG'), 1));
      add(myList, propList(sym('W'), 'TAS', sym('T'), 145, sym('LG'), 1));
      add(myList, propList(sym('W'), 'TEEN', sym('T'), 146, sym('LG'), 1));
      add(myList, propList(sym('W'), 'VAAS', sym('T'), 147, sym('LG'), 1));
      add(myList, propList(sym('W'), 'VEER', sym('T'), 148, sym('LG'), 1));
      add(myList, propList(sym('W'), 'ZAK', sym('T'), 152, sym('LG'), 1));
    } else {
      if (eq(wNiveau, 2)) {
        add(myList, propList(sym('W'), 'APPEL', sym('T'), 201, sym('LG'), 2));
        add(myList, propList(sym('W'), 'BAARD', sym('T'), 202, sym('LG'), 1));
        add(myList, propList(sym('W'), 'BANAAN', sym('T'), 203, sym('LG'), 2));
        add(myList, propList(sym('W'), 'BEKER', sym('T'), 205, sym('LG'), 2));
        add(myList, propList(sym('W'), 'BOEK', sym('T'), 206, sym('LG'), 1));
        add(myList, propList(sym('W'), 'BORD', sym('T'), 207, sym('LG'), 1));
        add(myList, propList(sym('W'), 'BRIL', sym('T'), 208, sym('LG'), 1));
        add(myList, propList(sym('W'), 'BROOD', sym('T'), 209, sym('LG'), 1));
        add(myList, propList(sym('W'), 'DOEK', sym('T'), 210, sym('LG'), 1));
        add(myList, propList(sym('W'), 'DUIM', sym('T'), 211, sym('LG'), 1));
        add(myList, propList(sym('W'), 'EMMER', sym('T'), 213, sym('LG'), 2));
        add(myList, propList(sym('W'), 'FLES', sym('T'), 214, sym('LG'), 1));
        add(myList, propList(sym('W'), 'GLAS', sym('T'), 215, sym('LG'), 1));
        add(myList, propList(sym('W'), 'HAMER', sym('T'), 216, sym('LG'), 2));
        add(myList, propList(sym('W'), 'HAND', sym('T'), 217, sym('LG'), 1));
        add(myList, propList(sym('W'), 'KAARS', sym('T'), 219, sym('LG'), 1));
        add(myList, propList(sym('W'), 'KAST', sym('T'), 220, sym('LG'), 1));
        add(myList, propList(sym('W'), 'KERS', sym('T'), 221, sym('LG'), 1));
        add(myList, propList(sym('W'), 'KIES', sym('T'), 222, sym('LG'), 1));
        add(myList, propList(sym('W'), 'KLOK', sym('T'), 223, sym('LG'), 1));
        add(myList, propList(sym('W'), 'KNOOP', sym('T'), 224, sym('LG'), 1));
        add(myList, propList(sym('W'), 'LAARS', sym('T'), 225, sym('LG'), 1));
        add(myList, propList(sym('W'), 'LAMP', sym('T'), 226, sym('LG'), 1));
        add(myList, propList(sym('W'), 'LEPEL', sym('T'), 227, sym('LG'), 2));
        add(myList, propList(sym('W'), 'LIJN', sym('T'), 229, sym('LG'), 1));
        add(myList, propList(sym('W'), 'MAND', sym('T'), 230, sym('LG'), 1));
        add(myList, propList(sym('W'), 'NEUS', sym('T'), 232, sym('LG'), 1));
        add(myList, propList(sym('W'), 'PINK', sym('T'), 233, sym('LG'), 1));
        add(myList, propList(sym('W'), 'RIEM', sym('T'), 235, sym('LG'), 1));
        add(myList, propList(sym('W'), 'RING', sym('T'), 236, sym('LG'), 1));
        add(myList, propList(sym('W'), 'SNOR', sym('T'), 237, sym('LG'), 1));
        add(myList, propList(sym('W'), 'STEEN', sym('T'), 238, sym('LG'), 1));
        add(myList, propList(sym('W'), 'STER', sym('T'), 239, sym('LG'), 1));
        add(myList, propList(sym('W'), 'STOK', sym('T'), 240, sym('LG'), 1));
        add(myList, propList(sym('W'), 'TAART', sym('T'), 241, sym('LG'), 1));
        add(myList, propList(sym('W'), 'TAND', sym('T'), 242, sym('LG'), 1));
        add(myList, propList(sym('W'), 'TANG', sym('T'), 243, sym('LG'), 1));
        add(myList, propList(sym('W'), 'TRAM', sym('T'), 245, sym('LG'), 1));
        add(myList, propList(sym('W'), 'TRUI', sym('T'), 246, sym('LG'), 1));
        add(myList, propList(sym('W'), 'VEST', sym('T'), 247, sym('LG'), 1));
        add(myList, propList(sym('W'), 'VLAG', sym('T'), 248, sym('LG'), 1));
        add(myList, propList(sym('W'), 'VOET', sym('T'), 249, sym('LG'), 1));
        add(myList, propList(sym('W'), 'VORK', sym('T'), 251, sym('LG'), 1));
        add(myList, propList(sym('W'), 'WOLK', sym('T'), 252, sym('LG'), 1));
      } else {
        if (eq(wNiveau, 3)) {
          add(myList, propList(sym('W'), 'AUTO', sym('T'), 301, sym('LG'), 2));
          add(myList, propList(sym('W'), 'BALLON', sym('T'), 303, sym('LG'), 2));
          add(myList, propList(sym('W'), 'BLOEM', sym('T'), 304, sym('LG'), 1));
          add(myList, propList(sym('W'), 'BRIEF', sym('T'), 305, sym('LG'), 1));
          add(myList, propList(sym('W'), 'BROEK', sym('T'), 306, sym('LG'), 1));
          add(myList, propList(sym('W'), 'CIRKEL', sym('T'), 307, sym('LG'), 2));
          add(myList, propList(sym('W'), 'DOUCHE', sym('T'), 308, sym('LG'), 1));
          add(myList, propList(sym('W'), 'DRIEHOEK', sym('T'), 309, sym('LG'), 2));
          add(myList, propList(sym('W'), 'DRUIF', sym('T'), 311, sym('LG'), 1));
          add(myList, propList(sym('W'), 'DRUPPEL', sym('T'), 312, sym('LG'), 2));
          add(myList, propList(sym('W'), 'FIETS', sym('T'), 314, sym('LG'), 1));
          add(myList, propList(sym('W'), 'HORLOGE', sym('T'), 316, sym('LG'), 2));
          add(myList, propList(sym('W'), 'KOFFER', sym('T'), 317, sym('LG'), 2));
          add(myList, propList(sym('W'), 'KOPJE', sym('T'), 318, sym('LG'), 2));
          add(myList, propList(sym('W'), 'KRANT', sym('T'), 319, sym('LG'), 1));
          add(myList, propList(sym('W'), 'KRUIS', sym('T'), 320, sym('LG'), 1));
          add(myList, propList(sym('W'), 'KWAST', sym('T'), 321, sym('LG'), 1));
          add(myList, propList(sym('W'), 'LUCIFER', sym('T'), 322, sym('LG'), 2));
          add(myList, propList(sym('W'), 'MUTS', sym('T'), 323, sym('LG'), 1));
          add(myList, propList(sym('W'), 'PARAPLU', sym('T'), 324, sym('LG'), 2));
          add(myList, propList(sym('W'), 'PLANK', sym('T'), 325, sym('LG'), 1));
          add(myList, propList(sym('W'), 'PLANT', sym('T'), 326, sym('LG'), 1));
          add(myList, propList(sym('W'), 'POTLOOD', sym('T'), 327, sym('LG'), 2));
          add(myList, propList(sym('W'), 'RADIO', sym('T'), 328, sym('LG'), 2));
          add(myList, propList(sym('W'), 'SCHAAR', sym('T'), 329, sym('LG'), 1));
          add(myList, propList(sym('W'), 'SCHELP', sym('T'), 330, sym('LG'), 1));
          add(myList, propList(sym('W'), 'SCHEP', sym('T'), 331, sym('LG'), 1));
          add(myList, propList(sym('W'), 'SCHIP', sym('T'), 332, sym('LG'), 1));
          add(myList, propList(sym('W'), 'SCHOTEL', sym('T'), 333, sym('LG'), 2));
          add(myList, propList(sym('W'), 'SJAAL', sym('T'), 334, sym('LG'), 1));
          add(myList, propList(sym('W'), 'SLEUTEL', sym('T'), 335, sym('LG'), 2));
          add(myList, propList(sym('W'), 'SPIJKER', sym('T'), 336, sym('LG'), 2));
          add(myList, propList(sym('W'), 'STOEL', sym('T'), 337, sym('LG'), 1));
          add(myList, propList(sym('W'), 'STREEP', sym('T'), 338, sym('LG'), 1));
          add(myList, propList(sym('W'), 'STRIK', sym('T'), 339, sym('LG'), 1));
          add(myList, propList(sym('W'), 'TAFEL', sym('T'), 340, sym('LG'), 2));
          add(myList, propList(sym('W'), 'TELEFOON', sym('T'), 341, sym('LG'), 2));
          add(myList, propList(sym('W'), 'THEEPOT', sym('T'), 342, sym('LG'), 2));
          add(myList, propList(sym('W'), 'TOMAAT', sym('T'), 343, sym('LG'), 2));
          add(myList, propList(sym('W'), 'TREIN', sym('T'), 344, sym('LG'), 1));
          add(myList, propList(sym('W'), 'VIERKANT', sym('T'), 345, sym('LG'), 2));
          add(myList, propList(sym('W'), 'VLIEGER', sym('T'), 347, sym('LG'), 2));
          add(myList, propList(sym('W'), 'WASKNIJPER', sym('T'), 348, sym('LG'), 2));
          add(myList, propList(sym('W'), 'WEKKER', sym('T'), 350, sym('LG'), 2));
          add(myList, propList(sym('W'), 'WORST', sym('T'), 351, sym('LG'), 1));
          add(myList, propList(sym('W'), 'ZONNEBRIL', sym('T'), 352, sym('LG'), 2));
        }
      }
    }
    return myList;
  },
};
