export interface VadOptions {
  rmsThreshold?: number; // 0..1
  zcrThreshold?: number; // 0..5%
  hangoverMs?: number;
}

export class SimpleVAD {
  private speaking = false;
  private lastVoiceTs = 0;
  private opts: Required<VadOptions>;

  constructor(opts: VadOptions = {}) {
    this.opts = {
      rmsThreshold: opts.rmsThreshold ?? 0.02,
      zcrThreshold: opts.zcrThreshold ?? 0.02,
      hangoverMs: opts.hangoverMs ?? 300,
    };
  }

  update(rms: number, zcr: number, now: number = Date.now()) {
    const voiced = rms >= this.opts.rmsThreshold && zcr >= this.opts.zcrThreshold;
    if (voiced) {
      this.lastVoiceTs = now;
      if (!this.speaking) this.speaking = true;
    } else if (this.speaking && now - this.lastVoiceTs > this.opts.hangoverMs) {
      this.speaking = false;
    }
    return this.speaking;
  }

  isSpeaking() {
    return this.speaking;
  }
}


