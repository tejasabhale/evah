import { TTSDevice, TTSDtype, TTSStatus, WorkerInMessage, WorkerOutMessage } from './types';

class TTSService {
  private worker: Worker | null = null;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isCurrentlySpeaking = false;
  private status: TTSStatus = 'idle';
  private detectedDevice: TTSDevice = 'wasm';
  private detectedDtype: TTSDtype = 'q8';
  private statusListeners: Set<(status: TTSStatus) => void> = new Set();
  private deviceListeners: Set<(info: { device: TTSDevice; dtype: TTSDtype }) => void> = new Set();
  private autoplayListeners: Set<(pending: boolean) => void> = new Set();
  
  // Pending greeting audio if blocked by browser autoplay policy
  private pendingGreetingAudio: { audioData: Float32Array; sampleRate: number } | null = null;
  private isAutoplayBlocked = false;

  // High-performance audio intensity tracking (0 React re-renders)
  private currentIntensity = 0.0;
  private analyserFrameId: number | null = null;
  private analyserDataArray: Uint8Array | null = null;

  constructor() {
    this.setupAutoplayUnlockListeners();
  }

  // Handle browser autoplay policy cleanly without dropping greetings
  private setupAutoplayUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlockAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('[EVAH TTS] AudioContext resumed via user interaction');
          this.setAutoplayPending(false);
          if (this.pendingGreetingAudio) {
            const pending = this.pendingGreetingAudio;
            this.pendingGreetingAudio = null;
            this.playAudioBuffer(pending.audioData, pending.sampleRate);
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
  }

  private setAutoplayPending(pending: boolean) {
    this.isAutoplayBlocked = pending;
    this.autoplayListeners.forEach((l) => l(pending));
  }

  public onAutoplayPendingChange(listener: (pending: boolean) => void): () => void {
    this.autoplayListeners.add(listener);
    listener(this.isAutoplayBlocked && this.pendingGreetingAudio !== null);
    return () => this.autoplayListeners.delete(listener);
  }

