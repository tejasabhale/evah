import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvahStore } from '../../store/useEvahStore';
import { 
  Sparkles, 
  HardDrive, 
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldAlert
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
    setCommandPaletteOpen 
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

  return (
    <header className="h-14 border-b border-evah-border bg-evah-bg/85 backdrop-blur-md px-5 flex items-center justify-between select-none z-30 transition-colors duration-200">
      {/* Left: EVAH Brand Title (24-28px scale, desktop clickable) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none h-10 px-1 rounded-md"
        >
          <span className="text-[25px] font-medium tracking-tight text-evah-text group-hover:text-evah-accent transition-colors duration-200">
            EVAH
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[12px] font-mono text-evah-muted bg-white/[0.04] border border-white/[0.06]">
            v2.4
          </span>
        </button>
      </div>

      {/* Center: Current Workspace Title */}
      <div className="flex items-center gap-2 text-center">
        <span className="text-[16px] font-medium text-evah-text tracking-tight">
          {currentPageTitle}
        </span>
      </div>

      {/* Right: Controls & Status with comfortable min 40-44px targets */}
      <div className="flex items-center gap-3">
        {/* Quick Search trigger (min 40px height) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2.5 h-10 px-3.5 rounded-lg bg-evah-surface/70 hover:bg-evah-surface border border-evah-border text-evah-muted hover:text-evah-secondary text-[14px] transition-colors group"
          title="Command Palette (Cmd+K)"
        >
          <Search size={18} className="text-evah-muted group-hover:text-evah-accent transition-colors" />
          <span className="text-[14px]">Search...</span>
          <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-evah-muted border border-white/[0.06]">
            ⌘K
          </kbd>
        </button>

        {/* Ask EVAH AI Button (42px height, 20px icon, 15px text) */}
        <button
          onClick={toggleAiPanel}
          className={`flex items-center gap-2 h-10 px-3.5 rounded-lg text-[14.5px] font-medium transition-all duration-200 border ${
            aiPanelOpen 
              ? 'bg-evah-surface2 text-evah-accent border-evah-accent/40 shadow-glow-accent'
              : 'bg-white/[0.03] text-evah-secondary hover:text-evah-text hover:bg-white/[0.07] border-white/[0.07]'
          }`}
          title="Toggle EVAH Assistant"
        >
          <Sparkles size={19} className="text-evah-accent" />
          <span className="hidden sm:inline">Ask EVAH</span>
        </button>

        {/* USB Connection Status (Actionable to test disconnect) */}
        <button
          onClick={toggleUsbConnection}
          className={`group flex items-center gap-2.5 h-10 px-3.5 rounded-lg text-[14px] transition-all duration-200 border ${
            usbConnected
              ? 'text-evah-secondary hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.07]'
              : 'text-evah-danger bg-evah-danger/15 border-evah-danger/30'
          }`}
          title={usbConnected ? 'Click to simulate USB Ejection' : 'Click to re-mount USB'}
        >
          <span 
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              usbConnected 
                ? 'bg-evah-success group-hover:bg-evah-accent' 
                : 'bg-evah-danger animate-pulse'
            }`} 
          />
          <span className="hidden lg:inline text-[13.5px]">
            {usbConnected ? 'USB Connected' : 'USB Ejected'}
          </span>
        </button>

        {/* Settings Shortcut Button */}
        <button
          onClick={() => navigate('/settings')}
          className="h-10 w-10 flex items-center justify-center rounded-lg text-evah-muted hover:text-evah-text hover:bg-white/[0.05] border border-white/[0.05] transition-colors"
          title="Settings"
        >
          <SettingsIcon size={19} />
        </button>

        {/* Clock */}
        <div className="text-[14px] font-mono text-evah-muted pl-1 hidden sm:block">
          {time}
        </div>
      </div>
    </header>
  );
};
