# Redcat Kleuter 1: In de supermarkt — web version

Play the game in a modern web browser: on a computer, or on an iPad or other tablet. This folder
holds the game program rebuilt for the browser. It contains none of the game's files: you need
your own copy of the CD ([about this repository](../README.md)).

## Playing

1. Open the page: start it on your own computer (see [Running it](#running-it)), or open an
   online copy.
2. The page asks for the game files once:
    - **On a computer:** click **Kies de cd-map** and choose the CD drive, or the `RCKSETUP`
      folder on it or in a copy of it. You can also drag that folder onto the page.
    - **On an iPad or iPhone:** the browser can only choose single files there. So first put the
      CD on the device as one file, then tap **Kies een .zip of .iso**. The file can be either:
      - a `.zip`: copy the CD folder to the Files app, touch and hold it, and choose
        *Compress*; or
      - an `.iso` image of the CD.

      A `.zip` or `.iso` works on a computer too.

    The files are read into this browser's own storage (about 122 MB, a few seconds).
    **They are not uploaded or sent anywhere.**
3. Click or tap **Klik om te beginnen** / **Tik om te beginnen** to start. Browsers only allow
   sound after a click or tap.

On later visits the game starts straight away; the files are still in the browser. To choose
other files, add `?reset=1` to the page's address. Like the original, the game saves nothing
else: the level and options are reset every time.

The game is in Dutch.

### Files that are needed

All of these are under `RCKSETUP` on the CD. Upper or lower case does not matter. The page says
which ones are missing.

| Path | What it is |
|------|------------|
| `LOCAL/MAIN.dxr`, `INTRO.dxr`, `MENU.dxr`, `GM01.dxr` … `GM05.dxr` | The 8 parts of the game |
| `LOCAL/Dxs3.avi` | The logo film at the start |
| `LOCAL/Data2/*.wav` | Music and the voices of the introduction |
| `DATA/DREF.ini` | The CD check |
| `DATA/Fe_00/` … `DATA/FE_05/` | Speech and sounds of the menu and the five games, with a `voice.cpd` in each |
The rest of the CD is not needed (`RCK1.exe`, `XTRAS`, `setup.exe`, `Autorun`, `LEESMIJ`,
`dxsetup`, `Helpdesk`).

## Running it

The page has to come from a web server. Browsers do not run it when you open `index.html`
directly from disk: it stays black or on "Laden...".

### On your own computer

Download the repository (**Code → Download ZIP**, then unpack it, or `git clone` it) and open
its `web` folder. Each starter runs a small web server that only this computer can reach (127.0.0.1, from port 8140 up)
and opens the game in your default browser. Nothing needs to be installed.

- **Windows:** double-click **Start Redcat Kleuter 1.bat**. It uses Windows' own PowerShell.
  Close its window to stop. If Windows warns about a downloaded file: **More info → Run anyway**.
- **Mac:** double-click **Start Redcat Kleuter 1.command**. It uses the Perl that comes with
  macOS (`serve.pl`). Close its Terminal window to stop. The first time, macOS may refuse to open
  it: right-click it, choose **Open**, then **Open** again.
- **Linux:** run `./start-redcat-kleuter.sh` in a terminal (or let your file manager run it). It
  uses Perl (`serve.pl`), or Python 3 when Perl is missing. Press Ctrl+C to stop.
- **By hand**, with any static web server, for example:

    ```sh
    cd redcat-kleuter-in-de-supermarkt-port/web
    python3 -m http.server 8140 --bind 127.0.0.1
    ```

    Then open <http://127.0.0.1:8140/>.

### Browsers

A current Chrome, Edge, Firefox or Safari, on a computer or a tablet (iPadOS 16.4 or newer). Play
with the mouse or with a finger, as on the original's PC. With a mouse, the first click keeps the
pointer inside the game, like the original did; Esc or switching to another window releases it,
and a click anywhere on the page catches it again. With a finger, the game's hand cursor is not
shown, so it doesn't cover what was just tapped.

A click or tap skips Redcat's explanation at the start of the menu and of each game; it plays
again the next time.

## Troubleshooting

- **It stays black or on "Laden..."**: the page was opened from disk. Use one of the ways under
  [Running it](#running-it).
- **"Hier staat het spel niet in"**: the chosen folder or file doesn't contain `LOCAL/MAIN.dxr`.
  Choose the CD itself or its `RCKSETUP` folder (or a `.zip`/`.iso` of them).
- **"Deze bestanden ontbreken: ..."**: the copy of the CD is incomplete; the message names the
  missing files.
- **"Niet genoeg opslagruimte"**: the browser has too little storage for this site, or is in
  private mode.
- **No sound on an iPad**: turn the volume up. From iPadOS 17 on, the game also plays with the
  silent switch on; older versions stay silent while it is on.

## Licenses

The decoder for the logo film (`src/import/indeo4.js`) is a port of FFmpeg's Indeo 4 decoder and
is under the GNU LGPL 2.1 or later; see `THIRD-PARTY-LICENSES.txt`.
