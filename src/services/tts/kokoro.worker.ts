import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';
import { WorkerInMessage, WorkerOutMessage, TTSDevice, TTSDtype } from './types';

// Typed worker global scope helper
const ctx = self as unknown as {
  postMessage: (message: WorkerOutMessage, transfer?: Transferable[]) => void;
  onmessage: ((e: MessageEvent<WorkerInMessage>) => void) | null;
};

// State
let currentTTS: any = null;
let currentDevice: TTSDevice = 'wasm';
let currentDtype: TTSDtype = 'q8';
let isInitializing = false;

// Intercept fetch inside worker for voice assets to guarantee 100% offline operation
const originalFetch = self.fetch.bind(self);
self.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  if (urlStr.includes('voices/af_heart.bin') || urlStr.endsWith('af_heart.bin')) {
    console.log('[EVAH TTS] Intercepted voice fetch -> redirecting to local /models/kokoro/voices/af_heart.bin');
    return originalFetch('/models/kokoro/voices/af_heart.bin', init);
  }
  return originalFetch(input, init);
};

// Pre-seed CacheStorage "kokoro-voices" with local af_heart.bin
async function seedVoiceCache() {
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open('kokoro-voices');
      const voiceKey = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/af_heart.bin';
      const match = await cache.match(voiceKey);
      if (!match) {
        console.log('[EVAH TTS] Pre-seeding CacheStorage with local af_heart.bin...');
        const res = await originalFetch('/models/kokoro/voices/af_heart.bin');
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          await cache.put(voiceKey, new Response(buffer, { headers: { 'Content-Type': 'application/octet-stream' } }));
          console.log('[EVAH TTS] Voice cache seeded successfully');
        }
      }
    } catch (e) {
      console.warn('[EVAH TTS] Voice cache seeding skipped:', e);
    }
  }
}

// Verify that a local asset physically exists on the server
async function verifyAsset(path: string): Promise<boolean> {
  try {
    const res = await originalFetch(path, { method: 'HEAD' });
    return res.ok || res.status === 200 || res.status === 206 || res.status === 304;
  } catch {
    return false;
  }
}

// Verify all required files for the selected dtype
async function verifyRequiredAssets(dtype: TTSDtype): Promise<{ ok: boolean; missing?: string }> {
  if (!(await verifyAsset('/models/kokoro/config.json'))) return { ok: false, missing: '/models/kokoro/config.json' };
  if (!(await verifyAsset('/models/kokoro/tokenizer.json'))) return { ok: false, missing: '/models/kokoro/tokenizer.json' };
  if (!(await verifyAsset('/models/kokoro/voices/af_heart.bin'))) return { ok: false, missing: '/models/kokoro/voices/af_heart.bin' };
  if (!(await verifyAsset('/wasm/ort-wasm-simd-threaded.wasm'))) return { ok: false, missing: '/wasm/ort-wasm-simd-threaded.wasm' };

  if (dtype === 'fp32') {
    if (!(await verifyAsset('/models/kokoro/onnx/model.onnx'))) return { ok: false, missing: '/models/kokoro/onnx/model.onnx' };
  } else {
    if (!(await verifyAsset('/models/kokoro/onnx/model_quantized.onnx'))) return { ok: false, missing: '/models/kokoro/onnx/model_quantized.onnx' };
  }

  return { ok: true };
}

// Rigorous audio validation
function validateAudioOutput(audioData: Float32Array, sampleRate: number): { valid: boolean; reason?: string } {
  if (!audioData || !(audioData instanceof Float32Array)) {
    return { valid: false, reason: 'Output is not Float32Array' };
  }
  if (audioData.length < sampleRate * 0.2) {
    return { valid: false, reason: `Audio too short (${audioData.length} samples)` };
  }
  if (sampleRate <= 0 || !Number.isFinite(sampleRate)) {
    return { valid: false, reason: `Invalid sample rate: ${sampleRate}` };
  }

  let nonZeroCount = 0;
  let maxAmp = 0;
  for (let i = 0; i < audioData.length; i++) {
    const val = audioData[i];
    if (!Number.isFinite(val)) {
      return { valid: false, reason: `Audio contains NaN or Infinity at sample ${i}` };
    }
    const abs = Math.abs(val);
    if (abs > 0.000001) nonZeroCount++;
    if (abs > maxAmp) maxAmp = abs;
  }

  if (nonZeroCount < audioData.length * 0.05) {
    return { valid: false, reason: 'Audio is silent (all zeros)' };
  }
  if (maxAmp < 0.001) {
    return { valid: false, reason: 'Audio amplitude is negligible (< 0.001)' };
  }

  return { valid: true };
}

