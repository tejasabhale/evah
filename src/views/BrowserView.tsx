import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEvahStore } from '../store/useEvahStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Sparkles, 
  Globe
} from 'lucide-react';

interface LocalPage {
  url: string;
  title: string;
  badge: string;
  content: {
    heading: string;
    subheading: string;
    paragraphs: string[];
    specs?: { label: string; value: string }[];
  };
}

const PAGES: Record<string, LocalPage> = {
  'https://docs.evah.local/architecture': {
    url: 'https://docs.evah.local/architecture',
    title: 'EVAH Architecture Specification',
    badge: 'Offline Local',
    content: {
      heading: 'EVAH Architecture & Security Manual',
      subheading: 'Portable computing environment based on hardware isolation and zero-cloud trust.',
      paragraphs: [
        'EVAH operates entirely within a secure hardware perimeter. All working datasets are encrypted using authenticated ciphers and decrypted only in RAM upon successful user key presentation.',
        'Network access is treated as an optional, untrusted peripheral. In Airgap profile, hardware networking interfaces are disabled at the kernel sysfs level.',
        'The interface aesthetic draws direct inspiration from modern, polished Linux tiling environments (such as end4-style Hyprland rices), prioritizing high visual ergonomics, restrained contrast, and low cognitive noise.'
      ],
      specs: [
        { label: 'Runtime Environment', value: 'Linux RT 6.6.32 / Wayland' },
        { label: 'Cryptographic Standard', value: 'XChaCha20-Poly1305 / Argon2id' },
        { label: 'Storage Driver', value: 'LUKS2 Hardware-Optimized' },
        { label: 'Telemetry Egress', value: '0 bytes (Completely disabled)' },
      ]
    }
  },
  'http://localhost:8080/node-status': {
    url: 'http://localhost:8080/node-status',
    title: 'Decentra Node #01 Daemon Status',
    badge: 'Loopback 127.0.0.1',
    content: {
      heading: 'Decentra Genesis Node Daemon',
      subheading: 'Local consensus verification service running in isolated container.',
      paragraphs: [
        'Node is synchronized with local storage state. 14 peer connections verified via authenticated Ed25519 handshakes.',
        'Zero external IP leaks detected during the last 48 hours of continuous operation.'
      ],
      specs: [
        { label: 'Node Uptime', value: '18 hours 42 minutes' },
        { label: 'Memory Allocated', value: '128 MB (Ramdisk)' },
        { label: 'Gossip Status', value: 'Active / Low Frequency' },
        { label: 'Block Height', value: '#1,904,228' }
      ]
    }
  },
  'https://security.evah.local/advisories': {
    url: 'https://security.evah.local/advisories',
    title: 'Local Security Advisories',
    badge: 'Cryptographically Signed',
    content: {
      heading: 'Firmware & Entropy Verification',
      subheading: 'Signed hardware audit logs generated during boot sequence.',
      paragraphs: [
        'Hardware random number generator (HWRNG) passed NIST SP 800-22 statistical test suite.',
        'No rogue USB peripheral requests recorded on the system bus.'
      ],
      specs: [
        { label: 'Entropy Pool Size', value: '4,096 bits (Full)' },
        { label: 'Kernel Lockdown Level', value: 'Confidentiality' },
        { label: 'Secure Boot State', value: 'Enabled / Custom Keys' }
      ]
    }
  }
};

