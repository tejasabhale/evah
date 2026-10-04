import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvahStore } from '../../store/useEvahStore';
import { ttsService } from '../../services/tts/ttsService';
import { 
  Sparkles, 
  Search,
  Settings as SettingsIcon,
  Volume2
} from 'lucide-react';

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/home': 'Home',
  '/files': 'Files',
  '/vault': 'Vault',
  '/browser': 'Browser',
  '/notes': 'Notes',
  '/security': 'Security',
  '/settings': 'Settings',
};

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    usbConnected, 
    toggleUsbConnection, 
    toggleAiPanel, 
    aiPanelOpen,
    setCommandPaletteOpen,
    blackHoleState,
    ttsStatus,
    voiceAutoplayPending
  } = useEvahStore();

  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentPageTitle = PAGE_NAMES[location.pathname] || 'Workspace';
  const isSpeaking = ttsStatus === 'speaking' || blackHoleState === 'speaking' || blackHoleState === 'greeting';

  return (
    <header className="h-12 border-b border-white/[0.06] bg-[#07090D]/85 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 transition-colors duration-200">
      {/* Left: EVAH Brand Title & Discrete Speaking Indicator */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 group text-left focus:outline-none h-8 px-1.5 rounded-md hover:bg-white/[0.03] transition-colors"
          title="EVAH Home"
        >
          {/* Discrete status dot / pulsing speaking indicator */}
          {isSpeaking ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-evah-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-evah-accent" />
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-evah-accent transition-colors" />
          )}

          <span className="text-[17px] font-medium tracking-tight text-evah-text group-hover:text-white transition-colors">
            EVAH
          </span>

          {isSpeaking && (
            <span className="flex items-center gap-1 text-[12px] font-sans text-evah-accent/90 pl-1 animate-pulse">
              <span>·</span>
              <span>Speaking</span>
              <Volume2 size={12} className="inline ml-0.5" />
            </span>
          )}
        </button>

        {voiceAutoplayPending && (
          <button
            onClick={() => ttsService.unlockAutoplayManually()}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-sans text-evah-accent bg-evah-accent/10 border border-evah-accent/25 hover:bg-evah-accent/20 transition-colors animate-pulse"
            title="Click to enable greeting audio"
          >
            <Volume2 size={12} />
            <span>Voice ready · Click to enable</span>
          </button>
        )}
      </div>

      {/* Center: Current Workspace Title */}
      <div className="flex items-center gap-2 text-center">
        <span className="text-[14px] font-normal text-evah-secondary tracking-tight">
          {currentPageTitle}
        </span>
      </div>

      {/* Right: Controls & Status */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-evah-muted hover:text-evah-secondary text-[13px] transition-colors group"
          title="Command Palette (Alt+Space / Cmd+K)"
        >
          <Search size={14} className="text-evah-muted group-hover:text-evah-accent transition-colors" />
          <span>Search...</span>
          <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/[0.04] text-evah-muted border border-white/[0.05]">
            ⌘K
          </kbd>
        </button>

        {/* Ask EVAH AI Button */}
        <button
          onClick={toggleAiPanel}
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[13px] font-medium transition-all duration-200 border ${
            aiPanelOpen 
              ? 'bg-white/[0.08] text-evah-accent border-evah-accent/30'
              : 'bg-white/[0.02] text-evah-secondary hover:text-evah-text hover:bg-white/[0.05] border-white/[0.06]'
          }`}
          title="Toggle EVAH Assistant"
        >
          <Sparkles size={14} className="text-evah-accent" />
          <span className="hidden sm:inline">Ask EVAH</span>
        </button>

        {/* USB Connection Status */}
        <button
          onClick={toggleUsbConnection}
          className={`group flex items-center gap-2 h-8 px-2.5 rounded-md text-[12.5px] transition-all duration-200 border ${
            usbConnected
              ? 'text-evah-secondary hover:text-evah-text bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
              : 'text-evah-danger bg-evah-danger/10 border-evah-danger/25'
          }`}
          title={usbConnected ? 'Click to simulate USB Ejection' : 'Click to re-mount USB'}
        >
          <span 
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              usbConnected 
                ? 'bg-evah-success group-hover:bg-evah-accent' 
                : 'bg-evah-danger animate-pulse'
            }`} 
          />
          <span className="hidden lg:inline text-[12px] font-mono">
            {usbConnected ? 'USB Connected' : 'USB Ejected'}
          </span>
        </button>

        {/* Settings Shortcut Button */}
        <button
          onClick={() => navigate('/settings')}
          className="h-8 w-8 flex items-center justify-center rounded-md text-evah-muted hover:text-evah-text hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-colors"
          title="Settings (Alt+7)"
        >
          <SettingsIcon size={16} />
        </button>

        {/* Clock */}
        <div className="text-[13px] font-mono text-evah-muted pl-1 hidden sm:block">
          {time}
        </div>
      </div>
    </header>
  );
};
