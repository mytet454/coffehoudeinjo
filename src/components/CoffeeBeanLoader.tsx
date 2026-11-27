import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createCoffeeBeanGeometry } from '../three/bottleBuilder';
import { afterDraw, detectSoftwareGl } from '../three/softwareGl';

interface CoffeeBeanLoaderProps {
  visible: boolean;
  label: string;
}

/**
 * 3D Coffee Bean loading screen using a sculpted Three.js coffee bean that rotates slowly
 * and fades out smoothly when the scene is ready.
 */
export function CoffeeBeanLoader({ visible, label }: CoffeeBeanLoaderProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, alpha: true });
    } catch {
      return;
    }

    renderer.setSize(120, 120);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const canvas = renderer.domElement;
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.set(0, 0.4, 2.1);
    camera.lookAt(0, 0, 0);

    const key = new THREE.DirectionalLight(0xd4893a, 2.2);
    key.position.set(2, 3, 2);
    scene.add(key);

    const hemi = new THREE.HemisphereLight(0xf5e6d3, 0x1a0f0c, 0.9);
    scene.add(hemi);

    const beanGeo = createCoffeeBeanGeometry(0.36);
    const beanMat = new THREE.MeshStandardMaterial({
      color: 0x3a1c0d,
      roughness: 0.44,
      metalness: 0.1,
    });
    const beanMesh = new THREE.Mesh(beanGeo, beanMat);
    beanMesh.rotation.set(0.5, 0.3, 0.25);
    scene.add(beanMesh);

    const clock = new THREE.Clock();
    let frameId = 0;
    const timers: number[] = [];
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      if (!reducedMotion) {
        beanMesh.rotation.y += dt * 1.4;
        beanMesh.rotation.x += dt * 0.45;
      }
      renderer.render(scene, camera);
      if (reducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(renderer, tick, (id) => timers.push(id));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      envTex.dispose();
      beanGeo.dispose();
      beanMat.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      data-testid="coffee-bean-loader"
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        backgroundColor: 'var(--bg-dominant)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div ref={mountRef} className="w-[120px] h-[120px] flex items-center justify-center" />
        <p
          className="text-sm font-medium tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
