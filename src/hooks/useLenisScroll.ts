import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useEvahStore } from '../store/useEvahStore';

interface UseLenisOptions {
  enabled?: boolean;
}

export function useLenisScroll<T extends HTMLElement = HTMLDivElement>(options: UseLenisOptions = {}) {
  const containerRef = useRef<T | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useEvahStore((state) => state.reducedMotion);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Check system prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || prefersReducedMotion || options.enabled === false) {
      return;
    }

    // Initialize Lenis scoped to this container or window
    const lenis = new Lenis({
      wrapper: element,
      content: (element.firstElementChild as HTMLElement) || element,
      duration: 0.75, // fast + responsive + controlled
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion, options.enabled]);

  return { containerRef, lenis: lenisRef };
}
