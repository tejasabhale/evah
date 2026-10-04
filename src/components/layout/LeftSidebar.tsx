import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvahStore } from '../../store/useEvahStore';
import { NavigationTab } from '../../types';
import { 
  Home, 
  Folder, 
  Lock, 
  Globe, 
  FileText, 
  Shield, 
  Settings, 
  PanelLeftClose, 
  PanelLeft,
  LucideIcon
} from 'lucide-react';

interface NavItemConfig {
  id: NavigationTab;
  label: string;
  path: string;
  icon: LucideIcon;
}

const PRIMARY_NAV: NavItemConfig[] = [
  { id: 'home', label: 'Home', path: '/home', icon: Home },
  { id: 'files', label: 'Files', path: '/files', icon: Folder },
  { id: 'vault', label: 'Vault', path: '/vault', icon: Lock },
  { id: 'browser', label: 'Browser', path: '/browser', icon: Globe },
  { id: 'notes', label: 'Notes', path: '/notes', icon: FileText },
];

const SECONDARY_NAV: NavItemConfig[] = [
  { id: 'security', label: 'Security', path: '/security', icon: Shield },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, isVaultLocked } = useEvahStore();

  const currentPath = location.pathname === '/' ? '/home' : location.pathname;

  const renderItem = (item: NavItemConfig) => {
    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`relative w-full flex items-center h-11 px-3 rounded-lg transition-colors duration-150 group text-left select-none ${
          isActive 
            ? 'text-evah-text font-medium' 
            : 'text-evah-secondary hover:text-evah-text hover:bg-white/[0.04]'
        }`}
        title={sidebarCollapsed ? item.label : undefined}
      >
        {/* Subtle active pill indicator with Framer Motion */}
        {isActive && (
          <motion.div
            layoutId="activeNavPill"
            className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.08]"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}

        {/* Small active left accent notch */}
        {isActive && (
          <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-evah-accent rounded-r" />
        )}

        <div className="relative z-10 flex items-center gap-3.5 w-full">
          <Icon 
            size={21}
            className={`shrink-0 transition-colors duration-150 ${
              isActive ? 'text-evah-accent' : 'text-evah-muted group-hover:text-evah-secondary'
            }`} 
          />
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between flex-1 overflow-hidden">
              <span className="text-[15.5px] truncate font-normal tracking-tight">
                {item.label}
              </span>
              {item.id === 'vault' && isVaultLocked && (
                <span className="text-[12px] font-mono text-evah-muted px-1.5 py-0.5 rounded bg-white/[0.04]">
                  locked
                </span>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 68 : 224 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 h-full border-r border-evah-border bg-evah-bg/75 backdrop-blur-md flex flex-col justify-between p-2.5 select-none z-20"
    >
      {/* Navigation Sections */}
      <div className="flex flex-col gap-4">
        {/* Primary Workspace Nav with 8px spacing */}
        <nav className="flex flex-col gap-1.5" aria-label="Primary Navigation">
          {PRIMARY_NAV.map(renderItem)}
        </nav>

        {/* Subtle separator */}
        <div className="h-[1px] bg-evah-border/80 mx-2" />

        {/* Secondary System Nav */}
        <nav className="flex flex-col gap-1.5" aria-label="System Navigation">
          {SECONDARY_NAV.map(renderItem)}
        </nav>
      </div>

      {/* Bottom Sidebar Collapse Toggle */}
      <div className="pt-2 border-t border-evah-border/60">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-evah-muted hover:text-evah-secondary hover:bg-white/[0.04] transition-colors duration-150 text-[14px]"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft size={20} className="mx-auto text-evah-muted" />
          ) : (
            <>
              <PanelLeftClose size={20} className="text-evah-muted" />
              <span className="truncate text-[14px]">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
