import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createCoffeeBeanGeometry } from './bottleBuilder';
import {
  generateBeanSeeds,
  getResponsiveBeanCount,
  type ThemeMode,
} from '../utils/showcaseLogic';
import { afterDraw, detectSoftwareGl } from './softwareGl';

interface FallingBeansCanvasProps {
  theme: ThemeMode;
}

/**
 * Generates a subtle organic surface bump map for roasted 3D coffee beans.
 */
function createRoastedBeanBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 650; i++) {
      const x = (i * 53) % 128;
      const y = (i * 97) % 128;
      const v = 105 + ((i * 29) % 50);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Full-viewport background InstancedMesh of sculpted 3D coffee beans that fall slowly,
 * rotate on all axes, drift sideways, accelerate with scroll velocity, and halve on mobile.
 */
export function FallingBeansCanvas({ theme }: FallingBeansCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<ThemeMode>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    const width = window.innerWidth || 1440;
    const height = window.innerHeight || 900;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 40);
    camera.position.set(0, 0, 10);

    const hemi = new THREE.HemisphereLight(0xf5e6d3, 0x1a0f0c, 0.75);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xd4893a, 1.85);
    dirLight.position.set(4, 6, 5);
    scene.add(dirLight);

    const beanCount = getResponsiveBeanCount(44, width);
    const beanSeeds = generateBeanSeeds(beanCount, 7102);
    const beanGeo = createCoffeeBeanGeometry(0.28);
    const bumpTex = createRoastedBeanBumpTexture();
    const beanMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.12,
      bumpMap: bumpTex,
      bumpScale: 0.015,
    });

    const instancedBeans = new THREE.InstancedMesh(beanGeo, beanMat, beanCount);
    instancedBeans.frustumCulled = false;

    const colorDark = new THREE.Color('#1B0D07');
    const colorMedium = new THREE.Color('#3B1D0F');
    const colorWarm = new THREE.Color('#5A301A');
    const scratchColor = new THREE.Color();

    for (let i = 0; i < beanCount; i++) {
      const t = beanSeeds[i].tintFactor;
      if (t < 0.45) {
        scratchColor.copy(colorDark).lerp(colorMedium, t / 0.45);
      } else {
        scratchColor.copy(colorMedium).lerp(colorWarm, (t - 0.45) / 0.55);
      }
      instancedBeans.setColorAt(i, scratchColor);
    }
    if (instancedBeans.instanceColor) {
      instancedBeans.instanceColor.needsUpdate = true;
    }

    scene.add(instancedBeans);

    const dummy = new THREE.Object3D();
    const yPositions = beanSeeds.map((b) => b.y);

    // Scroll velocity boost that eases back smoothly
    let lastScrollY = window.scrollY;
    let scrollVelocityBoost = 0;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      scrollVelocityBoost = Math.min(6.5, scrollVelocityBoost + delta * 0.035);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      const w = window.innerWidth || 1440;
      const h = window.innerHeight || 900;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    const timers: number[] = [];
    let isDisposed = false;
    let isTabVisible = !document.hidden;

    const onVisChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !prefersReducedMotion) {
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    const updateBeans = (dt: number, elapsed: number) => {
      dirLight.intensity = themeRef.current === 'espresso' ? 1.85 : 1.25;
      scrollVelocityBoost = THREE.MathUtils.damp(scrollVelocityBoost, 0, 3.8, dt);

      const speedMultiplier = 1 + scrollVelocityBoost;

      for (let i = 0; i < beanCount; i++) {
        const seed = beanSeeds[i];
        if (!prefersReducedMotion) {
          yPositions[i] -= seed.speed * speedMultiplier * dt;
          if (yPositions[i] < -9.5) {
            yPositions[i] = 9.5;
          }
        }

        const swayX = Math.sin(elapsed * 0.55 + seed.phase) * seed.driftAmp;
        dummy.position.set(seed.x + swayX, yPositions[i], seed.z);

        const rotBoost = 1 + scrollVelocityBoost * 0.35;
        dummy.rotation.set(
          seed.phase + elapsed * seed.rotSpeedX * rotBoost,
          seed.phase * 1.4 + elapsed * seed.rotSpeedY * rotBoost,
          seed.phase * 0.7 + elapsed * seed.rotSpeedZ * rotBoost,
        );
        dummy.scale.setScalar(seed.scale);
        dummy.updateMatrix();
        instancedBeans.setMatrixAt(i, dummy.matrix);
      }

      instancedBeans.instanceMatrix.needsUpdate = true;
    };

    let running = false;
    const scheduleNext = () => {
      if (running || isDisposed || !isTabVisible) return;
      running = true;
      if (isSoftwareGl) {
        afterDraw(renderer, tick, (id) => timers.push(id));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      running = false;
      if (isDisposed || !isTabVisible) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;
      updateBeans(dt, elapsed);
      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      scheduleNext();
    };

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      envTex.dispose();
      beanGeo.dispose();
      bumpTex.dispose();
      beanMat.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="falling-beans-canvas"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-35"
    />
  );
}
