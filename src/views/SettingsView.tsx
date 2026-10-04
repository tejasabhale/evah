import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEvahStore } from '../store/useEvahStore';
import { ttsService } from '../services/tts/ttsService';
import { 
  Palette, 
  EyeOff, 
  Shield, 
  Sparkles, 
  HardDrive, 
  Info, 
  RotateCcw,
  Volume2,
  Play,
  Square,
  Cpu,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

type SettingsSection = 'Appearance' | 'Voice' | 'Privacy' | 'Security' | 'AI' | 'Storage' | 'About';

const SECTIONS: { id: SettingsSection; label: string; icon: LucideIcon }[] = [
  { id: 'Appearance', label: 'Appearance', icon: Palette },
  { id: 'Voice', label: 'Voice & TTS', icon: Volume2 },
  { id: 'Privacy', label: 'Privacy', icon: EyeOff },
  { id: 'Security', label: 'Security', icon: Shield },
  { id: 'AI', label: 'AI', icon: Sparkles },
  { id: 'Storage', label: 'Storage', icon: HardDrive },
  { id: 'About', label: 'About', icon: Info },
];

export const SettingsView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<SettingsSection>('Appearance');

  const { 
    backgroundIntensity, 
    setBackgroundIntensity, 
    reducedMotion, 
    setReducedMotion,
    autoLockMinutes,
    setBootSequenceFinished,
    voiceResponsesEnabled,
    setVoiceResponsesEnabled,
    voiceSpeed,
    setVoiceSpeed,
    ttsDevice,
    ttsDtype,
    ttsStatus
  } = useEvahStore();

  const handleRestartSequence = () => {
    setBootSequenceFinished(false);
    toast.info('Replaying startup sequence');
  };

  const handleTestVoice = () => {
    if (ttsStatus === 'speaking') {
      ttsService.stop();
    } else {
      ttsService.speak(
        'EVAH voice engine is active and running locally on your hardware.',
        'af_heart',
        voiceSpeed
      );
      toast.success('Synthesizing speech sample...');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden border border-white/[0.07] rounded-xl bg-evah-surface/30 backdrop-blur-md m-6 select-none">
      {/* Left List of Sections */}
      <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/[0.07] flex flex-col shrink-0 bg-white/[0.01]">
        <div className="h-[52px] px-5 border-b border-white/[0.07] flex items-center">
          <span className="text-[16px] font-medium text-evah-text">
            Settings
          </span>
        </div>

        <div className="p-2 flex flex-col gap-1">
          {SECTIONS.map((sec) => {
            const isSelected = selectedSection === sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`w-full flex items-center gap-3.5 h-[44px] px-3.5 rounded-lg text-[14.5px] transition-colors duration-150 text-left ${
                  isSelected
                    ? 'bg-white/[0.08] text-evah-text font-medium'
                    : 'text-evah-secondary hover:text-evah-text hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-evah-accent' : 'text-evah-muted'} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Selected Settings Details */}
      <div className="flex-1 p-8 overflow-y-auto">
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl space-y-8"
        >
          {/* 1. APPEARANCE */}
          {selectedSection === 'Appearance' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  Atmosphere & Visuals
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Control the large celestial deep-space background and animation state.
                </p>
              </div>

              {/* Slider: Background Intensity */}
              <div className="space-y-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.01]">
                <div className="flex justify-between text-[14.5px]">
                  <span className="text-evah-text font-medium">Atmosphere Intensity</span>
                  <span className="font-mono text-evah-muted">{backgroundIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={backgroundIntensity}
                  onChange={(e) => setBackgroundIntensity(Number(e.target.value))}
                  className="w-full accent-evah-accent h-1.5 bg-white/[0.08] rounded cursor-pointer"
                />
                <p className="text-[12.5px] text-evah-muted">
                  Adjusts the presence of the black-hole accretion ring.
                </p>
              </div>

              {/* Toggle: Reduced Motion */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.01]">
                <div className="space-y-1">
                  <div className="text-[15px] text-evah-text font-medium">Reduced Motion</div>
                  <div className="text-[13px] text-evah-muted">
                    Pause celestial rotation and simplify interface transitions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 accent-evah-accent rounded cursor-pointer"
                />
              </div>

              {/* Action: Replay Boot Sequence */}
              <div className="pt-2">
                <button
                  onClick={handleRestartSequence}
                  className="h-10 flex items-center gap-2 px-3.5 rounded-lg text-[14px] font-medium text-evah-secondary hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Replay Boot Sequence</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. VOICE & TTS */}
          {selectedSection === 'Voice' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  Voice & Acoustic Engine
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Local Kokoro-82M TTS engine operating with offline female voice af_heart.
                </p>
              </div>

              {/* Hardware & Engine Status Card */}
              <div className="divide-y divide-white/[0.05] border border-white/[0.06] rounded-xl bg-white/[0.01] overflow-hidden">
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary flex items-center gap-2">
                    <Cpu size={16} className="text-evah-muted" />
                    <span>Hardware Backend</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-mono bg-white/[0.04] border border-white/[0.06] text-evah-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-evah-accent" />
                    <span>{ttsDevice === 'webgpu' ? 'WebGPU (fp32)' : 'WASM (q8)'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Model Profile</span>
                  <span className="font-mono text-evah-text text-[13px]">Kokoro-82M · af_heart</span>
                </div>

                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Engine State</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[13px] text-evah-success">
                    <CheckCircle2 size={14} />
                    <span className="capitalize">{ttsStatus === 'speaking' ? 'Speaking' : 'Active'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Cloud Independence</span>
                  <span className="font-mono text-evah-muted text-[13px]">100% Offline (No remote calls)</span>
                </div>
              </div>

              {/* Toggle: Voice Greetings & Responses */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.01]">
                <div className="space-y-1">
                  <div className="text-[15px] text-evah-text font-medium">Spoken Responses</div>
                  <div className="text-[13px] text-evah-muted">
                    Enable spoken session greetings and audible assistant replies.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceResponsesEnabled}
                  onChange={(e) => setVoiceResponsesEnabled(e.target.checked)}
                  className="w-4 h-4 accent-evah-accent rounded cursor-pointer"
                />
              </div>

              {/* Slider: Voice Speed */}
              <div className="space-y-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.01]">
                <div className="flex justify-between text-[14.5px]">
                  <span className="text-evah-text font-medium">Speech Rate</span>
                  <span className="font-mono text-evah-muted">{voiceSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                  className="w-full accent-evah-accent h-1.5 bg-white/[0.08] rounded cursor-pointer"
                />
                <div className="flex justify-between text-[12px] text-evah-muted font-mono">
                  <span>0.75x (Relaxed)</span>
                  <span>1.0x (Natural)</span>
                  <span>1.5x (Brisk)</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestVoice}
                  disabled={ttsStatus === 'loading'}
                  className="h-10 flex items-center gap-2 px-4 rounded-lg text-[14px] font-medium text-evah-text bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-colors disabled:opacity-50"
                >
                  {ttsStatus === 'loading' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-evah-accent animate-ping" />
                      <span>Preparing voice...</span>
                    </>
                  ) : ttsStatus === 'speaking' ? (
                    <>
                      <Square size={14} className="text-evah-danger" />
                      <span>Stop Voice Test</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="text-evah-accent" />
                      <span>Test Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 3. PRIVACY */}
          {selectedSection === 'Privacy' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  Telemetry & Footprint
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Strict local-first privacy guarantees without cloud synchronization.
                </p>
              </div>

              <div className="divide-y divide-white/[0.05] border border-white/[0.06] rounded-xl bg-white/[0.01] overflow-hidden">
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Telemetry outbound</span>
                  <span className="font-mono text-evah-success">Blocked (0 B/s)</span>
                </div>
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Crash reports</span>
                  <span className="font-mono text-evah-muted">Disabled</span>
                </div>
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Metadata indexing</span>
                  <span className="font-mono text-evah-text">Local RAM only</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. SECURITY */}
          {selectedSection === 'Security' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  Session Protection
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Automated lock timers and rapid media unseat protection.
                </p>
              </div>

              <div className="divide-y divide-white/[0.05] border border-white/[0.06] rounded-xl bg-white/[0.01] overflow-hidden">
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Auto-lock on inactivity</span>
                  <span className="font-mono text-evah-text">{autoLockMinutes} minutes</span>
                </div>
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Emergency memory wipe on unseat</span>
                  <span className="font-mono text-evah-success">Active</span>
                </div>
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Vault encryption cipher</span>
                  <span className="font-mono text-evah-muted">XChaCha20-Poly1305</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. AI */}
          {selectedSection === 'AI' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  EVAH Assistant
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Private on-device inference utility running offline.
                </p>
              </div>

              <div className="divide-y divide-white/[0.05] border border-white/[0.06] rounded-xl bg-white/[0.01] overflow-hidden">
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Quantization standard</span>
                  <span className="font-mono text-evah-text">1.58-bit ternary</span>
                </div>
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Context window</span>
                  <span className="font-mono text-evah-text">4,096 tokens</span>
                </div>
                <div className="flex items-center justify-between px-5 h-12 text-[14px]">
                  <span className="text-evah-secondary">Inference engine</span>
                  <span className="font-mono text-evah-accent">Local vector runtime</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. STORAGE */}
          {selectedSection === 'Storage' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  Hardware Media
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Encrypted partition utilization.
                </p>
              </div>

              <div className="border border-white/[0.06] rounded-xl p-5 bg-white/[0.01] space-y-4">
                <div className="flex justify-between text-[14.5px] font-mono">
                  <span className="text-evah-secondary">USB Drive (LUKS2)</span>
                  <span className="text-evah-text font-medium">4.2 GB / 64.0 GB</span>
                </div>
                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="w-[6.5%] h-full bg-evah-accent rounded-full" />
                </div>

                <div className="flex justify-between text-[13.5px] font-mono pt-3 border-t border-white/[0.05]">
                  <span className="text-evah-secondary">Volatile Ramdisk</span>
                  <span className="text-evah-text">128 MB / 4.0 GB</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. ABOUT */}
          {selectedSection === 'About' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-[19px] font-medium text-evah-text tracking-tight">
                  EVAH
                </h2>
                <p className="text-[14px] text-evah-muted">
                  Personal Digital Environment
                </p>
              </div>

              <div className="border border-white/[0.06] rounded-xl divide-y divide-white/[0.05] text-[14px] font-mono bg-white/[0.01] overflow-hidden">
                <div className="flex justify-between px-5 h-11 items-center">
                  <span className="text-evah-muted">Version</span>
                  <span className="text-evah-text">v2.4.0-hardened</span>
                </div>
                <div className="flex justify-between px-5 h-11 items-center">
                  <span className="text-evah-muted">Kernel</span>
                  <span className="text-evah-text">Linux RT 6.6.32</span>
                </div>
                <div className="flex justify-between px-5 h-11 items-center">
                  <span className="text-evah-muted">Design Aesthetic</span>
                  <span className="text-evah-text">end4 Hyprland Rice</span>
                </div>
                <div className="flex justify-between px-5 h-11 items-center">
                  <span className="text-evah-muted">Atmosphere</span>
                  <span className="text-evah-text">Perplexity Comet Deep Space</span>
                </div>
                <div className="flex justify-between px-5 h-11 items-center">
                  <span className="text-evah-muted">Voice Synthesis</span>
                  <span className="text-evah-text">Kokoro-82M (af_heart)</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
