import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createColdMistTexture,
  createContactShadowTexture,
  createFlaskBottle,
} from './bottleBuilder';
import { afterDraw, detectSoftwareGl } from './softwareGl';
import { computePourFillProgress } from '../utils/showcaseLogic';

gsap.registerPlugin(ScrollTrigger);

interface HeroBottlesSceneProps {
  dragHint: string;
}

/**
 * Hero 3D Scene displaying the Colombia (left) and Ethiopia (right) clear glass flasks
 * with RoomEnvironment reflections, intro cold-brew pour animation, sine bobbing,
 * pointer/device-tilt easing, hover liquid slosh, condensation drips, cold floor mist,
 * GSAP ScrollTrigger 360-degree spin, FPS transmission guard, and off-screen pause.
 */
export function HeroBottlesScene({ dragHint }: HeroBottlesSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const mount = mountRef.current;
    if (!container || !mount) return;

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
      setWebglFailed(true);
      return;
    }

    const width = mount.clientWidth || 560;
    const height = mount.clientHeight || 520;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.setAttribute(
      'aria-label',
      'Interactive 3D BASHQALOOB Colombia and Ethiopia cold brew bottles',
    );
    mount.appendChild(canvas);

    const onContextLost = (e: Event) => e.preventDefault();
    canvas.addEventListener('webglcontextlost', onContextLost);

    const scene = new THREE.Scene();

    // Studio RoomEnvironment reflection map for glass highlights
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(0, 2.05, 6.9);
    camera.lookAt(0, 1.25, 0);

    // Warm amber key light + cool rim light + hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0xd9e8ff, 0x1a0f0c, 0.7);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xd4893a, 2.45);
    keyLight.position.set(3.5, 5.5, 4.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 16;
      keyLight.shadow.camera.left = -3.2;
      keyLight.shadow.camera.right = 3.2;
      keyLight.shadow.camera.top = 3.5;
      keyLight.shadow.camera.bottom = -1.5;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc2dcff, 2.3);
    rimLight.position.set(-3.6, 3.2, -3.5);
    scene.add(rimLight);

    const frontFill = new THREE.PointLight(0xf5e6d3, 0.55, 12, 2);
    frontFill.position.set(0, 2.2, 4.5);
    scene.add(frontFill);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const disposables: Array<{ dispose: () => void }> = [envTex];

    // Soft radial contact shadows grounded cleanly under both bottles (no clipped floor seam)
    const shadowTex = createContactShadowTexture();
    disposables.push(shadowTex);
    const shadowGeo = new THREE.CircleGeometry(0.95, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const leftShadow = new THREE.Mesh(shadowGeo, shadowMat);
    leftShadow.position.set(-1.12, 0.005, 0.15);
    const rightShadow = new THREE.Mesh(shadowGeo, shadowMat);
    rightShadow.position.set(1.12, 0.005, -0.15);
    scene.add(leftShadow, rightShadow);
    disposables.push(shadowGeo, shadowMat);

    // Stage group rotated 360 deg via GSAP ScrollTrigger
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    let needsOneDraw = true;
    const colombiaBottle = createFlaskBottle({
      origin: 'COLOMBIA',
      isSoftwareGl,
      maxAniso,
      onTextureLoaded: () => {
        needsOneDraw = true;
      },
    });
    const ethiopiaBottle = createFlaskBottle({
      origin: 'ETHIOPIA',
      isSoftwareGl,
      maxAniso,
      onTextureLoaded: () => {
        needsOneDraw = true;
      },
    });

    // Place Colombia on left, Ethiopia on right at slightly different heights/depths
    const leftBasePos = { x: -1.12, y: 0.16, z: 0.18 };
    const rightBasePos = { x: 1.12, y: 0.02, z: -0.14 };
    colombiaBottle.group.position.set(leftBasePos.x, leftBasePos.y, leftBasePos.z);
    ethiopiaBottle.group.position.set(rightBasePos.x, rightBasePos.y, rightBasePos.z);
    stageGroup.add(colombiaBottle.group, ethiopiaBottle.group);

    // Intro pour streams (cold brew pouring into bottle 1 then bottle 2)
    const streamGeo = new THREE.CylinderGeometry(0.024, 0.015, 2.3, 12);
    const streamMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e0b04,
      roughness: 0.08,
      transparent: true,
      opacity: 0.92,
    });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.visible = false;
    stageGroup.add(streamMesh);
    disposables.push(streamGeo, streamMat);

    // Low-lying chilled cold mist particles near bottle bases (no hot steam)
    const mistTex = createColdMistTexture();
    disposables.push(mistTex);
    const mistSprites: Array<{
      sprite: THREE.Sprite;
      mat: THREE.SpriteMaterial;
      phase: number;
      baseX: number;
      baseZ: number;
      speed: number;
    }> = [];
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.SpriteMaterial({
        map: mistTex,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const baseX = (i < 6 ? -1.12 : 1.12) + ((i % 3) - 1) * 0.45;
      const baseZ = ((i % 2) - 0.5) * 0.5;
      sprite.position.set(baseX, 0.22 + (i % 3) * 0.12, baseZ);
      sprite.scale.set(0.95, 0.45, 1);
      stageGroup.add(sprite);
      disposables.push(mat);
      mistSprites.push({
        sprite,
        mat,
        phase: i * 0.7,
        baseX,
        baseZ,
        speed: 0.45 + (i % 3) * 0.15,
      });
    }

    // Simplified proxy hit-boxes for fast pointer hover slosh detection
    const proxyGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.8, 10);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const leftProxy = new THREE.Mesh(proxyGeo, proxyMat);
    leftProxy.position.set(leftBasePos.x, leftBasePos.y + 1.4, leftBasePos.z);
    leftProxy.userData.bottle = 'colombia';
    const rightProxy = new THREE.Mesh(proxyGeo, proxyMat);
    rightProxy.position.set(rightBasePos.x, rightBasePos.y + 1.4, rightBasePos.z);
    rightProxy.userData.bottle = 'ethiopia';
    stageGroup.add(leftProxy, rightProxy);
    disposables.push(proxyGeo, proxyMat);

    if (reducedMotion) {
      colombiaBottle.setFillProgress(1);
      ethiopiaBottle.setFillProgress(1);
    } else {
      colombiaBottle.setFillProgress(0.01);
      ethiopiaBottle.setFillProgress(0.01);
    }

    // GSAP ScrollTrigger: 360-degree spin as user scrolls from Hero to Product Range
    const scrollState = { spin: 0 };
    const scrollTween = gsap.to(scrollState, {
      spin: Math.PI * 2,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        endTrigger: '#range',
        end: 'top center',
        scrub: 0.8,
      },
    });

    // Pointer tilt & hover slosh raycaster
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(99, 99);
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let lastHovered: string | null = null;
    let lastRaycastTime = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);

      // Gentle tilt toward pointer across the whole window
      const winNx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const winNy = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      targetTiltY = THREE.MathUtils.clamp(winNx * 0.16, -0.2, 0.2);
      targetTiltX = THREE.MathUtils.clamp(winNy * 0.09, -0.12, 0.12);

      const now = performance.now();
      if (now - lastRaycastTime < 65) return;
      lastRaycastTime = now;

      if (Math.abs(nx) <= 1 && Math.abs(ny) <= 1) {
        pointerNdc.set(nx, ny);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects([leftProxy, rightProxy], false);
        const hitName = hits[0]?.object?.userData?.bottle ?? null;
        if (hitName && hitName !== lastHovered) {
          if (hitName === 'colombia') colombiaBottle.triggerSlosh(0.055);
          if (hitName === 'ethiopia') ethiopiaBottle.triggerSlosh(0.055);
        }
        lastHovered = hitName;
      } else {
        lastHovered = null;
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Mobile device-tilt listener
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      targetTiltY = THREE.MathUtils.clamp((e.gamma / 45) * 0.18, -0.2, 0.2);
      targetTiltX = THREE.MathUtils.clamp(((e.beta - 45) / 45) * 0.1, -0.12, 0.12);
    };
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });

    // Visibility & off-screen pause guard
    let isInViewport = true;
    let isTabVisible = !document.hidden;
    let isDisposed = false;
    let frameId = 0;
    const timers: number[] = [];

    const obs = new IntersectionObserver(
      (entries) => {
        isInViewport = entries[0]?.isIntersecting ?? true;
        if (isInViewport && isTabVisible && !reducedMotion) {
          scheduleNext();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(container);

    const onVisChange = () => {
      isTabVisible = !document.hidden;
      if (isInViewport && isTabVisible && !reducedMotion) {
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    const handleResize = () => {
      if (isDisposed || !mount) return;
      const w = mount.clientWidth || 400;
      const h = mount.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      needsOneDraw = true;
    };
    window.addEventListener('resize', handleResize);

    // FPS watchdog: disable glass transmission if GPU framerate drops below 50 fps
    let lowFpsCounter = 0;
    let transmissionActive = !isSoftwareGl;
    const clock = new THREE.Clock();

    const updateHero = (dt: number, elapsed: number) => {
      // Intro pour sequence: Colombia fills 0..2s, Ethiopia fills 2..4s
      if (!reducedMotion) {
        const p1 = computePourFillProgress(elapsed, 0.1, 1.9);
        const p2 = computePourFillProgress(elapsed, 2.0, 1.9);
        colombiaBottle.setFillProgress(p1);
        ethiopiaBottle.setFillProgress(p2);

        if (elapsed >= 0.1 && elapsed < 2.0) {
          streamMesh.visible = true;
          streamMesh.position.set(leftBasePos.x, leftBasePos.y + 2.95, leftBasePos.z);
        } else if (elapsed >= 2.0 && elapsed < 3.9) {
          streamMesh.visible = true;
          streamMesh.position.set(rightBasePos.x, rightBasePos.y + 2.95, rightBasePos.z);
        } else {
          streamMesh.visible = false;
        }
      }

      // Smooth pointer / tilt damping
      currentTiltX = THREE.MathUtils.damp(currentTiltX, targetTiltX, 6, dt);
      currentTiltY = THREE.MathUtils.damp(currentTiltY, targetTiltY, 6, dt);

      // Out-of-phase sine bobbing (disabled when prefers-reduced-motion)
      const bob1 = reducedMotion ? 0 : Math.sin(elapsed * 1.35) * 0.055;
      const bob2 = reducedMotion ? 0 : Math.sin(elapsed * 1.35 + Math.PI * 0.85) * 0.055;

      colombiaBottle.group.position.y = leftBasePos.y + bob1;
      ethiopiaBottle.group.position.y = rightBasePos.y + bob2;

      colombiaBottle.group.rotation.set(currentTiltX, currentTiltY, -currentTiltY * 0.25);
      ethiopiaBottle.group.rotation.set(currentTiltX, currentTiltY, -currentTiltY * 0.25);

      // Apply GSAP ScrollTrigger 360° spin cleanly to the whole showcase stage
      stageGroup.rotation.y = scrollState.spin;

      // Update condensation & slosh on both bottles
      colombiaBottle.updateCondensation(elapsed, dt, reducedMotion);
      ethiopiaBottle.updateCondensation(elapsed, dt, reducedMotion);
      colombiaBottle.updateSlosh(dt, elapsed);
      ethiopiaBottle.updateSlosh(dt, elapsed);

      // Animate chilled mist drifting laterally near the floor
      if (!reducedMotion) {
        for (const m of mistSprites) {
          m.sprite.position.x = m.baseX + Math.sin(elapsed * m.speed + m.phase) * 0.22;
          m.mat.opacity = 0.14 + Math.sin(elapsed * 0.9 + m.phase) * 0.05;
        }
      }
    };

    let runningLoop = false;

    const tick = () => {
      runningLoop = false;
      if (isDisposed || (!isInViewport && !needsOneDraw) || !isTabVisible) return;

      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;

      // FPS guard on hardware GPU
      if (!isSoftwareGl && transmissionActive && dt > 0) {
        const fps = 1 / dt;
        if (fps < 50) {
          lowFpsCounter++;
          if (lowFpsCounter > 25) {
            transmissionActive = false;
            colombiaBottle.setTransmissionEnabled(false);
            ethiopiaBottle.setTransmissionEnabled(false);
          }
        } else {
          lowFpsCounter = Math.max(0, lowFpsCounter - 1);
        }
      }

      updateHero(dt, elapsed);
      renderer.render(scene, camera);
      needsOneDraw = false;

      if (reducedMotion) return;
      scheduleNext();
    };

    const scheduleNext = () => {
      if (runningLoop || isDisposed || !isInViewport || !isTabVisible) return;
      runningLoop = true;
      if (isSoftwareGl) {
        afterDraw(renderer, tick, (id) => timers.push(id));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      scrollTween.scrollTrigger?.kill();
      scrollTween.kill();
      obs.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      colombiaBottle.dispose();
      ethiopiaBottle.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      <div className="w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center">
        {webglFailed ? (
          <div
            className="w-full h-full rounded-3xl flex items-center justify-center border overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-dominant-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <img
              src="/src/assets/images/featured_cold_brew_1795699331497.jpg"
              alt="BASHQALOOB Colombia & Ethiopia Cold Brew"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div ref={mountRef} data-testid="hero-3d-cup" className="w-full h-full" />
        )}
      </div>
      <p
        className="mt-2 text-center text-xs tracking-wide"
        style={{ color: 'var(--text-muted)' }}
      >
        {dragHint}
      </p>
    </div>
  );
}
