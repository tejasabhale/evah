import { BlackHoleState, TTSDevice, TTSDtype, TTSStatus, SessionEventType } from '../services/tts/types';

export type NavigationTab = 
  | 'home' 
  | 'files' 
  | 'vault' 
  | 'browser' 
  | 'notes' 
  | 'security' 
  | 'settings';

export interface FileItem {
  id: string;
  name: string;
  modified: string;
  size: string;
  type: 'markdown' | 'pdf' | 'json' | 'image' | 'archive' | 'code';
  category: string;
  content?: string;
  tags?: string[];
}

export type VaultCategory = 'Personal' | 'Projects' | 'Documents' | 'Memory';

export interface VaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  type: 'key' | 'credential' | 'secret_note' | 'token';
  preview: string;
  value: string;
  lastAccessed: string;
}

export interface NoteItem {
  id: string;
  title: string;
  category: 'Architecture' | 'Ideas' | 'Security' | 'Projects';
  content: string;
  modified: string;
}

export interface SecurityActivity {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface SystemState {
  // Connectivity & Security
  usbConnected: boolean;
  isVaultLocked: boolean;
  isSessionLocked: boolean;
  securityMode: 'protected' | 'airgap' | 'isolated';
  
  // Audio & Black Hole States
  blackHoleState: BlackHoleState;
  hasGreetedThisSession: boolean;
  voiceResponsesEnabled: boolean;
  voiceSpeed: number;
  voiceVolume: number;
  ttsDevice: TTSDevice;
  ttsDtype: TTSDtype;
  ttsStatus: TTSStatus;
  voiceAutoplayPending: boolean;
  
  // UI states
  activeTab: NavigationTab;
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  commandPaletteOpen: boolean;
  bootSequenceFinished: boolean;
  
  // Settings
  backgroundIntensity: number; // 0-100
  reducedMotion: boolean;
  autoLockMinutes: number;
  
  // Content states
  activeNoteId: string;
  browserUrl: string;
  searchQuery: string;
  
  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  unlockVault: (passphrase: string) => boolean;
  lockVault: () => void;
  toggleUsbConnection: () => void;
  setUsbConnected: (connected: boolean) => void;
  unlockSession: () => void;
  lockSession: () => void;
  handleSessionEvent: (event: SessionEventType) => void;
  triggerSessionGreeting: () => void;
  setBlackHoleState: (state: BlackHoleState) => void;
  setVoiceResponsesEnabled: (enabled: boolean) => void;
  setVoiceSpeed: (speed: number) => void;
  setVoiceVolume: (volume: number) => void;
  setHasGreetedThisSession: (greeted: boolean) => void;
  setSecurityMode: (mode: 'protected' | 'airgap' | 'isolated') => void;
  setBootSequenceFinished: (finished: boolean) => void;
  setActiveNoteId: (id: string) => void;
  setBrowserUrl: (url: string) => void;
  setSearchQuery: (q: string) => void;
  setBackgroundIntensity: (val: number) => void;
  setReducedMotion: (val: boolean) => void;
  addActivity: (activity: Omit<SecurityActivity, 'id' | 'timestamp'>) => void;
}
