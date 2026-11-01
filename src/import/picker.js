// The page that asks for the game files (README.md "Game data"): the CD folder (desktop browsers,
// also by dropping it on the page) or a .zip/.iso of the CD (every browser; iPad Safari can only
// pick single files). The files are checked, copied into the browser's storage (store.ts) and
// read from there from then on.
import { fromDrop, fromFiles, missingFiles,               } from './sources.js';
import { openStored, store } from './store.js';

/** iPhone/iPad (iPadOS reports itself as a Mac with touch): no folder picking. */
function isIOS()          {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function askForFiles(overlay             )                    {
  overlay.textContent = '';
  overlay.classList.add('picker');
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <h1>Redcat Kleuter 1 &ndash; Supermarkt</h1>
    <p>Dit spel heeft de bestanden van je eigen cd-rom nodig. Ze blijven op dit apparaat en worden
    niet verstuurd. Je hoeft ze maar &eacute;&eacute;n keer te kiezen.</p>
    <div class="buttons">
      <button type="button" class="folder">Kies de cd-map</button>
      <button type="button" class="file">Kies een .zip of .iso</button>
    </div>
    <p class="hint"></p>
    <p class="status" role="status"></p>`;
  overlay.appendChild(panel);
  const q =                        (s        )    => panel.querySelector(s)     ;
  const status = q             ('.status');
  const ios = isIOS();
  if (ios) {
    q             ('.folder').hidden = true;
    q             ('.hint').textContent = 'iPad: zet de cd eerst als .zip of .iso in de app Bestanden. Een map wordt een .zip met '
      + '"Comprimeer" (houd de map ingedrukt).';
  } else {
    q             ('.hint').textContent = 'Kies de hele cd of de map RCKSETUP, of sleep die hierheen.';
  }

  return new Promise((resolve) => {
    let busy = false;
    const use = async (get                                )                => {
      if (busy) return;
      busy = true;
      status.classList.remove('error');
      status.textContent = 'Bestanden zoeken...';
      try {
        const src = await get();
        if (!src) throw new Error('Hier staat het spel niet in: de map LOCAL met MAIN.dxr ontbreekt.');
        const missing = missingFiles(src.names);
        if (missing.length) throw new Error('Deze bestanden ontbreken: ' + missing.slice(0, 6).join(', ') + (missing.length > 6 ? ', ...' : ''));
        await store(src, (n, total) => { status.textContent = `Bestanden kopiëren... ${Math.floor(n * 100 / total)}%`; });
        const stored = await openStored();
        if (!stored) throw new Error('De bestanden konden niet worden bewaard.');
        overlay.classList.remove('picker');
        overlay.textContent = '';
        resolve(stored);
      } catch (e) {
        console.error(e);
        const quota = e instanceof DOMException && e.name === 'QuotaExceededError';
        status.textContent = quota ? 'Niet genoeg opslagruimte in de browser (ongeveer 130 MB nodig).' : (e instanceof Error ? e.message : String(e));
        status.classList.add('error');
        busy = false;
      }
    };
    const pick = (folder         )       => {
      const input = document.createElement('input');
      input.type = 'file';
      if (folder) { input.webkitdirectory = true; input.multiple = true; }
      input.addEventListener('change', () => { if (input.files?.length) void use(() => fromFiles(Array.from(input.files ))); });
      input.click();
    };
    q                   ('.folder').addEventListener('click', () => pick(true));
    q                   ('.file').addEventListener('click', () => pick(false));
    overlay.addEventListener('dragover', (e) => { e.preventDefault(); });
    overlay.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer) { const dt = e.dataTransfer; void use(() => fromDrop(dt)); } });
  });
}
