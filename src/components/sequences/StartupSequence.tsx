import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useEvahStore } from '../../store/useEvahStore';
import { HardDrive, CheckCircle2 } from 'lucide-react';

export const StartupSequence: React.FC = () => {
  const { bootSequenceFinished, setBootSequenceFinished } = useEvahStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [hardwareDetected, setHardwareDetected] = useState(false);

  useEffect(() => {
    if (bootSequenceFinished) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setBootSequenceFinished(true);
        },
      });

      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(logoRef.current, { opacity: 0, y: 10 });
      gsap.set(subtitleRef.current, { opacity: 0 });
      gsap.set(statusRef.current, { opacity: 0, y: 6 });

      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.1,
      })
      .to(subtitleRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.15')
      .call(() => setHardwareDetected(true))
      .to(statusRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.inOut',
        delay: 0.3,
      });

    }, overlayRef);

    return () => ctx.revert();
  }, [bootSequenceFinished, setBootSequenceFinished]);

  if (bootSequenceFinished) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090D] select-none"
    >
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* EVAH Monogram / Wordmark */}
        <div ref={logoRef} className="space-y-2">
          <h1 className="text-[32px] font-medium tracking-[0.2em] text-evah-text">
            EVAH
          </h1>
          <p 
            ref={subtitleRef} 
            className="text-[15px] text-evah-muted tracking-tight font-normal"
          >
            Personal Digital Environment
          </p>
        </div>

        {/* USB Hardware Initialization */}
        <div
          ref={statusRef}
          className="flex items-center gap-2.5 h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[14px] font-mono text-evah-secondary"
        >
          {hardwareDetected ? (
            <>
              <CheckCircle2 size={18} className="text-evah-success shrink-0" />
              <span>Encrypted Media Ready</span>
            </>
          ) : (
            <>
              <HardDrive size={18} className="text-evah-muted animate-pulse shrink-0" />
              <span className="text-evah-muted">Scanning USB bus...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
