import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Folder, 
  Lock, 
  Globe, 
  FileText, 
  Shield, 
  Settings,
  LucideIcon
} from 'lucide-react';
import { useEvahStore } from '../../store/useEvahStore';

interface DockItem {
  id: string;
  label: string;
  path: string;
  index: number;
  icon: LucideIcon;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'home', label: 'Home', path: '/home', index: 1, icon: Home },
  { id: 'files', label: 'Files', path: '/files', index: 2, icon: Folder },
  { id: 'vault', label: 'Vault', path: '/vault', index: 3, icon: Lock },
  { id: 'browser', label: 'Browser', path: '/browser', index: 4, icon: Globe },
  { id: 'notes', label: 'Notes', path: '/notes', index: 5, icon: FileText },
  { id: 'security', label: 'Security', path: '/security', index: 6, icon: Shield },
  { id: 'settings', label: 'Settings', path: '/settings', index: 7, icon: Settings },
];

export const BottomDock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reducedMotion } = useEvahStore();

  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const currentPath = location.pathname === '/' ? '/home' : location.pathname;

  // Clear hide timeout
  const cancelHide = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  // Schedule dock hiding with ~350ms delay
  const scheduleHide = () => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      setHoveredIndex(null);
    }, 350);
  };

  const handleTriggerEnter = () => {
    cancelHide();
    setIsVisible(true);
  };

  const handleDockEnter = () => {
    cancelHide();
    setIsVisible(true);
  };

  const handleDockLeave = () => {
    scheduleHide();
  };

  // Global Alt+1..7 shortcut handler to reveal and navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= 7) {
          e.preventDefault();
          const target = DOCK_ITEMS[keyNum - 1];
          if (target) {
            navigate(target.path);
            setIsVisible(true);
            scheduleHide();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelHide();
    };
  }, [navigate]);

  return (
    <>
      {/* 28px Invisible Bottom Trigger Proximity Zone */}
      <div
        className="fixed bottom-0 left-0 right-0 h-7 z-40 pointer-events-auto"
        onMouseEnter={handleTriggerEnter}
        onTouchStart={handleTriggerEnter}
        aria-hidden="true"
      />

      {/* Floating Centered Bottom Dock */}
      <AnimatePresence>
        {isVisible && (
          <div
            className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
          >
            <motion.nav
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleDockEnter}
              onMouseLeave={handleDockLeave}
              className="pointer-events-auto flex items-center gap-1.5 p-2 rounded-2xl border border-white/[0.07] shadow-panel backdrop-blur-md select-none"
              style={{
                backgroundColor: 'rgba(13, 17, 23, 0.82)',
              }}
              aria-label="Application Dock"
            >
              {DOCK_ITEMS.map((item, idx) => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                const isHovered = hoveredIndex === idx;
                const Icon = item.icon;

                return (
                  <div key={item.id} className="relative">
                    {/* Tooltip Label Appearing Above on Hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 2, scale: 0.94 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#111720]/95 border border-white/[0.08] text-[12.5px] font-sans text-evah-text pointer-events-none whitespace-nowrap shadow-subtle z-50 flex items-center gap-1.5"
                        >
                          <span>{item.label}</span>
                          <span className="text-[10.5px] font-mono text-evah-muted">Alt+{item.index}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Dock Icon Button (46px hit area, 21px icon) */}
                    <motion.button
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      whileHover={reducedMotion ? {} : { y: -2, scale: 1.05 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-colors duration-150 outline-none ${
                        isActive
                          ? 'bg-white/[0.09] text-evah-text'
                          : 'text-evah-secondary hover:text-evah-text hover:bg-white/[0.04]'
                      }`}
                      aria-label={`${item.label} (Alt+${item.index})`}
                    >
                      <Icon size={21} className={`transition-colors ${isActive ? 'text-evah-accent' : ''}`} />

                      {/* Discrete Active Indicator Dot */}
                      {isActive && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-evah-accent" />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
