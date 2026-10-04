import { create } from 'zustand';
import { NavigationTab, FileItem, VaultItem, NoteItem, SecurityActivity, SystemState } from '../types';

const INITIAL_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'EVAH Architecture.md',
    modified: 'Today, 14:22',
    size: '14.2 KB',
    type: 'markdown',
    category: 'Documentation',
    content: `# EVAH Architecture Overview

EVAH is a portable personal digital environment conceived for zero-trust, local-first computing.

## Principles
- **Total Portability**: The entire state resides on hardware-encrypted media.
- **Zero Cloud Leakage**: No telemetry, no third-party telemetry beacons.
- **Minimalist Surface**: Linux desktop ergonomics inspired by Hyprland and Wayland tiling aesthetics.
- **Airgap Preparedness**: Fully functional without network connectivity.

## Memory Layer
Volatile runtime cache operates in an isolated ramdisk mounted with noexec,nosuid,nodev flags. On USB dismount, memory is wiped with zeroes before kernel shutdown.`,
    tags: ['core', 'spec', 'active']
  },
  {
    id: 'f2',
    name: 'Security Notes.md',
    modified: 'Today, 11:05',
    size: '6.4 KB',
    type: 'markdown',
    category: 'Security',
    content: `# Security Notes & Threat Model

### Cryptographic Configuration
- **Symmetric Encryption**: XChaCha20-Poly1305 with Argon2id KDF (m=64MB, t=3, p=4).
- **Asymmetric Layer**: Ed25519 for identity signing and X25519 for ephemeral key exchange.
- **Vault State**: Locked by default upon boot. Auto-locks after 5 minutes of inactivity.

### Peripheral Rules
1. Unsolicited USB devices disabled via udev rules.
2. Hardware USB write-protection switch respected.
3. Rapid disconnect triggers emergency memory zeroing.`,
    tags: ['security', 'cryptography']
  },
  {
    id: 'f3',
    name: 'Project Report.pdf',
    modified: 'Yesterday, 19:40',
    size: '1.8 MB',
    type: 'pdf',
    category: 'Projects',
    content: `[Binary Document Preview: Decentra v2 Milestone Q3 Summary]
Total offline verified nodes: 48
Cryptographic test passes: 1,420 / 1,420
Latency overhead of memory envelope: 0.8ms`,
    tags: ['report', 'q3']
  },
  {
    id: 'f4',
    name: 'config.json',
    modified: 'Yesterday, 09:15',
    size: '2.4 KB',
    type: 'json',
    category: 'System',
    content: `{
  "evah_version": "2.4.0-hardened",
  "kernel": "linux-rt-lts-6.6.32",
  "window_manager": "hyprland-rice-end4",
  "security": {
    "auto_lock_seconds": 300,
    "shred_on_eject": true,
    "airgap_mode": false
  },
  "display": {
    "fps_cap": 60,
    "background_celestial": "singularity_alpha",
    "reduced_motion": false
  }
}`,
    tags: ['system', 'config']
  },
  {
    id: 'f5',
    name: 'id_ed25519.pub',
    modified: 'Oct 02, 17:11',
    size: '180 B',
    type: 'code',
    category: 'Security',
    content: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC78X3yqY9MvO5x98KpQmH7JbZw1Lk0eF6aP8Qv9Wx2L evah@portable-vault`,
    tags: ['ssh', 'keys']
  },
  {
    id: 'f6',
    name: 'system_backup.tar.gz',
    modified: 'Sep 28, 04:30',
    size: '48.2 MB',
    type: 'archive',
    category: 'Backup',
    content: `[Encrypted GPG Archive - Checksum: 8a42f...c930]`,
    tags: ['backup', 'tar']
  }
];

const INITIAL_VAULT: VaultItem[] = [
  {
    id: 'v1',
    title: 'Hardware Root GPG Key',
    category: 'Personal',
    type: 'key',
    preview: 'secp256k1 / Key ID: 0x9B4E38F1',
    value: 'pub   ed25519/0x9B4E38F1 2026-01-15 [SC]\nKey fingerprint = 8F40 2A31 BC77 910E 4F22  AA01 9B4E 38F1 00C4 DE89',
    lastAccessed: '2 hours ago'
  },
  {
    id: 'v2',
    title: 'Personal Seedphrase (Cold Backup)',
    category: 'Personal',
    type: 'credential',
    preview: '24-word BIP-39 mnemonic phrase',
    value: 'timber canyon velvet orbit dynamic solar crisp horizon whisper quantum anchor drift logic polar sphere radar ember summit pulse alpine nexus shadow echo ember',
    lastAccessed: 'Oct 01'
  },
  {
    id: 'v3',
    title: 'Cluster Deploy Token (Node #01)',
    category: 'Projects',
    type: 'token',
    preview: 'evah_live_sec_7x89...99a0',
    value: 'evah_live_sec_7x89q39fkla0921kldmsa9012398fa9099a0',
    lastAccessed: 'Yesterday'
  },
  {
    id: 'v4',
    title: 'Zero-Knowledge Credential Hash',
    category: 'Documents',
    type: 'secret_note',
    preview: 'Poseidon Hash: 0x19a8f4c...3e1',
    value: 'ZK-SNARK Proof verifying ownership of Decentra Genesis Validator #009 without disclosing public identity.',
    lastAccessed: '3 days ago'
  },
  {
    id: 'v5',
    title: 'Local AI Weights Encryption Key',
    category: 'Memory',
    type: 'key',
    preview: 'AES-256 GCM Key (Salt: 0x4f82)',
    value: '4a99fc01e82811a2bd440199ecca012487ab91136d8841028751fa0b2299cc01',
    lastAccessed: '5 days ago'
  }
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Architecture',
    category: 'Architecture',
    modified: 'Today, 14:15',
    content: `# Architecture Guidelines

EVAH prioritizes serenity and operational clarity.

- **No Distractions**: The user controls when information is pulled; no notifications push themselves unsolicited.
- **Hyprland Cleanliness**: Inspired by end4 rices: 1px subtle borders, 6px subtle inner rounding, restrained contrast.
- **Perplexity Comet Atmosphere**: The backdrop is not a showy game engine; it is a serene black hole horizon that gives depth to the dark canvas without straining GPU or distracting thought.

\`\`\`bash
# Current mount points
/dev/sda1 -> /run/media/evah-system [ro]
/dev/sda2 -> /run/media/evah-secure [rw,luks2]
\`\`\`
`
  },
  {
    id: 'n2',
    title: 'Ideas',
    category: 'Ideas',
    modified: 'Yesterday, 18:20',
    content: `# Ideas & Explorations

- [x] Integrate lightweight Lenis smooth inertia on workspace lists
- [x] Coordinated GSAP emergency lock sequence when USB drive is unseated
- [ ] Direct Bluetooth LE proximity beacon for hands-free auto-pause
- [ ] Offline local RAG memory index running 1-bit quantized llama.cpp
- [ ] Monochromatic status bar mode for ultra-dim nighttime environments
`
  },
  {
    id: 'n3',
    title: 'Security',
    category: 'Security',
    modified: 'Oct 02, 10:45',
    content: `# Security Checklist

1. Hardware write-block verify: PASSED
2. Core integrity checksum match: SHA-512 VERIFIED
3. Ramdisk zero-fill routine benchmark: 480MB/s
4. Network leakage test: 0 packets leaked in Airgap state

> Remember: Treat all external USB host controllers as untrusted until attestation handshake concludes.
`
  },
  {
    id: 'n4',
    title: 'Projects',
    category: 'Projects',
    modified: 'Sep 29, 21:00',
    content: `# Decentra v2 Workspace Spec

Portable runtime targets:
- Arch Linux RT kernel
- Wayland / Hyprland compositor
- Custom Waybar top panel
- WebKitGTK / Chromium micro-runtime for web tasks
- Fast cold boot under 1.4 seconds from high-speed USB 3.2 Gen 2
`
  }
];

