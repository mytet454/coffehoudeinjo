import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createContactShadowTexture, createFlaskBottle } from './bottleBuilder';
import { afterDraw, detectSoftwareGl } from './softwareGl';

interface MiniBottlePreviewProps {
  origin: 'COLOMBIA' | 'ETHIOPIA';
  hovered: boolean;
}

/**
 * Compact 3D bottle preview canvas for each Product Range card.
 * Rotates smoothly when hovered so the cream emblem label catches the amber light,
 * and pauses rendering when scrolled off-screen.
 */
export function MiniBottlePreview({ origin, hovered }: MiniBottlePreviewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 270;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 25);
    camera.position.set(0, 1.88, 6.2);
    camera.lookAt(0, 1.38, 0);

    const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x1a0f0c, 0.72);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xd4893a, 2.35);
    keyLight.position.set(2.8, 4.2, 3.6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc2dcff, 2.1);
    rimLight.position.set(-2.8, 2.8, -3.2);
    scene.add(rimLight);

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.CircleGeometry(1.1, 28);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.005;
    scene.add(shadow);

    let needsDraw = true;
    const bottle = createFlaskBottle({
      origin,
      isSoftwareGl,
      maxAniso: renderer.capabilities.getMaxAnisotropy(),
      onTextureLoaded: () => {
        needsDraw = true;
      },
    });
    bottle.setFillProgress(1);
    bottle.condensationMat.opacity = 0.45;
    scene.add(bottle.group);

    let isVisible = true;
    let isDisposed = false;
    let frameId = 0;
    const timers: number[] = [];

    const obs = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible && !reducedMotion) scheduleNext();
      },
      { threshold: 0.05 },
    );
    obs.observe(container);

    const onResize = () => {
      if (isDisposed || !container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 270;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      needsDraw = true;
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let spinAngle = 0;
    let running = false;

    const scheduleNext = () => {
      if (running || isDisposed || !isVisible) return;
      running = true;
      if (isSoftwareGl) {
        afterDraw(renderer, tick, (id) => timers.push(id));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      running = false;
      if (isDisposed || (!isVisible && !needsDraw)) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;

      if (!reducedMotion) {
        if (hoveredRef.current) {
          spinAngle += dt * 1.45;
          bottle.group.rotation.y = spinAngle;
        } else {
          spinAngle = THREE.MathUtils.damp(spinAngle % (Math.PI * 2), 0, 5, dt);
          bottle.group.rotation.y = spinAngle;
        }
        bottle.group.position.y = Math.sin(elapsed * 1.6) * 0.03;
      }

      renderer.render(scene, camera);
      needsDraw = false;
      if (reducedMotion) return;
      scheduleNext();
    };

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      obs.disconnect();
      window.removeEventListener('resize', onResize);
      bottle.dispose();
      shadowTex.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      envTex.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, [origin]);

  return (
    <div
      ref={mountRef}
      data-testid={`mini-bottle-${origin.toLowerCase()}`}
      className="w-full h-full"
      style={{
        background:
          'radial-gradient(circle at 50% 42%, rgba(212, 137, 58, 0.22) 0%, rgba(26, 15, 12, 0.96) 72%)',
      }}
    />
  );
}
