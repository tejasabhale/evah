export type TTSDevice = 'webgpu' | 'wasm';
export type TTSDtype = 'fp32' | 'q8';
export type TTSStatus = 'idle' | 'loading' | 'ready' | 'speaking' | 'paused' | 'error';
export type BlackHoleState = 'idle' | 'initializing' | 'greeting' | 'speaking' | 'locked' | 'disconnected';

export interface GeneratePayload {
  id: string;
  text: string;
  voice: string;
  speed: number;
}

export type WorkerInMessage =
  | { type: 'INIT'; payload: { modelBaseUrl?: string; wasmBaseUrl?: string; voice?: string } }
  | { type: 'GENERATE'; payload: GeneratePayload }
  | { type: 'STOP' };

export type WorkerOutMessage =
  | { type: 'READY'; payload: { device: TTSDevice; dtype: TTSDtype } }
  | { type: 'AUDIO_COMPLETE'; payload: { id: string; audioData: Float32Array; sampleRate: number } }
  | { type: 'STATUS'; payload: { status: TTSStatus; message?: string } }
  | { type: 'ERROR'; payload: { error: string } };

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  speed: number;
  volume: number;
}

export type SessionEventType = 
  | 'USB_CONNECTED' 
  | 'USB_DISCONNECTED' 
  | 'SESSION_LOCK' 
  | 'SESSION_UNLOCK';
