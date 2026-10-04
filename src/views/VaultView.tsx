import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvahStore } from '../store/useEvahStore';
import { VaultCategory, VaultItem } from '../types';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Plus, 
  X,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES: VaultCategory[] = ['Personal', 'Projects', 'Documents', 'Memory'];

export const VaultView: React.FC = () => {
  const { 
    isVaultLocked, 
    unlockVault, 
    lockVault, 
    vaultItems, 
    addVaultItem, 
    deleteVaultItem 
  } = useEvahStore();

  const [passphrase, setPassphrase] = useState('');
  const [activeCategory, setActiveCategory] = useState<VaultCategory>('Personal');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<VaultItem['type']>('credential');
  const [newValue, setNewValue] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockVault(passphrase);
    if (success) {
      setPassphrase('');
      toast.success('Vault unlocked');
    } else {
      toast.error('Invalid passphrase');
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    toast.success('Secret copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newValue.trim()) return;

    addVaultItem({
      title: newTitle.trim(),
      category: activeCategory,
      type: newType,
      preview: `${newType} secret`,
      value: newValue.trim(),
    });

    setNewTitle('');
    setNewValue('');
    setShowAddModal(false);
    toast.success('Stored in vault');
  };

  const filteredItems = vaultItems.filter((item) => item.category === activeCategory);

  // 1. LOCKED VIEW (Prompt: "Vault \n Vault is locked. \n [ Unlock ]")
  if (isVaultLocked) {
    return (
      <div className="max-w-md mx-auto py-28 px-8 text-center select-none">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-[32px] font-medium tracking-tight text-evah-text">
              Vault
            </h1>
            <p className="text-[16px] text-evah-muted font-normal">
              Vault is locked.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 max-w-xs mx-auto">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter vault passphrase..."
              autoFocus
              className="w-full h-12 bg-evah-surface/80 border border-evah-border rounded-lg px-4 text-[15px] text-evah-text placeholder:text-evah-muted outline-none focus:border-white/20 transition-colors text-center"
            />
            <button
              type="submit"
              className="w-full h-11 px-5 rounded-lg text-[15px] font-medium text-evah-bg bg-evah-text hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Unlock size={18} />
              <span>Unlock</span>
            </button>
          </form>

          <p className="text-[13px] text-evah-muted font-mono">
            Hardware encrypted with Argon2id + XChaCha20
          </p>
        </motion.div>
      </div>
    );
  }

  // 2. UNLOCKED VIEW
  return (
    <div className="max-w-4xl mx-auto py-14 px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-[30px] font-medium tracking-tight text-evah-text">
            Vault
          </h1>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-mono text-evah-success bg-evah-success/10 border border-evah-success/20">
            <ShieldCheck size={16} />
            <span>Encrypted</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 flex items-center gap-2 px-3.5 rounded-lg text-[14px] font-medium text-evah-secondary hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
          <button
            onClick={lockVault}
            className="h-10 flex items-center gap-2 px-3.5 rounded-lg text-[14px] font-medium text-evah-muted hover:text-evah-text hover:bg-white/[0.04] transition-colors"
            title="Lock Vault"
          >
            <Lock size={18} />
            <span>Lock</span>
          </button>
        </div>
      </motion.div>

      {/* Categories Bar (comfortable 42px height) */}
      <div className="flex items-center gap-2 mb-8 border-b border-evah-border pb-3">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-10 px-4 rounded-lg text-[15px] transition-colors duration-150 font-normal ${
                isActive
                  ? 'text-evah-text bg-white/[0.08] font-medium'
                  : 'text-evah-muted hover:text-evah-secondary hover:bg-white/[0.03]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secret Items List */}
      <div className="flex flex-col border border-evah-border rounded-xl divide-y divide-evah-border/60 bg-evah-surface/30 backdrop-blur-md overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-[15px] text-evah-muted font-mono">
            No entries in {activeCategory}. Click "Add Item" to store a secret.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isRevealed = !!revealedIds[item.id];
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col gap-3 transition-colors duration-150 hover:bg-white/[0.01]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key size={19} className="text-evah-accent" />
                    <span className="text-[16px] font-medium text-evah-text">
                      {item.title}
                    </span>
                    <span className="text-[12px] font-mono text-evah-muted px-2 py-0.5 rounded bg-white/[0.03]">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-evah-muted hover:text-evah-text transition-colors"
                      title={isRevealed ? 'Mask secret' : 'Reveal secret'}
                    >
                      {isRevealed ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, item.value)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-evah-muted hover:text-evah-text transition-colors"
                      title="Copy to clipboard"
                    >
                      {isCopied ? <Check size={19} className="text-evah-success" /> : <Copy size={19} />}
                    </button>
                    <button
                      onClick={() => deleteVaultItem(item.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-evah-muted hover:text-evah-danger transition-colors"
                      title="Shred entry"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                </div>

                {/* Secret Value or Mask */}
                <div className="font-mono text-[14.5px] text-evah-secondary bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
                  {isRevealed ? (
                    <span className="break-all whitespace-pre-wrap">{item.value}</span>
                  ) : (
                    <span className="text-evah-muted select-none">••••••••••••••••••••••••••••••••••••••••</span>
                  )}
                </div>

                <div className="text-[13px] font-mono text-evah-muted">
                  Last accessed: {item.lastAccessed}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-evah-surface border border-evah-border rounded-xl shadow-panel overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-evah-border">
                <span className="text-[17px] font-medium text-evah-text">
                  Add to {activeCategory}
                </span>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-9 h-9 flex items-center justify-center text-evah-muted hover:text-evah-text rounded-lg hover:bg-white/[0.04]"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-[13.5px] font-mono text-evah-muted mb-1.5">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Master GPG Signing Key"
                    required
                    autoFocus
                    className="w-full h-11 bg-white/[0.03] border border-evah-border rounded-lg px-4 text-[14.5px] text-evah-text outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[13.5px] font-mono text-evah-muted mb-1.5">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as VaultItem['type'])}
                    className="w-full h-11 bg-evah-surface border border-evah-border rounded-lg px-3.5 text-[14.5px] text-evah-text outline-none"
                  >
                    <option value="credential">Credential / Password</option>
                    <option value="key">Cryptographic Key</option>
                    <option value="token">Access Token</option>
                    <option value="secret_note">Encrypted Secret Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13.5px] font-mono text-evah-muted mb-1.5">
                    Secret Value
                  </label>
                  <textarea
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter secret..."
                    rows={4}
                    required
                    className="w-full bg-white/[0.03] border border-evah-border rounded-lg p-3.5 text-[14px] font-mono text-evah-text outline-none focus:border-white/20 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-11 px-4 rounded-lg text-[14.5px] text-evah-muted hover:text-evah-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-lg text-[14.5px] font-medium text-evah-bg bg-evah-text hover:bg-white transition-colors"
                  >
                    Store Secret
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
