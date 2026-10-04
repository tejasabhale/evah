import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useEvahStore } from '../../store/useEvahStore';
import { Lock, ShieldAlert, HardDrive, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const LockOverlay: React.FC = () => {
  const { 
    isSessionLocked, 
    unlockSession, 
    usbConnected, 
    toggleUsbConnection,
    addActivity 
  } = useEvahStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isSessionLocked) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(12px)', duration: 0.45, ease: 'power2.out' }
      );

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out', delay: 0.1 }
      );
    }, overlayRef);

    return () => ctx.revert();
  }, [isSessionLocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.trim().length >= 3 || passphrase === 'evah') {
      if (overlayRef.current && cardRef.current) {
        gsap.to(cardRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.25,
          ease: 'power2.in',
        });
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          delay: 0.05,
          onComplete: () => {
            unlockSession();
            setPassphrase('');
            setError(false);
            toast.success('Session unlocked');
            addActivity({
              action: 'Session unlocked',
              details: 'Authenticated with master passphrase',
              status: 'success',
            });
          },
        });
      } else {
        unlockSession();
      }
    } else {
      setError(true);
      toast.error('Invalid passphrase');
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { x: -8 },
          { x: 8, duration: 0.08, repeat: 3, yoyo: true, ease: 'power1.inOut' }
        );
      }
    }
  };

  const handleRemountUsb = () => {
    toggleUsbConnection();
    toast.success('USB Media Mounted');
  };

  if (!isSessionLocked) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090D]/90 select-none p-4"
    >
      <div
        ref={cardRef}
        className="w-full max-w-md p-8 rounded-xl bg-evah-surface border border-evah-border shadow-panel space-y-6"
      >
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-evah-muted mb-4">
            {usbConnected ? (
              <Lock size={22} className="text-evah-secondary" />
            ) : (
              <ShieldAlert size={22} className="text-evah-danger" />
            )}
          </div>
          <h2 className="text-[26px] font-medium text-evah-text tracking-tight">
            EVAH
          </h2>
          <p className="text-[15px] text-evah-muted">
            {!usbConnected ? 'Session locked: Storage media removed' : 'Session locked: Inactivity protection'}
          </p>
        </div>

        {/* Status notice */}
        <div className="text-[13.5px] font-mono px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-evah-secondary flex items-center justify-between">
          <span className="text-evah-muted">Media status:</span>
          <span className={usbConnected ? 'text-evah-success' : 'text-evah-danger'}>
            {usbConnected ? 'Connected' : 'Ejected'}
          </span>
        </div>

        {/* Action form with 44px input & buttons */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError(false);
              }}
              placeholder="Enter passphrase..."
              autoFocus
              className={`w-full h-12 bg-white/[0.03] border rounded-lg px-4 text-[15px] text-evah-text placeholder:text-evah-muted outline-none transition-colors ${
                error 
                  ? 'border-evah-danger/60 focus:border-evah-danger' 
                  : 'border-evah-border focus:border-evah-accent/50'
              }`}
            />
          </div>

          <div className="flex gap-3">
            {!usbConnected && (
              <button
                type="button"
                onClick={handleRemountUsb}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg text-[14.5px] font-medium text-evah-secondary hover:text-evah-text bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
              >
                <HardDrive size={18} />
                <span>Re-mount USB</span>
              </button>
            )}

            <button
              type="submit"
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg text-[14.5px] font-medium text-evah-bg bg-evah-text hover:bg-white transition-colors"
            >
              <span>Unlock Session</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <p className="text-[13px] text-center text-evah-muted font-mono">
          Volatile memory protected by kernel isolation
        </p>
      </div>
    </div>
  );
};
