/**
 * Audio Synthesis & Ambient Soundscape Engine
 * Powered by Web Audio API for zero-latency, realistic, offline-first sound generation.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private soundNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();
  private lofiInterval: number | null = null;
  private currentLofiGain: GainNode | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  /** Plays an authentic Tibetan Singing Bowl harmonic chord */
  public playSingingBowl(freq = 432, duration = 6.0) {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const harmonics = [1, 2.76, 5.4, 8.9];
    const gains = [0.6, 0.25, 0.12, 0.05];

    harmonics.forEach((harmonic, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * harmonic, ctx.currentTime);

      // Subtle vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(3.5, ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gains[idx], ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(ctx.currentTime + duration);
      lfo.stop(ctx.currentTime + duration);
    });
  }

  /** Plays a crisp page flip sound */
  public playPageFlip() {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  /** Plays a subtle acoustic click for UI interactions */
  public playUiClick() {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  /** Plays a soothing tea water pour sound */
  public playTeaPour() {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const duration = 2.5;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + duration);
    filter.Q.setValueAtTime(4.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  /** Plays gentle water droplet ripple for garden watering */
  public playWaterDrops() {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    [0, 0.15, 0.32, 0.5].forEach((delay, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 700 + index * 180 + Math.random() * 100;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, ctx.currentTime + delay + 0.1);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });
  }

  /** Plays clear, serene glass wind chime notes */
  public playWindChime() {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const chimeFreqs = [1200, 1540, 1820, 2140, 2480];
    [0, 0.1, 0.22, 0.38].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const randomFreq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomFreq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 2.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 2.2);
    });
  }

  // --- Continuous Procedural Ambient Soundscapes ---

  public startAmbient(type: string, volume = 0.5) {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    if (this.soundNodes.has(type)) {
      this.updateAmbientVolume(type, volume);
      return;
    }

    const soundGain = ctx.createGain();
    soundGain.gain.setValueAtTime(volume, ctx.currentTime);
    soundGain.connect(this.masterGain);

    let stopFn = () => {};

    if (type === 'rain') {
      stopFn = this.createRainGenerator(ctx, soundGain);
    } else if (type === 'fireplace') {
      stopFn = this.createFireplaceGenerator(ctx, soundGain);
    } else if (type === 'stream') {
      stopFn = this.createStreamGenerator(ctx, soundGain);
    } else if (type === 'vinyl') {
      stopFn = this.createVinylCrackleGenerator(ctx, soundGain);
    } else if (type === 'crickets') {
      stopFn = this.createCricketsGenerator(ctx, soundGain);
    } else if (type === 'chimes') {
      stopFn = this.createWindChimesGenerator(ctx, soundGain);
    } else if (type === 'birds') {
      stopFn = this.createBirdsGenerator(ctx, soundGain);
    } else {
      stopFn = this.createWhiteNoiseGenerator(ctx, soundGain);
    }

    this.soundNodes.set(type, { gain: soundGain, stop: stopFn });
  }

  public startProceduralAmbient(type: string, volume = 0.5) {
    this.startAmbient(type, volume);
  }

  public stopAmbient(type: string) {
    const node = this.soundNodes.get(type);
    if (node) {
      node.stop();
      this.soundNodes.delete(type);
    }
  }

  public stopProceduralAmbient(type: string) {
    this.stopAmbient(type);
  }

  public updateAmbientVolume(type: string, volume: number) {
    const node = this.soundNodes.get(type);
    if (node && this.ctx) {
      node.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.1);
    }
  }

  // --- Ambient Generators ---

  private createRainGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();

    return () => {
      try {
        noise.stop();
        noise.disconnect();
      } catch {}
    };
  }

  private createFireplaceGenerator(ctx: AudioContext, destination: GainNode): () => void {
    // Low rumble
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = buffer;
    rumble.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(140, ctx.currentTime);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(destination);
    rumble.start();

    // Random crackle pops
    const interval = setInterval(() => {
      if (Math.random() > 0.45 && ctx.state === 'running') {
        const pop = ctx.createBufferSource();
        const popSize = Math.floor(ctx.sampleRate * 0.03);
        const popBuf = ctx.createBuffer(1, popSize, ctx.sampleRate);
        const popData = popBuf.getChannelData(0);
        for (let i = 0; i < popSize; i++) {
          popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popSize * 0.2));
        }
        pop.buffer = popBuf;

        const popFilter = ctx.createBiquadFilter();
        popFilter.type = 'bandpass';
        popFilter.frequency.setValueAtTime(1200 + Math.random() * 1800, ctx.currentTime);

        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.4 + Math.random() * 0.5, ctx.currentTime);

        pop.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(destination);
        pop.start();
      }
    }, 120);

    return () => {
      clearInterval(interval);
      try {
        rumble.stop();
        rumble.disconnect();
      } catch {}
    };
  }

  private createStreamGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(650, ctx.currentTime);
    filter1.Q.setValueAtTime(2.0, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(1400, ctx.currentTime);

    noise.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(destination);
    noise.start();

    return () => {
      try {
        noise.stop();
        noise.disconnect();
      } catch {}
    };
  }

  private createVinylCrackleGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const interval = setInterval(() => {
      if (Math.random() > 0.4 && ctx.state === 'running') {
        const osc = ctx.createBufferSource();
        const pSize = Math.floor(ctx.sampleRate * 0.008);
        const pBuf = ctx.createBuffer(1, pSize, ctx.sampleRate);
        const pData = pBuf.getChannelData(0);
        for (let i = 0; i < pSize; i++) {
          pData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (pSize * 0.4));
        }
        osc.buffer = pBuf;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15 + Math.random() * 0.15, ctx.currentTime);

        osc.connect(gain);
        gain.connect(destination);
        osc.start();
      }
    }, 80);

    return () => clearInterval(interval);
  }

  private createCricketsGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const interval = setInterval(() => {
      if (Math.random() > 0.3 && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600 + Math.random() * 300, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    }, 300);

    return () => clearInterval(interval);
  }

  private createWindChimesGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const pentatonic = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const interval = setInterval(() => {
      if (Math.random() > 0.5 && ctx.state === 'running') {
        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);

        osc.connect(gain);
        gain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.1);
      }
    }, 1800);

    return () => clearInterval(interval);
  }

  private createBirdsGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const startFreq = 2200 + Math.random() * 1200;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.3, ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.9, ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    }, 2400);

    return () => clearInterval(interval);
  }

  private createWhiteNoiseGenerator(ctx: AudioContext, destination: GainNode): () => void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(destination);
    noise.start();

    return () => {
      try {
        noise.stop();
        noise.disconnect();
      } catch {}
    };
  }

  // --- Procedural Lo-Fi Electric Piano Progression Generator ---

  public startLofiSynth(volume = 0.6) {
    const ctx = this.initContext();
    if (!this.masterGain) return;
    this.stopLofiSynth();

    this.currentLofiGain = ctx.createGain();
    this.currentLofiGain.gain.setValueAtTime(volume, ctx.currentTime);
    this.currentLofiGain.connect(this.masterGain);

    // Warm Lo-Fi jazz progressions (frequencies in Hz: Cmaj9, Am9, Dm9, G13)
    const chords = [
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
      [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
      [146.83, 220.0, 261.63, 329.63, 440.0],  // Dm9
      [196.0, 246.94, 293.66, 349.23, 440.0],  // G13
    ];

    let chordIndex = 0;
    const playChord = () => {
      if (!this.currentLofiGain || ctx.state !== 'running') return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      currentChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const chordGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc2.type = 'sine';
        // Warm slight detune
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc2.frequency.setValueAtTime(freq * 1.002, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 3.8);

        const stagger = idx * 0.04;
        chordGain.gain.setValueAtTime(0.0001, ctx.currentTime + stagger);
        chordGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + stagger + 0.15);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + stagger + 3.8);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.currentLofiGain!);

        osc.start(ctx.currentTime + stagger);
        osc2.start(ctx.currentTime + stagger);
        osc.stop(ctx.currentTime + stagger + 3.9);
        osc2.stop(ctx.currentTime + stagger + 3.9);
      });
    };

    playChord();
    this.lofiInterval = window.setInterval(playChord, 4000);
  }

  public stopLofiSynth() {
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    if (this.currentLofiGain) {
      this.currentLofiGain.disconnect();
      this.currentLofiGain = null;
    }
  }
}

export const audioEngine = new AudioEngine();
