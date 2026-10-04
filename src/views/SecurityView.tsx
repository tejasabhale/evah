import React from 'react';
import { motion } from 'framer-motion';
import { useEvahStore } from '../store/useEvahStore';
import { toast } from 'sonner';

export const SecurityView: React.FC = () => {
  const { 
    isSessionLocked, 
    usbConnected, 
    isVaultLocked, 
    securityMode, 
    activities,
    toggleUsbConnection,
    lockVault,
    unlockVault,
    lockSession,
    setSecurityMode
  } = useEvahStore();

  const handleToggleVault = () => {
    if (isVaultLocked) {
      unlockVault('evah');
      toast.success('Vault unlocked');
    } else {
      lockVault();
      toast.info('Vault locked');
    }
  };

  const handleModeChange = () => {
    const nextMode = securityMode === 'protected' ? 'airgap' : securityMode === 'airgap' ? 'isolated' : 'protected';
    setSecurityMode(nextMode);
    toast.success(`Environment set to ${nextMode.toUpperCase()}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-14 px-8 select-none">
      {/* Header (30px page title) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-[30px] font-medium tracking-tight text-evah-text">
          Security
        </h1>
      </motion.div>

      {/* Status Table (comfortable 54px rows, 40px buttons) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="border border-evah-border rounded-xl divide-y divide-evah-border/60 bg-evah-surface/40 backdrop-blur-md mb-12 overflow-hidden"
      >
        {/* Session */}
        <div className="flex items-center justify-between px-6 h-14 text-[15px]">
          <span className="font-mono text-evah-muted">Session</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-evah-text font-medium text-[15px]">
              {isSessionLocked ? 'Locked' : 'Active'}
            </span>
            <button
              onClick={lockSession}
              className="h-9 px-3.5 rounded-lg text-[13.5px] font-mono text-evah-muted hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-colors"
            >
              Lock
            </button>
          </div>
        </div>

        {/* USB */}
        <div className="flex items-center justify-between px-6 h-14 text-[15px]">
          <span className="font-mono text-evah-muted">USB</span>
          <div className="flex items-center gap-3">
            <span className={`font-mono font-medium text-[15px] ${usbConnected ? 'text-evah-success' : 'text-evah-danger'}`}>
              {usbConnected ? 'Connected' : 'Ejected'}
            </span>
            <button
              onClick={toggleUsbConnection}
              className="h-9 px-3.5 rounded-lg text-[13.5px] font-mono text-evah-muted hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-colors"
            >
              {usbConnected ? 'Eject' : 'Mount'}
            </button>
          </div>
        </div>

        {/* Vault */}
        <div className="flex items-center justify-between px-6 h-14 text-[15px]">
          <span className="font-mono text-evah-muted">Vault</span>
          <div className="flex items-center gap-3">
            <span className={`font-mono font-medium text-[15px] ${isVaultLocked ? 'text-evah-warning' : 'text-evah-success'}`}>
              {isVaultLocked ? 'Locked' : 'Unlocked'}
            </span>
            <button
              onClick={handleToggleVault}
              className="h-9 px-3.5 rounded-lg text-[13.5px] font-mono text-evah-muted hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-colors"
            >
              {isVaultLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>
        </div>

        {/* Environment */}
        <div className="flex items-center justify-between px-6 h-14 text-[15px]">
          <span className="font-mono text-evah-muted">Environment</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-evah-accent font-medium text-[15px] capitalize">
              {securityMode}
            </span>
            <button
              onClick={handleModeChange}
              className="h-9 px-3.5 rounded-lg text-[13.5px] font-mono text-evah-muted hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-colors"
            >
              Cycle
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <h2 className="text-[18px] font-medium text-evah-text tracking-tight">
          Recent activity
        </h2>

        <div className="border border-evah-border rounded-xl divide-y divide-evah-border/60 bg-evah-surface/30 backdrop-blur-md overflow-hidden">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between px-5 h-[48px] text-[15px]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span 
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    act.status === 'success' 
                      ? 'bg-evah-success' 
                      : act.status === 'warning' 
                      ? 'bg-evah-danger' 
                      : 'bg-evah-secondary'
                  }`} 
                />
                <span className="text-evah-text font-normal truncate">
                  {act.action}
                </span>
                {act.details && (
                  <span className="hidden sm:inline text-[13.5px] text-evah-muted truncate">
                    — {act.details}
                  </span>
                )}
              </div>

              <span className="text-[13px] font-mono text-evah-muted shrink-0 pl-3">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
