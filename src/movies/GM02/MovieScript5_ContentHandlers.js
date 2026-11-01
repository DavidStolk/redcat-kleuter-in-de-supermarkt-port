// GM02.dxr MovieScript 5 - ContentHandlers (decomp/GM02/scripts/MovieScript 5 - ContentHandlers.ls)
import { add, eq, propList, sym,            } from '../../runtime/lingo.js';
                                                            

export const MovieScript5_ContentHandlers              = {
  // GM02.dxr #5 on getWordDataList wNiveau
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
        add(myList, propList(sym('W'), 'APPEL', sym('T'), 201));
        add(myList, propList(sym('W'), 'BAARD', sym('T'), 202));
        add(myList, propList(sym('W'), 'BANAAN', sym('T'), 203));
        add(myList, propList(sym('W'), 'BEKER', sym('T'), 205));
        add(myList, propList(sym('W'), 'BOEK', sym('T'), 206));
        add(myList, propList(sym('W'), 'BORD', sym('T'), 207));
        add(myList, propList(sym('W'), 'BRIL', sym('T'), 208));
        add(myList, propList(sym('W'), 'BROOD', sym('T'), 209));
        add(myList, propList(sym('W'), 'DOEK', sym('T'), 210));
        add(myList, propList(sym('W'), 'DUIM', sym('T'), 211));
        add(myList, propList(sym('W'), 'EMMER', sym('T'), 213));
        add(myList, propList(sym('W'), 'FLES', sym('T'), 214));
        add(myList, propList(sym('W'), 'GLAS', sym('T'), 215));
        add(myList, propList(sym('W'), 'HAMER', sym('T'), 216));
        add(myList, propList(sym('W'), 'HAND', sym('T'), 217));
        add(myList, propList(sym('W'), 'KAARS', sym('T'), 219));
        add(myList, propList(sym('W'), 'KAST', sym('T'), 220));
        add(myList, propList(sym('W'), 'KERS', sym('T'), 221));
        add(myList, propList(sym('W'), 'KIES', sym('T'), 222));
        add(myList, propList(sym('W'), 'KLOK', sym('T'), 223));
        add(myList, propList(sym('W'), 'KNOOP', sym('T'), 224));
        add(myList, propList(sym('W'), 'LAARS', sym('T'), 225));
        add(myList, propList(sym('W'), 'LAMP', sym('T'), 226));
        add(myList, propList(sym('W'), 'LEPEL', sym('T'), 227));
        add(myList, propList(sym('W'), 'LIJN', sym('T'), 229));
        add(myList, propList(sym('W'), 'MAND', sym('T'), 230));
        add(myList, propList(sym('W'), 'NEUS', sym('T'), 232));
        add(myList, propList(sym('W'), 'PINK', sym('T'), 233));
        add(myList, propList(sym('W'), 'RIEM', sym('T'), 235));
        add(myList, propList(sym('W'), 'RING', sym('T'), 236));
        add(myList, propList(sym('W'), 'SNOR', sym('T'), 237));
        add(myList, propList(sym('W'), 'STEEN', sym('T'), 238));
        add(myList, propList(sym('W'), 'STER', sym('T'), 239));
        add(myList, propList(sym('W'), 'STOK', sym('T'), 240));
        add(myList, propList(sym('W'), 'TAART', sym('T'), 241));
        add(myList, propList(sym('W'), 'TAND', sym('T'), 242));
        add(myList, propList(sym('W'), 'TANG', sym('T'), 243));
        add(myList, propList(sym('W'), 'TRAM', sym('T'), 245));
        add(myList, propList(sym('W'), 'TRUI', sym('T'), 246));
        add(myList, propList(sym('W'), 'VEST', sym('T'), 247));
        add(myList, propList(sym('W'), 'VLAG', sym('T'), 248));
        add(myList, propList(sym('W'), 'VOET', sym('T'), 249));
        add(myList, propList(sym('W'), 'VORK', sym('T'), 251));
        add(myList, propList(sym('W'), 'WOLK', sym('T'), 252));
      } else {
        if (eq(wNiveau, 3)) {
          add(myList, propList(sym('W'), 'AUTO', sym('T'), 301));
          add(myList, propList(sym('W'), 'BALLON', sym('T'), 303));
          add(myList, propList(sym('W'), 'BLOEM', sym('T'), 304));
          add(myList, propList(sym('W'), 'BRIEF', sym('T'), 305));
          add(myList, propList(sym('W'), 'BROEK', sym('T'), 306));
          add(myList, propList(sym('W'), 'CIRKEL', sym('T'), 307));
          add(myList, propList(sym('W'), 'DOUCHE', sym('T'), 308));
          add(myList, propList(sym('W'), 'DRIEHOEK', sym('T'), 309));
          add(myList, propList(sym('W'), 'DRUIF', sym('T'), 311));
          add(myList, propList(sym('W'), 'DRUPPEL', sym('T'), 312));
          add(myList, propList(sym('W'), 'FIETS', sym('T'), 314));
          add(myList, propList(sym('W'), 'HORLOGE', sym('T'), 316));
          add(myList, propList(sym('W'), 'KOFFER', sym('T'), 317));
          add(myList, propList(sym('W'), 'KOPJE', sym('T'), 318));
          add(myList, propList(sym('W'), 'KRANT', sym('T'), 319));
          add(myList, propList(sym('W'), 'KRUIS', sym('T'), 320));
          add(myList, propList(sym('W'), 'KWAST', sym('T'), 321));
          add(myList, propList(sym('W'), 'LUCIFER', sym('T'), 322));
          add(myList, propList(sym('W'), 'MUTS', sym('T'), 323));
          add(myList, propList(sym('W'), 'PARAPLU', sym('T'), 324));
          add(myList, propList(sym('W'), 'PLANK', sym('T'), 325));
          add(myList, propList(sym('W'), 'PLANT', sym('T'), 326));
          add(myList, propList(sym('W'), 'POTLOOD', sym('T'), 327));
          add(myList, propList(sym('W'), 'RADIO', sym('T'), 328));
          add(myList, propList(sym('W'), 'SCHAAR', sym('T'), 329));
          add(myList, propList(sym('W'), 'SCHELP', sym('T'), 330));
          add(myList, propList(sym('W'), 'SCHEP', sym('T'), 331));
          add(myList, propList(sym('W'), 'SCHIP', sym('T'), 332));
          add(myList, propList(sym('W'), 'SCHOTEL', sym('T'), 333));
          add(myList, propList(sym('W'), 'SJAAL', sym('T'), 334));
          add(myList, propList(sym('W'), 'SLEUTEL', sym('T'), 335));
          add(myList, propList(sym('W'), 'SPIJKER', sym('T'), 336));
          add(myList, propList(sym('W'), 'STOEL', sym('T'), 337));
          add(myList, propList(sym('W'), 'STREEP', sym('T'), 338));
          add(myList, propList(sym('W'), 'STRIK', sym('T'), 339));
          add(myList, propList(sym('W'), 'TAFEL', sym('T'), 340));
          add(myList, propList(sym('W'), 'TELEFOON', sym('T'), 341));
          add(myList, propList(sym('W'), 'THEEPOT', sym('T'), 342));
          add(myList, propList(sym('W'), 'TOMAAT', sym('T'), 343));
          add(myList, propList(sym('W'), 'TREIN', sym('T'), 344));
          add(myList, propList(sym('W'), 'VIERKANT', sym('T'), 345));
          add(myList, propList(sym('W'), 'VLIEGER', sym('T'), 347));
          add(myList, propList(sym('W'), 'WASKNIJPER', sym('T'), 348));
          add(myList, propList(sym('W'), 'WEKKER', sym('T'), 350));
          add(myList, propList(sym('W'), 'WORST', sym('T'), 351));
          add(myList, propList(sym('W'), 'ZONNEBRIL', sym('T'), 352));
        }
      }
    }
    return myList;
  },
};
