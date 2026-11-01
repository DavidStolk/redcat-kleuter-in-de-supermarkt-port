// DirectSound Xtra 1.3 (LOCAL/XTRAS/002.x32) replacement. Behaviour from the Xtra's disassembly,
// decomp/notes/xtras.md ("002.x32"): one global manager made by dsOpen, sound IDs 1, 2, 3, ... per
// dsOpen session (never reused), unknown ID -> no-op returning 0, missing file -> 0, dsPlay never
// rewinds, dsStop keeps the position, volume = attenuation in 1/100 dB.
// The audio output is behind SoundBackend so the logic runs without Web Audio in tests.

                                                                                                                          
                                                                                                  
                               
                            
                
                                                                                                       
                                                                                                      
 

/** `dsSetVolume` value (1/100 dB, -10000 = silent .. 0) -> linear gain. */
export function volumeToGain(vol        )         {
  if (vol <= -10000) return 0;
  return Math.pow(10, Math.min(vol, 0) / 2000);
}

                 
                      
                
                 
                                                                              
                   
                   
                    
                      
 

export class DirectSound {
          backend              ;
          lookup                                          ;
          open = false;
          counter = 0;
          sounds = new Map               ();

  /** `lookup` maps a Lingo file path to its decoded buffer (preloaded), or null if missing. */
  constructor(backend              , lookup                                          ) {
    this.backend = backend;
    this.lookup = lookup;
  }

  /** `dsOpen()`: no-op if the manager exists (running sounds keep playing). */
  dsOpen()         {
    if (!this.open) { this.open = true; this.counter = 0; this.sounds.clear(); }
    return 0;
  }

  /** `dsClose()`: every sound stops and is released; the next dsOpen counts from 1 again. */
  dsClose()         {
    if (!this.open) return 0;
    for (const s of this.sounds.values()) this.halt(s);
    this.sounds.clear();
    this.open = false;
    return 0;
  }

  /** `dsNewSound(fileName, mode)`: new static buffer, volume 0 dB, loop off, position 0. */
  dsNewSound(fileName         , _mode          )         {
    if (!this.open || typeof fileName !== 'string') return 0;
    const buffer = this.lookup(fileName);
    if (!buffer) return 0;
    const id = ++this.counter;
    this.sounds.set(id, { buffer, loop: false, volume: 0, position: 0, playing: false, startedAt: 0, voice: null });
    return id;
  }

  dsDelSound(id         )         {
    const s = this.get(id);
    if (!s) return 0;
    this.halt(s);
    this.sounds.delete(id          );
    return 0;
  }

  /** `dsPlay(id)`: a playing buffer keeps playing (only the loop flag is applied); a stopped one
   * starts from its current position. */
  dsPlay(id         )         {
    const s = this.get(id);
    if (!s) return 0;
    if (s.playing) { s.voice?.setLoop(s.loop); return 1; }
    this.startVoice(s);
    return 1;
  }

  /** `dsStop(id)`: stops and keeps the position (a later dsPlay resumes). */
  dsStop(id         )         {
    const s = this.get(id);
    if (!s || !s.playing) return 0;
    s.position = this.currentPosition(s);
    this.halt(s);
    return 0;
  }

  dsSetVolume(id         , vol         )         {
    const s = this.get(id);
    if (!s) return 0;
    s.volume = typeof vol === 'number' ? vol : Number(vol) || 0;
    s.voice?.setGain(volumeToGain(s.volume));
    return 0;
  }

  /** `dsSetLoop(id, flag)`: applies at once to a playing buffer (no restart). */
  dsSetLoop(id         , flag         )         {
    const s = this.get(id);
    if (!s) return 0;
    s.loop = !!flag && flag !== 0;
    if (s.playing) {
      // Keep the offset bookkeeping right when the loop flag changes mid-play.
      s.position = this.currentPosition(s);
      s.startedAt = this.backend.now();
      s.voice?.setLoop(s.loop);
    }
    return 0;
  }

  /** `dsSetPosition(id, bytes)`: SetCurrentPosition in bytes (16-bit PCM). */
  dsSetPosition(id         , pos         )         {
    const s = this.get(id);
    if (!s) return 0;
    const byteRate = s.buffer.sampleRate * s.buffer.numberOfChannels * 2;
    const sec = Math.min(Math.max(0, (Number(pos) || 0) / byteRate), s.buffer.duration);
    if (s.playing) { this.halt(s); s.position = sec; this.startVoice(s); }
    else s.position = sec;
    return 0;
  }

  dsIsPlaying(id         )         {
    const s = this.get(id);
    return s && s.playing ? 1 : 0;
  }

  // ---- internals ----
          get(id         )               {
    if (!this.open || typeof id !== 'number') return null;
    return this.sounds.get(id) ?? null;
  }
          currentPosition(s       )         {
    if (!s.playing) return s.position;
    let p = s.position + (this.backend.now() - s.startedAt);
    if (s.loop && s.buffer.duration > 0) p %= s.buffer.duration;
    return Math.min(p, s.buffer.duration);
  }
          startVoice(s       )       {
    if (s.position >= s.buffer.duration) s.position = 0;
    s.playing = true;
    s.startedAt = this.backend.now();
    const voice = this.backend.start(s.buffer, s.position, s.loop, volumeToGain(s.volume), () => {
      if (s.voice !== voice) return; // stopped or restarted meanwhile
      // A non-looping buffer that played to its end is stopped with its position back at 0.
      s.playing = false; s.position = 0; s.voice = null;
    });
    s.voice = voice;
  }
          halt(s       )       {
    const v = s.voice;
    s.voice = null;
    s.playing = false;
    v?.stop();
  }
}

/** Web Audio output: one AudioContext for the page, resumed on the first user gesture. */
export class WebAudioBackend                         {
           ctx              ;
  constructor(ctx              ) { this.ctx = ctx; }
  now()         { return this.ctx.currentTime; }
  start(buffer             , offset        , loop         , gain        , onEnded            )        {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer               ;
    src.loop = loop;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.ctx.destination);
    let stopped = false;
    src.onended = () => { if (!stopped && !src.loop) onEnded(); };
    src.start(0, offset);
    return {
      stop: () => { stopped = true; try { src.stop(); } catch { /* not started */ } src.disconnect(); g.disconnect(); },
      setLoop: (l         ) => { src.loop = l; },
      setGain: (v        ) => { g.gain.value = v; },
    };
  }
}
