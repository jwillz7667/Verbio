// Simple jitter buffer for Float32 PCM frames
export class JitterBuffer {
  private queue: Float32Array[] = [];
  private max: number;
  constructor(maxFrames: number = 50) {
    this.max = maxFrames;
  }
  push(frame: Float32Array) {
    this.queue.push(frame);
    if (this.queue.length > this.max) {
      // drop oldest to tolerate bursty network
      this.queue.shift();
    }
  }
  pop(): Float32Array | null {
    if (this.queue.length === 0) return null;
    return this.queue.shift() || null;
  }
  size() {
    return this.queue.length;
  }
}