// Attempt to initialize and perform a REAL test inference on a specific backend
async function attemptInitBackend(device: TTSDevice, dtype: TTSDtype): Promise<{ tts: any; success: boolean }> {
  try {
    console.log(`[EVAH TTS] Initializing`);
    console.log(`[EVAH TTS] Model path: /models/kokoro/`);
    console.log(`[EVAH TTS] Voice: af_heart`);
    console.log(`[EVAH TTS] Probing backend: ${device} (${dtype})...`);

    // Verify local physical files exist
    const check = await verifyRequiredAssets(dtype);
    if (!check.ok) {
      console.warn(`[EVAH TTS] Missing asset: ${check.missing}`);
      return { tts: null, success: false };
    }

    // Configure Transformers.js env strictly for local offline use
    env.allowLocalModels = true;
    env.allowRemoteModels = false;
    env.localModelPath = '/models/';
    const wasmBase = typeof self !== 'undefined' && self.location?.origin
      ? `${self.location.origin}/wasm/`
      : '/wasm/';
    (env.backends.onnx.wasm as any).wasmPaths = wasmBase;
    (env.backends.onnx.wasm as any).numThreads = 1;


    // WebGPU hardware probe
    if (device === 'webgpu') {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (!nav?.gpu || typeof nav.gpu.requestAdapter !== 'function') {
        console.warn('[EVAH TTS] WebGPU unavailable in navigator');
        return { tts: null, success: false };
      }
      const adapter = await nav.gpu.requestAdapter();
      if (!adapter) {
        console.warn('[EVAH TTS] Failed to acquire WebGPU adapter');
        return { tts: null, success: false };
      }
      const dev = await adapter.requestDevice();
      if (!dev) {
        console.warn('[EVAH TTS] Failed to acquire WebGPU device');
        return { tts: null, success: false };
      }
      try { dev.destroy?.(); } catch {}
    }

    // Load Kokoro-82M model from local /models/kokoro
    const tts = await KokoroTTS.from_pretrained('kokoro', {
      dtype,
      device: device === 'webgpu' ? 'webgpu' : 'wasm',
    });

    // Run real test inference on tiny text to prove the model works
    console.log(`[EVAH TTS] Performing real verification inference on ${device} (${dtype})...`);
    const testAudio = await tts.generate('EVAH voice ready.', {
      voice: 'af_heart',
      speed: 1.0,
    });

    const sampleRate = testAudio.sampling_rate || 24000;
    const validation = validateAudioOutput(testAudio.audio, sampleRate);
    if (!validation.valid) {
      console.warn(`[EVAH TTS] Test inference failed validation: ${validation.reason}`);
      return { tts: null, success: false };
    }

    console.log(`[EVAH TTS] ${device} inference test passed (${testAudio.audio.length} samples @ ${sampleRate}Hz)`);
    return { tts, success: true };
  } catch (err) {
    console.warn(`[EVAH TTS] Initialization failed for ${device} (${dtype}):`, err);
    return { tts: null, success: false };
  }
}

async function initKokoro() {
  if (isInitializing || currentTTS) return;
  isInitializing = true;

  ctx.postMessage({
    type: 'STATUS',
    payload: { status: 'loading', message: 'Initializing local Kokoro TTS engine...' }
  });

  await seedVoiceCache();

  // 1. First probe and attempt WebGPU with fp32
  let result = await attemptInitBackend('webgpu', 'fp32');
  if (result.success) {
    currentTTS = result.tts;
    currentDevice = 'webgpu';
    currentDtype = 'fp32';
    isInitializing = false;
    console.log('[EVAH TTS] Backend: WebGPU (fp32)');
    ctx.postMessage({
      type: 'READY',
      payload: { device: 'webgpu', dtype: 'fp32' }
    });
    return;
  }

  // 2. Fallback to WASM with q8
  console.log('[EVAH TTS] Falling back to WASM (q8)...');
  result = await attemptInitBackend('wasm', 'q8');
  if (result.success) {
    currentTTS = result.tts;
    currentDevice = 'wasm';
    currentDtype = 'q8';
    isInitializing = false;
    console.log('[EVAH TTS] Backend: WASM (q8)');
    ctx.postMessage({
      type: 'READY',
      payload: { device: 'wasm', dtype: 'q8' }
    });
    return;
  }

  // 3. Both failed or assets missing
  isInitializing = false;
  console.error('[EVAH TTS] Kokoro initialization failed on all backends');
  ctx.postMessage({
    type: 'ERROR',
    payload: { error: 'Voice unavailable. EVAH can still respond using text.' }
  });
}

// Worker message listener
ctx.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const { type } = e.data;

  switch (type) {
    case 'INIT': {
      await initKokoro();
      break;
    }

    case 'GENERATE': {
      const { id, text, voice, speed } = e.data.payload;

      if (!currentTTS) {
        console.warn('[EVAH TTS] Cannot generate: Kokoro model not initialized yet');
        ctx.postMessage({
          type: 'ERROR',
          payload: { error: 'Voice unavailable. EVAH can still respond using text.' }
        });
        break;
      }

      try {
        ctx.postMessage({
          type: 'STATUS',
          payload: { status: 'speaking', message: `Synthesizing: "${text.slice(0, 30)}..."` }
        });

        console.log(`[EVAH TTS] Synthesizing speech: "${text}" [Voice: ${voice || 'af_heart'}]`);
        const result = await currentTTS.generate(text, {
          voice: voice || 'af_heart',
          speed: speed || 1.0,
        });

        const sampleRate = result.sampling_rate || 24000;
        const audioData: Float32Array = result.audio;

        // Verify PCM audio before dispatching
        const validation = validateAudioOutput(audioData, sampleRate);
        if (!validation.valid) {
          console.error('[EVAH TTS] Invalid PCM output:', validation.reason);
          ctx.postMessage({
            type: 'ERROR',
            payload: { error: `Invalid PCM output: ${validation.reason}` }
          });
          break;
        }

        console.log(`[EVAH TTS] Audio generated: ${(audioData.length / sampleRate).toFixed(2)}s @ ${sampleRate}Hz`);

        // Send one complete Float32Array audio buffer using Transferable Objects (zero-copy)
        ctx.postMessage(
          {
            type: 'AUDIO_COMPLETE',
            payload: { id, audioData, sampleRate }
          },
          [audioData.buffer]
        );
      } catch (err: any) {
        console.error('[EVAH TTS] Generation failed:', err);
        ctx.postMessage({
          type: 'ERROR',
          payload: { error: err?.message || 'Voice unavailable. EVAH can still respond using text.' }
        });
      }
      break;
    }

    case 'STOP': {
      // Abort active inference
      break;
    }
  }
};
