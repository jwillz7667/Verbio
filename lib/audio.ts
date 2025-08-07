export class AudioProcessor {
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private sampleRate = 24000;
  private bufferSize = 4096;

  constructor() {
    if (typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate
      });
    }
  }

  async startRecording(onAudioData: (data: Uint8Array) => void): Promise<MediaStream> {
    if (!this.context) {
      throw new Error('AudioContext not available');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: this.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.source = this.context.createMediaStreamSource(this.stream);
      this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = this.float32ToPCM16(inputData);
        onAudioData(new Uint8Array(pcm16));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.context.destination);

      return this.stream;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  stopRecording(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  private float32ToPCM16(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
    }
    
    return buffer;
  }

  pcm16ToFloat32(pcm16: ArrayBuffer): Float32Array {
    const dataView = new DataView(pcm16);
    const float32 = new Float32Array(pcm16.byteLength / 2);
    
    for (let i = 0; i < float32.length; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      float32[i] = int16 / 0x7FFF;
    }
    
    return float32;
  }

  async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.context) {
      throw new Error('AudioContext not available');
    }

    const float32Data = this.pcm16ToFloat32(audioData);
    const audioBuffer = this.context.createBuffer(1, float32Data.length, this.sampleRate);
    audioBuffer.copyToChannel(new Float32Array(float32Data), 0);

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);
    source.start();

    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  }

  getAudioLevel(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Math.abs(data[i]);
    }
    return sum / data.length;
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  createAudioBlob(chunks: ArrayBuffer[]): Blob {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      combinedArray.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    return new Blob([combinedArray], { type: 'audio/pcm;rate=24000' });
  }

  destroy(): void {
    this.stopRecording();
    if (this.context && this.context.state !== 'closed') {
      this.context.close();
    }
    this.context = null;
  }
}

export const audioProcessor = new AudioProcessor();