const INITIAL_ACTIVITIES: SecurityActivity[] = [
  {
    id: 'a1',
    action: 'Session started',
    details: 'Hardware identity verified via hardware key',
    timestamp: '10 mins ago',
    status: 'success'
  },
  {
    id: 'a2',
    action: 'USB Connected',
    details: 'SanDisk Ultra Fit (64GB, LUKS2 encrypted)',
    timestamp: '10 mins ago',
    status: 'success'
  },
  {
    id: 'a3',
    action: 'File accessed',
    details: 'EVAH Architecture.md read',
    timestamp: '5 mins ago',
    status: 'info'
  },
  {
    id: 'a4',
    action: 'Integrity check passed',
    details: 'Kernel hash: 6.6.32-rt-lts verified',
    timestamp: '1 min ago',
    status: 'success'
  }
];

interface EvahExtendedStore extends SystemState {
  files: FileItem[];
  vaultItems: VaultItem[];
  notes: NoteItem[];
  activities: SecurityActivity[];
  updateNoteContent: (id: string, content: string) => void;
  createNote: (category: NoteItem['category']) => void;
  addVaultItem: (item: Omit<VaultItem, 'id' | 'lastAccessed'>) => void;
  deleteVaultItem: (id: string) => void;
}

export const useEvahStore = create<EvahExtendedStore>((set, get) => ({
  // Core system states
  usbConnected: true,
  isVaultLocked: true,
  isSessionLocked: false,
  securityMode: 'protected',
  
  // UI states
  activeTab: 'home',
  sidebarCollapsed: false,
  aiPanelOpen: false,
  commandPaletteOpen: false,
  bootSequenceFinished: false,
  
  // Settings
  backgroundIntensity: 85,
  reducedMotion: false,
  autoLockMinutes: 5,
  
  // Content states
  activeNoteId: 'n1',
  browserUrl: 'https://docs.evah.local/architecture',
  searchQuery: '',
  
  // Data
  files: INITIAL_FILES,
  vaultItems: INITIAL_VAULT,
  notes: INITIAL_NOTES,
  activities: INITIAL_ACTIVITIES,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  
  unlockVault: (passphrase: string) => {
    // Standard mock pass or anything with >= 3 chars
    if (passphrase.trim().length >= 3) {
      set({ isVaultLocked: false });
      get().addActivity({
        action: 'Vault opened',
        details: 'Unlocked with user passphrase',
        status: 'success'
      });
      return true;
    }
    return false;
  },
  
  lockVault: () => {
    set({ isVaultLocked: true });
    get().addActivity({
      action: 'Vault locked',
      details: 'Encryption keys evicted from RAM',
      status: 'info'
    });
  },
  
  toggleUsbConnection: () => {
    const isConn = get().usbConnected;
    if (isConn) {
      // Disconnect
      set({ 
        usbConnected: false, 
        isVaultLocked: true, 
        isSessionLocked: true 
      });
      get().addActivity({
        action: 'USB Disconnected',
        details: 'Media unseated. Session locked & memory zeroed.',
        status: 'warning'
      });
    } else {
      // Reconnect
      set({ 
        usbConnected: true,
        isSessionLocked: false
      });
      get().addActivity({
        action: 'USB Connected',
        details: 'SanDisk Ultra Fit re-mounted successfully',
        status: 'success'
      });
    }
  },

  setUsbConnected: (connected: boolean) => set({ usbConnected: connected }),
  unlockSession: () => set({ isSessionLocked: false }),
  lockSession: () => set({ isSessionLocked: true }),
  setSecurityMode: (mode) => {
    set({ securityMode: mode });
    get().addActivity({
      action: `Security mode changed`,
      details: `Switched to ${mode.toUpperCase()} profile`,
      status: mode === 'isolated' ? 'warning' : 'info'
    });
  },
  
  setBootSequenceFinished: (finished) => set({ bootSequenceFinished: finished }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setBrowserUrl: (url) => set({ browserUrl: url }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setBackgroundIntensity: (val) => set({ backgroundIntensity: val }),
  setReducedMotion: (val) => set({ reducedMotion: val }),
  
  addActivity: (activity) => set((state) => ({
    activities: [
      {
        ...activity,
        id: 'act_' + Date.now(),
        timestamp: 'Just now'
      },
      ...state.activities.slice(0, 19)
    ]
  })),

  updateNoteContent: (id, content) => set((state) => ({
    notes: state.notes.map((n) => 
      n.id === id 
        ? { ...n, content, modified: 'Just now' } 
        : n
    )
  })),

  createNote: (category) => {
    const newId = 'n_' + Date.now();
    const newNote: NoteItem = {
      id: newId,
      title: 'Untitled Note',
      category,
      content: '# Untitled Note\n\nStart typing your private note here...',
      modified: 'Just now'
    };
    set((state) => ({
      notes: [newNote, ...state.notes],
      activeNoteId: newId
    }));
    get().addActivity({
      action: 'Note created',
      details: `Created new note in ${category}`,
      status: 'info'
    });
  },

  addVaultItem: (item) => {
    const newItem: VaultItem = {
      ...item,
      id: 'v_' + Date.now(),
      lastAccessed: 'Just now'
    };
    set((state) => ({
      vaultItems: [newItem, ...state.vaultItems]
    }));
    get().addActivity({
      action: 'Secret stored',
      details: `Added ${item.title} to encrypted vault`,
      status: 'success'
    });
  },

  deleteVaultItem: (id) => {
    set((state) => ({
      vaultItems: state.vaultItems.filter((i) => i.id !== id)
    }));
    get().addActivity({
      action: 'Secret shredded',
      details: 'Item securely scrubbed from storage',
      status: 'warning'
    });
  }
}));
