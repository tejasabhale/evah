import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvahStore } from '../../store/useEvahStore';
import { 
  Search, 
  Home, 
  Folder, 
  Lock, 
  Globe, 
  FileText, 
  Shield, 
  Settings, 
  Sparkles, 
  HardDrive, 
  Radio, 
  FileCode,
  LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Files';
  icon: LucideIcon;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    toggleAiPanel, 
    toggleUsbConnection, 
    isVaultLocked, 
    lockVault, 
    lockSession, 
    securityMode, 
    setSecurityMode,
    files,
  } = useEvahStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Go to Home',
      category: 'Navigation',
      icon: Home,
      action: () => navigate('/home'),
      shortcut: 'Super+1',
    },
    {
      id: 'nav-files',
      title: 'Open Files',
      category: 'Navigation',
      icon: Folder,
      action: () => navigate('/files'),
      shortcut: 'Super+2',
    },
    {
      id: 'nav-vault',
      title: 'Open Vault',
      category: 'Navigation',
      icon: Lock,
      action: () => navigate('/vault'),
      shortcut: 'Super+3',
    },
    {
      id: 'nav-browser',
      title: 'Open Browser',
      category: 'Navigation',
      icon: Globe,
      action: () => navigate('/browser'),
      shortcut: 'Super+4',
    },
    {
      id: 'nav-notes',
      title: 'Open Notes',
      category: 'Navigation',
      icon: FileText,
      action: () => navigate('/notes'),
      shortcut: 'Super+5',
    },
    {
      id: 'nav-security',
      title: 'Open Security Status',
      category: 'Navigation',
      icon: Shield,
      action: () => navigate('/security'),
      shortcut: 'Super+6',
    },
    {
      id: 'nav-settings',
      title: 'Open Settings',
      category: 'Navigation',
      icon: Settings,
      action: () => navigate('/settings'),
      shortcut: 'Super+7',
    },

    // Actions
    {
      id: 'act-ai',
      title: 'Ask EVAH Assistant',
      category: 'Actions',
      icon: Sparkles,
      action: () => toggleAiPanel(),
      shortcut: '⌘J',
    },
    {
      id: 'act-lock-session',
      title: 'Lock Current Session',
      category: 'Actions',
      icon: Lock,
      action: () => {
        lockSession();
        toast.info('Session locked');
      },
      shortcut: '⌘L',
    },
    {
      id: 'act-toggle-usb',
      title: 'Toggle USB Drive (Eject / Connect)',
      category: 'Actions',
      icon: HardDrive,
      action: () => toggleUsbConnection(),
    },
    {
      id: 'act-lock-vault',
      title: isVaultLocked ? 'Vault is currently locked' : 'Lock Encrypted Vault',
      category: 'Actions',
      icon: Lock,
      action: () => {
        lockVault();
        toast.info('Vault locked');
      },
    },
    {
      id: 'act-airgap',
      title: securityMode === 'airgap' ? 'Disable Airgap Mode' : 'Enable Airgap Mode (Drop network)',
      category: 'Actions',
      icon: Radio,
      action: () => {
        const next = securityMode === 'airgap' ? 'protected' : 'airgap';
        setSecurityMode(next);
        toast.success(`Mode changed to ${next.toUpperCase()}`);
      },
    },

    // Files
    ...files.map((file) => ({
      id: `file-${file.id}`,
      title: `Open file: ${file.name}`,
      category: 'Files' as const,
      icon: FileCode,
      action: () => {
        if (file.type === 'markdown') {
          navigate('/notes');
        } else {
          navigate('/files');
        }
      },
    })),
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm select-none"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-evah-surface border border-evah-border rounded-xl shadow-panel overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar (min 48px height, 15px font) */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-evah-border bg-white/[0.01]">
              <Search size={20} className="text-evah-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, views, or files..."
                className="w-full bg-transparent text-[15.5px] text-evah-text placeholder:text-evah-muted outline-none"
              />
              <kbd className="text-[12px] font-mono text-evah-muted px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-[14px] text-evah-muted">
                  No matching commands found.
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setCommandPaletteOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between h-11 px-3.5 rounded-lg text-left transition-colors duration-100 ${
                        isSelected 
                          ? 'bg-white/[0.08] text-evah-text' 
                          : 'text-evah-secondary hover:text-evah-text hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={20} className={`shrink-0 ${isSelected ? 'text-evah-accent' : 'text-evah-muted'}`} />
                        <span className="text-[15px] truncate font-normal">{item.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[12px] font-mono text-evah-muted px-1.5 py-0.5 rounded bg-white/[0.03]">
                          {item.category}
                        </span>
                        {item.shortcut && (
                          <kbd className="text-[12px] font-mono text-evah-muted px-2 py-0.5 rounded bg-white/[0.05]">
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-evah-border bg-white/[0.01] flex items-center justify-between text-[13px] font-mono text-evah-muted">
              <span>↑↓ to navigate</span>
              <span>ENTER to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
