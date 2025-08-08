class LevelProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._lastZeroCross = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const ch = input[0];
    let sum = 0;
    let zc = 0;
    let last = ch[0];
    for (let i = 0; i < ch.length; i++) {
      const v = ch[i];
      sum += v * v;
      if ((v >= 0 && last < 0) || (v < 0 && last >= 0)) zc++;
      last = v;
    }
    const rms = Math.sqrt(sum / ch.length);
    const zcr = zc / ch.length;
    this.port.postMessage({ rms, zcr });
    return true;
  }
}

registerProcessor('level-processor', LevelProcessor);


