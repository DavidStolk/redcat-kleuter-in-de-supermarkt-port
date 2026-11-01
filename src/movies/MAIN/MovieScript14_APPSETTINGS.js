// MAIN.dxr MovieScript 14 - APPSETTINGS (decomp/MAIN/scripts/MovieScript 14 - APPSETTINGS.ls)
import { G, the } from '../../runtime/api.js';
import { cat, getaProp, setaProp, sym } from '../../runtime/lingo.js';
                                                            

export const MovieScript14_APPSETTINGS              = {
  // MAIN.dxr #14 on initAppSettings
  initAppSettings() {
    const myPath = getaProp(G.gAppSettings, sym('PATH_DATA'));
    const myIniFile = cat(myPath, 'DREF.ini');
    setaProp(G.gAppSettings, sym('IniFile'), myIniFile);
    setaProp(G.gAppSettings, sym('HELP'), 1);
    setaProp(G.gAppSettings, sym('PLAYER_LEVEL'), 1);
    setaProp(G.gAppSettings, sym('VSCALE_MUSIC'), [-10000, -4800, -4000, -3100, -2700, -2400, -2200, -2050, -1750, -1450, -1250, -1050, -900]);
    setaProp(G.gAppSettings, sym('VOLUME_MUSIC'), -900);
    setaProp(G.gAppSettings, sym('VSCALE_VOICE'), [-10000, -5000, -3500, -2450, -1800, -1300, -900, -750, -550, -350, -250, -150, 0]);
    setaProp(G.gAppSettings, sym('VOLUME_VOICE'), 0);
    setaProp(G.gAppSettings, sym('VSCALE_SNDFX'), [-10000, -4600, -3700, -3300, -2800, -2450, -2000, -1750, -1450, -1200, -1050, -800, -550]);
    setaProp(G.gAppSettings, sym('VOLUME_SNDFX'), -550);
    setaProp(G.gAppSettings, sym('BTN_FB_DELAY'), 8);
    setaProp(G.gAppSettings, sym('INTRO_VOLUME_MUSIC'), -1450);
    setaProp(G.gAppSettings, sym('INTRO_VOLUME_VOICE'), 0);
    setaProp(G.gAppSettings, sym('INTRO_VOLUME_SNDFX'), 0);
    setaProp(G.gAppSettings, sym('INTRO_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('INTRO_PATH_VOICE'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('INTRO_PATH_SNDFX'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('MNU_UL'), 1);
    setaProp(G.gAppSettings, sym('MNU_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('MNU_PATH_VOICE'), cat(myPath, 'FE_00\\AUDIO\\VOICE\\'));
    setaProp(G.gAppSettings, sym('MNU_PATH_SNDFX'), cat(myPath, 'FE_00\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('MNU_FILE_MUSIC'), 'MUSIC_MN.wav');
    setaProp(G.gAppSettings, sym('OPT_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('OPT_PATH_VOICE'), cat(myPath, 'FE_00\\AUDIO\\VOICE\\'));
    setaProp(G.gAppSettings, sym('OPT_PATH_SNDFX'), cat(myPath, 'FE_00\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('OPT_FILE_MUSIC'), 'MUSIC_MN.wav');
    setaProp(G.gAppSettings, sym('FE01_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('FE01_PATH_VOICE'), cat(myPath, 'FE_01\\AUDIO\\VOICEM\\'));
    setaProp(G.gAppSettings, sym('FE01_PATH_SNDFX'), cat(myPath, 'FE_01\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('FE01_FILE_MUSIC'), 'MUSIC_G1.wav');
    setaProp(G.gAppSettings, sym('FE01_FIXED_B_TYPE'), 0);
    setaProp(G.gAppSettings, sym('FE01_FIXED_PAIRPOS'), 0);
    setaProp(G.gAppSettings, sym('FE02_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('FE02_PATH_VOICE'), cat(myPath, 'FE_02\\AUDIO\\VOICEM\\'));
    setaProp(G.gAppSettings, sym('FE02_PATH_SNDFX'), cat(myPath, 'FE_02\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('FE02_FILE_MUSIC'), 'MUSIC_G2.wav');
    setaProp(G.gAppSettings, sym('FE02_FIXED_BC_TYPE'), 0);
    setaProp(G.gAppSettings, sym('FE02_FIXED_WLST'), 0);
    setaProp(G.gAppSettings, sym('FE03_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('FE03_PATH_VOICE'), cat(myPath, 'FE_03\\AUDIO\\VOICE\\'));
    setaProp(G.gAppSettings, sym('FE03_PATH_SNDFX'), cat(myPath, 'FE_03\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('FE03_FILE_MUSIC'), 'MUSIC_G3.wav');
    setaProp(G.gAppSettings, sym('FE04_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('FE04_PATH_VOICE'), cat(myPath, 'FE_04\\AUDIO\\VOICEM\\'));
    setaProp(G.gAppSettings, sym('FE04_PATH_SNDFX'), cat(myPath, 'FE_04\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('FE04_FILE_MUSIC'), 'MUSIC_G4.wav');
    setaProp(G.gAppSettings, sym('FE04_FIXED_LC_TYPE'), 0);
    setaProp(G.gAppSettings, sym('FE05_PATH_MUSIC'), cat(the.pathName, 'DATA2\\'));
    setaProp(G.gAppSettings, sym('FE05_PATH_VOICE'), cat(myPath, 'FE_05\\AUDIO\\VOICE\\'));
    setaProp(G.gAppSettings, sym('FE05_PATH_SNDFX'), cat(myPath, 'FE_05\\AUDIO\\SNDFX\\'));
    setaProp(G.gAppSettings, sym('FE05_FILE_MUSIC'), 'MUSIC_G5.wav');
    setaProp(G.gAppSettings, sym('FE05_FIXED_BC_TYPE'), 0);
    setaProp(G.gAppSettings, sym('FE05_FIXED_WLST'), 0);
  },
};
