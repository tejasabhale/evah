import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { SpaceAtmosphere } from '../background/SpaceAtmosphere';
import { AskEvahPanel } from '../ai/AskEvahPanel';
import { CommandPalette } from '../common/CommandPalette';
import { StartupSequence } from '../sequences/StartupSequence';
import { LockOverlay } from '../sequences/LockOverlay';

export const DesktopLayout: React.FC = () => {
  const location = useLocation();
  
  // Single global Lenis smooth scrolling instance attached to the main workspace container
  const { containerRef } = useLenisScroll<HTMLDivElement>();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-evah-bg text-evah-text flex flex-col font-sans select-none">
      {/* 1. Deep Space Atmosphere Background (Enlarged subtle black hole) */}
      <SpaceAtmosphere />

      {/* 2. Coordinated GSAP Boot Sequence Overlay */}
      <StartupSequence />

      {/* 3. Coordinated GSAP Emergency Lock Overlay */}
      <LockOverlay />

      {/* 4. Top Bar (Persistent desktop bar) */}
      <TopBar />

      {/* 5. Middle Workspace: Left Sidebar + Main Content (Persistent shell) */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Workspace with Mac-style smooth Lenis scrolling */}
        <main
          ref={containerRef}
          className="flex-1 overflow-y-auto relative outline-none"
          tabIndex={-1}
        >
          <div className="min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 6. Ask EVAH Floating Drawer */}
      <AskEvahPanel />

      {/* 7. Command Palette Modal (Super+K / ⌘K) */}
      <CommandPalette />
    </div>
  );
};
