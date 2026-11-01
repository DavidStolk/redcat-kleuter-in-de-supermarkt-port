// Keeps the picked game files in the browser (IndexedDB), so they are asked for only once. Files
// are stored as ArrayBuffers (Safari loses Blobs stored in IndexedDB in some versions) and read
// one by one when the runtime needs them, so the ~120 MB never sit in memory at once.
                                             

const DB = 'redcat-kleuter-1';
const FILES = 'files';   // key -> ArrayBuffer
const META = 'meta';     // 'names' -> [key, original spelling][] (written last: marks a complete copy)

function open()                       {
  return new Promise((ok, err) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore(FILES); r.result.createObjectStore(META); };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => err(r.error);
  });
}
function req   (r               )             {
  return new Promise((ok, err) => { r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error); });
}
function done(tx                )                {
  return new Promise((ok, err) => { tx.oncomplete = () => ok(); tx.onerror = () => err(tx.error); tx.onabort = () => err(tx.error); });
}

/** The stored copy, or null when nothing (complete) is stored. */
export async function openStored()                           {
  if (typeof indexedDB === 'undefined') return null;
  let db             ;
  try { db = await open(); } catch { return null; }
  const list = await req(db.transaction(META).objectStore(META).get('names'))                                       ;
  if (!list) return null;
  return {
    names: new Map(list),
    read: async (key) => {
      const b = await req(db.transaction(FILES).objectStore(FILES).get(key))                           ;
      if (!b) throw new Error('not stored: ' + key);
      return b;
    },
  };
}

/** Copies every game file of `src` into the store (replacing an earlier copy). */
export async function store(src          , onProgress                                       )                {
  const db = await open();
  const nav = navigator                                                                  ;
  // Ask the browser not to evict the copy when space runs low (granted silently or refused).
  await nav.storage?.persist?.().catch(() => false);
  let tx = db.transaction([FILES, META], 'readwrite');
  tx.objectStore(META).delete('names');
  tx.objectStore(FILES).clear();
  await done(tx);
  const keys = [...src.names.keys()];
  let n = 0;
  // Batches of files per transaction; reading runs ahead of writing.
  for (let i = 0; i < keys.length; i += 32) {
    const batch = keys.slice(i, i + 32);
    const data = await Promise.all(batch.map((k) => src.read(k)));
    tx = db.transaction(FILES, 'readwrite');
    batch.forEach((k, j) => tx.objectStore(FILES).put(data[j], k));
    await done(tx);
    n += batch.length;
    onProgress(n, keys.length);
  }
  tx = db.transaction(META, 'readwrite');
  tx.objectStore(META).put([...src.names], 'names');
  await done(tx);
}

/** Forgets the stored copy (`?reset=1`). */
export async function clearStored()                {
  if (typeof indexedDB === 'undefined') return;
  await new Promise      ((ok) => { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => ok(); });
}