  public unlockAutoplayManually() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('[EVAH TTS] AudioContext resumed manually');
        this.setAutoplayPending(false);
        if (this.pendingGreetingAudio) {
          const pending = this.pendingGreetingAudio;
          this.pendingGreetingAudio = null;
          this.playAudioBuffer(pending.audioData, pending.sampleRate);
        }
      }).catch(() => {});
    }
  }

  public init(modelBaseUrl = '/models/kokoro', wasmBaseUrl = '/wasm') {
    if (this.worker) return;

    try {
      this.setStatus('loading');
      console.log('[EVAH TTS] Spawning dedicated Kokoro Web Worker...');

      this.worker = new Worker(
        new URL('./kokoro.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        this.handleWorkerMessage(e.data);
      };

      this.worker.onerror = (err) => {
        console.warn('[EVAH TTS] Worker error:', err);
        this.setStatus('error');
      };

      this.worker.postMessage({
        type: 'INIT',
        payload: { modelBaseUrl, wasmBaseUrl, voice: 'af_heart' }
      } as WorkerInMessage);

    } catch (err) {
      console.warn('[EVAH TTS] Unable to spawn Kokoro worker:', err);
      this.setStatus('error');
    }
  }

  private handleWorkerMessage(msg: WorkerOutMessage) {
    switch (msg.type) {
      case 'READY':
        this.detectedDevice = msg.payload.device;
        this.detectedDtype = msg.payload.dtype;
        console.log(`[EVAH TTS] Engine ready: ${this.detectedDevice} (${this.detectedDtype})`);
        this.setStatus('ready');
        this.deviceListeners.forEach((l) => l({ device: this.detectedDevice, dtype: this.detectedDtype }));
        break;

      case 'STATUS':
        this.setStatus(msg.payload.status);
        break;

      case 'AUDIO_COMPLETE':
        this.playAudioBuffer(msg.payload.audioData, msg.payload.sampleRate);
        break;

      case 'ERROR':
        console.warn('[EVAH TTS] Inference error:', msg.payload.error);
        this.setStatus('error');
        this.stop();
        break;
    }
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {
        this.setAutoplayPending(true);
      });
    }
    return this.audioContext;
  }

  private safetyTimer: any = null;

  private playAudioBuffer(pcmData: Float32Array, sampleRate: number) {
    try {
      const ctx = this.ensureAudioContext();

      // If autoplay policy blocks playback, store pending audio and await first click
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          console.warn('[EVAH TTS] Autoplay prevented playback; queued pending audio for first click');
          this.pendingGreetingAudio = { audioData: pcmData, sampleRate };
          this.setAutoplayPending(true);
        });
      }

      // Stop any active playback cleanly before starting new buffer
      this.stopActivePlayback();

      // Create one single AudioBuffer with the exact sample rate of the model
      const audioBuffer = ctx.createBuffer(1, pcmData.length, sampleRate);
      audioBuffer.copyToChannel(pcmData, 0);

      // Create one AudioBufferSourceNode
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Create single AnalyserNode for audio reactivity
      if (!this.analyserNode) {
        this.analyserNode = ctx.createAnalyser();
        this.analyserNode.fftSize = 64;
        this.analyserNode.smoothingTimeConstant = 0.8;
      }

      // Audio pipeline: source -> AnalyserNode -> destination
      source.connect(this.analyserNode);
      this.analyserNode.connect(ctx.destination);

      this.currentSource = source;
      this.isCurrentlySpeaking = true;
      this.setStatus('speaking');

      // Start zero-render internal analyser loop
      this.startAnalyserLoop();
      console.log(`[EVAH TTS] Playback started: ${(pcmData.length / sampleRate).toFixed(2)}s @ ${sampleRate}Hz`);

      const durationMs = (pcmData.length / sampleRate) * 1000;
      let ended = false;
      const handleEnded = () => {
        if (ended) return;
        ended = true;
        if (this.safetyTimer) {
          clearTimeout(this.safetyTimer);
          this.safetyTimer = null;
        }
        console.log('[EVAH TTS] Playback ended');
        this.stopActivePlayback();
        this.setStatus('idle');
      };

      source.onended = handleEnded;
      this.safetyTimer = setTimeout(handleEnded, durationMs + 250);

      source.start(0);
    } catch (err) {
      console.warn('[EVAH TTS] Playback failed:', err);
      this.stop();
      this.setStatus('error');
    }
  }

  private startAnalyserLoop() {
    if (this.analyserFrameId) cancelAnimationFrame(this.analyserFrameId);
    if (!this.analyserNode) return;

    if (!this.analyserDataArray) {
      this.analyserDataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    }

    const update = () => {
      if (!this.isCurrentlySpeaking || !this.analyserNode) {
        this.currentIntensity = 0.0;
        this.analyserFrameId = null;
        return;
      }

      this.analyserNode.getByteFrequencyData(this.analyserDataArray!);
      
      // Calculate RMS power
      let sum = 0;
      for (let i = 0; i < this.analyserDataArray!.length; i++) {
        sum += this.analyserDataArray![i];
      }
      const avg = sum / this.analyserDataArray!.length;
      const targetIntensity = Math.min(1.0, avg / 128.0);

      // Smooth decay / lerp
      this.currentIntensity += (targetIntensity - this.currentIntensity) * 0.25;

      this.analyserFrameId = requestAnimationFrame(update);
    };

    this.analyserFrameId = requestAnimationFrame(update);
  }

  private stopActivePlayback() {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    if (this.analyserFrameId) {
      cancelAnimationFrame(this.analyserFrameId);
      this.analyserFrameId = null;
    }
    this.currentIntensity = 0.0;

    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {}
      this.currentSource = null;
    }

    this.isCurrentlySpeaking = false;
  }

  public speak(text: string, voice = 'af_heart', speed = 1.0): Promise<void> {
    return new Promise((resolve) => {
      this.ensureAudioContext();
      this.init();

      const execute = () => {
        if (!this.worker || this.status === 'error') {
          console.warn('[EVAH TTS] Cannot speak: worker unavailable or in error state');
          resolve();
          return;
        }

        const id = 'utt_' + Date.now();
        this.worker.postMessage({
          type: 'GENERATE',
          payload: { id, text, voice, speed }
        } as WorkerInMessage);

        resolve();
      };

      // If already ready or speaking/paused/idle, generate immediately
      if (this.status === 'ready' || this.status === 'idle' || this.status === 'speaking' || this.status === 'paused') {
        execute();
      } else {
        // Still initializing: wait for READY status up to 20 seconds
        console.log('[EVAH TTS] Engine initializing; queuing utterance...');
        let isDone = false;
        const timer = setTimeout(() => {
          if (!isDone) {
            isDone = true;
            unsub();
            console.warn('[EVAH TTS] Timed out waiting for Kokoro engine to become ready');
            resolve();
          }
        }, 20000);

        const unsub = this.onStatusChange((newStatus) => {
          if (!isDone && (newStatus === 'ready' || newStatus === 'idle')) {
            isDone = true;
            clearTimeout(timer);
            unsub();
            execute();
          } else if (!isDone && newStatus === 'error') {
            isDone = true;
            clearTimeout(timer);
            unsub();
            resolve();
          }
        });
      }
    });
  }

  public pause() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
      this.setStatus('paused');
    }
  }

  public resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.setStatus('speaking');
    }
  }

  public stop() {
    this.stopActivePlayback();
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' } as WorkerInMessage);
    }
    this.setStatus('idle');
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  public isAutoplayPending(): boolean {
    return this.isAutoplayBlocked && this.pendingGreetingAudio !== null;
  }

  // Polled directly by Three.js inside SpaceAtmosphere's RAF loop
  // ZERO audio-frame updates in React/Zustand!
  public getCurrentIntensity(): number {
    return this.currentIntensity;
  }

  public getDevice(): TTSDevice {
    return this.detectedDevice;
  }

  public getDtype(): TTSDtype {
    return this.detectedDtype;
  }

  public getStatus(): TTSStatus {
    return this.status;
  }

  public onStatusChange(listener: (status: TTSStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public onDeviceChange(listener: (info: { device: TTSDevice; dtype: TTSDtype }) => void): () => void {
    this.deviceListeners.add(listener);
    listener({ device: this.detectedDevice, dtype: this.detectedDtype });
    return () => this.deviceListeners.delete(listener);
  }

  private setStatus(status: TTSStatus) {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  // Complete cleanup on USB disconnect or session lock
  public cleanup() {
    this.stop();
    this.pendingGreetingAudio = null;
    this.setAutoplayPending(false);
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {}
      this.worker = null;
    }
    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch {}
      this.analyserNode = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.setStatus('idle');
  }
}

export const ttsService = new TTSService();