export const BrowserView: React.FC = () => {
  const { browserUrl, setBrowserUrl, toggleAiPanel } = useEvahStore();
  const [addressInput, setAddressInput] = useState(browserUrl);
  const [isLoading, setIsLoading] = useState(false);

  const activePage = PAGES[browserUrl] || PAGES['https://docs.evah.local/architecture'];

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = addressInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setIsLoading(true);
    setTimeout(() => {
      setBrowserUrl(url);
      setIsLoading(false);
    }, 200);
  };

  const handleQuickLink = (url: string) => {
    setAddressInput(url);
    setIsLoading(true);
    setTimeout(() => {
      setBrowserUrl(url);
      setIsLoading(false);
    }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-8 flex flex-col h-full select-none">
      {/* Browser Navigation Bar (comfortable 52px height) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 mb-5 p-2 rounded-xl bg-evah-surface/60 border border-evah-border"
      >
        {/* Navigation Buttons: ← → ↻ (40x40px clickable areas) */}
        <div className="flex items-center gap-1 text-evah-muted">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:text-evah-text hover:bg-white/[0.04] transition-colors"
            title="Back"
          >
            <ArrowLeft size={19} />
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:text-evah-text hover:bg-white/[0.04] transition-colors"
            title="Forward"
          >
            <ArrowRight size={19} />
          </button>
          <button 
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 200);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg hover:text-evah-text hover:bg-white/[0.04] transition-colors ${isLoading ? 'animate-spin' : ''}`}
            title="Reload"
          >
            <RotateCw size={19} />
          </button>
        </div>

        {/* Address Input (44px height, 14.5px text) */}
        <form onSubmit={handleNavigate} className="flex-1 relative">
          <div className="flex items-center bg-white/[0.03] border border-evah-border/80 rounded-lg px-3.5 h-11 text-evah-text focus-within:border-white/20">
            <Globe size={18} className="text-evah-muted shrink-0 mr-2.5" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Search or enter address"
              className="w-full bg-transparent text-[14.5px] text-evah-text placeholder:text-evah-muted outline-none font-mono"
            />
          </div>
        </form>

        {/* Ask EVAH button (42px height, 19px icon) */}
        <button
          onClick={toggleAiPanel}
          className="flex items-center gap-2 h-11 px-4 rounded-lg text-[14.5px] font-medium text-evah-secondary hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors shrink-0"
        >
          <Sparkles size={19} className="text-evah-accent" />
          <span>Ask EVAH</span>
        </button>
      </motion.div>

      {/* Quick Local Bookmarks (40px height) */}
      <div className="flex items-center gap-2 mb-5 text-[14px] font-mono text-evah-muted overflow-x-auto pb-1">
        <span className="text-[13px] text-evah-muted/70">Endpoints:</span>
        {Object.keys(PAGES).map((url) => {
          const page = PAGES[url];
          const isSelected = browserUrl === url;
          return (
            <button
              key={url}
              onClick={() => handleQuickLink(url)}
              className={`h-8 px-3 rounded-md transition-colors whitespace-nowrap text-[13.5px] ${
                isSelected
                  ? 'bg-white/[0.08] text-evah-text font-medium'
                  : 'hover:text-evah-secondary hover:bg-white/[0.03]'
              }`}
            >
              {page.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Browser Main Content Area */}
      <motion.div
        key={browserUrl}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 border border-evah-border rounded-xl bg-evah-surface/40 backdrop-blur-md p-8 overflow-y-auto space-y-6"
      >
        {/* Document Header */}
        <div className="space-y-2 border-b border-evah-border/60 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-mono text-evah-accent px-2 py-0.5 rounded bg-evah-accent/10 border border-evah-accent/20">
              {activePage.badge}
            </span>
            <span className="text-[13.5px] font-mono text-evah-muted truncate">
              {activePage.url}
            </span>
          </div>

          <h2 className="text-[22px] font-medium text-evah-text tracking-tight">
            {activePage.content.heading}
          </h2>
          <p className="text-[15.5px] text-evah-muted">
            {activePage.content.subheading}
          </p>
        </div>

        {/* Paragraphs (15.5px text, generous leading) */}
        <div className="space-y-4 text-[15.5px] text-evah-secondary leading-relaxed">
          {activePage.content.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Specs Table */}
        {activePage.content.specs && (
          <div className="border border-evah-border rounded-xl overflow-hidden mt-8 bg-white/[0.01]">
            <div className="px-5 py-3 text-[13px] font-mono text-evah-muted border-b border-evah-border bg-white/[0.01]">
              Runtime Specifications
            </div>
            <div className="divide-y divide-evah-border/40">
              {activePage.content.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 text-[14.5px] font-mono">
                  <span className="text-evah-muted">{spec.label}</span>
                  <span className="text-evah-text font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
