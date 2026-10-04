import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useEvahStore } from '../../store/useEvahStore';

export const SpaceAtmosphere: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const backgroundIntensity = useEvahStore((state) => state.backgroundIntensity);
  const reducedMotion = useEvahStore((state) => state.reducedMotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check system prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = !reducedMotion && !prefersReducedMotion;

    // Dimensions
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    // Renderer (Low-power, restrained, zero heavy post-processing)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      powerPreference: 'low-power',
      antialias: true,
      alpha: false,
      depth: true,
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Group for the large black hole visual
    // Positioned gracefully toward the right-center to frame the desktop workspace
    const group = new THREE.Group();
    group.position.set(2.8, -0.4, 0);
    group.rotation.x = 0.38; // Elegant natural accretion tilt
    scene.add(group);

    // 1. Black Hole Core (Event Horizon - absorbs all light, significantly larger scale)
    const coreGeo = new THREE.SphereGeometry(3.2, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x030407,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 2. Accretion Disc Inner Rim Glow (Perplexity Comet inspired delicate rim)
    const innerRingGeo = new THREE.RingGeometry(3.22, 4.2, 80);
    const innerRingMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0x8cc8ff) },
        uIntensity: { value: (backgroundIntensity / 100) * 0.42 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float dist = distance(vUv, vec2(0.5));
          float alpha = smoothstep(0.0, 0.5, 1.0 - abs(dist - 0.25) * 4.0) * uIntensity;
          gl_FragColor = vec4(uColor, alpha * 0.7);
        }
      `,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    group.add(innerRing);

    // 3. Vast Gravitational Atmosphere / Outer Accretion Disc (Faint periwinkle / deep indigo)
    // Expanded diameter to occupy a large portion of the screen
    const outerRingGeo = new THREE.RingGeometry(4.0, 11.2, 80);
    const outerRingMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0x384c6c) },
        uIntensity: { value: (backgroundIntensity / 100) * 0.24 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5)) * 2.0;
          float alpha = smoothstep(1.0, 0.0, dist) * uIntensity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    group.add(outerRing);

    // 4. Subtle Gravitational Lens Halo (Direct face-on ethereal rim glow)
    const haloGeo = new THREE.PlaneGeometry(8.5, 8.5);
    const haloMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0x769bc8) },
        uIntensity: { value: (backgroundIntensity / 100) * 0.28 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5)) * 2.0;
          float ring = smoothstep(0.72, 0.82, dist) * (1.0 - smoothstep(0.85, 1.0, dist));
          float alpha = ring * uIntensity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 0, 0);
    group.add(halo);

    // 5. Very Sparse Celestial Dust (Only 36 points, very faint, slow orbital drift)
    const particleCount = 36;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleAlphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 4.5 + Math.random() * 9.0;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 1.6;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = height;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleAlphas[i] = 0.12 + Math.random() * 0.25;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('alpha', new THREE.BufferAttribute(particleAlphas, 1));

    const particlesMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(0xaec8e6) },
        uIntensity: { value: (backgroundIntensity / 100) * 0.4 },
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.8 / -mvPosition.z) * 14.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float fade = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(uColor, fade * vAlpha * uIntensity);
        }
      `,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    group.add(particles);

    // Mouse tilt interaction (gentle, atmospheric damping)
    let targetRotY = 0;
    let targetRotX = 0.38;
    let currentRotY = 0;
    let currentRotX = 0.38;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetRotY = normX * 0.08;
      targetRotX = 0.38 + (normY * 0.05);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Render loop state
    let animationFrameId: number | null = null;
    let isTabVisible = !document.hidden;

    const render = () => {
      if (shouldAnimate) {
        // Very slow majestic movement
        innerRing.rotation.z += 0.00025;
        outerRing.rotation.z += 0.00015;
        particles.rotation.y += 0.0002;

        currentRotY += (targetRotY - currentRotY) * 0.03;
        currentRotX += (targetRotX - currentRotX) * 0.03;
        group.rotation.y = currentRotY;
        group.rotation.x = currentRotX;
      }

      renderer.render(scene, camera);

      if (shouldAnimate && isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Initial render
    render();

    // Visibility change handler (zero GPU usage when tab is hidden)
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && shouldAnimate && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      } else if (!isTabVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Window resize handler
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!container) return;
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        if (!shouldAnimate) {
          renderer.render(scene, camera);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);

      coreGeo.dispose();
      coreMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, [backgroundIntensity, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-95 transition-opacity duration-1000"
      />
      {/* Subtle vignette gradient overlay to ground the UI while keeping the celestial object visible */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 68% 46%, transparent 15%, rgba(7, 9, 13, 0.65) 65%, #07090D 95%)',
        }}
      />
    </div>
  );
};
