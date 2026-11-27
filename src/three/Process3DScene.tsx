import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createContactShadowTexture, createFlaskBottle } from './bottleBuilder';
import { afterDraw, detectSoftwareGl } from './softwareGl';

interface Process3DSceneProps {
  activeIndex: number;
}

/**
 * 3D Process illustration rendering three cold-extraction stages side by side:
 * 1) Steeping jar with coarse coffee grounds, 2) Cold-drip filter carafe, 3) Bottled flask.
 * Each stage illuminates sequentially with warm amber light as activeIndex changes on scroll.
 */
export function Process3DScene({ activeIndex }: Process3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

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

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 260;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 30);
    camera.position.set(0, 1.85, 6.4);
    camera.lookAt(0, 0.95, 0);

    const hemi = new THREE.HemisphereLight(0xd9e8ff, 0x1a0f0c, 0.65);
    scene.add(hemi);

    // Stage spotlight tracks active stage (left: -2.0, center: 0, right: +2.0)
    const stageSpot = new THREE.PointLight(0xd4893a, 5.5, 6.5, 1.6);
    stageSpot.position.set(-2.0, 2.7, 1.6);
    scene.add(stageSpot);

    const rimLight = new THREE.DirectionalLight(0xc2dcff, 1.4);
    rimLight.position.set(-3, 3, -4);
    scene.add(rimLight);

    const disposables: Array<{ dispose: () => void }> = [envTex];
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.CircleGeometry(0.95, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    disposables.push(shadowTex, shadowGeo, shadowMat);

    const sharedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff8f0,
      roughness: 0.08,
      metalness: 0.0,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.25 : 1.0,
      ior: 1.5,
      depthWrite: false,
    });
    disposables.push(sharedGlassMat);

    // Stage 1 (x = -2.0): Cold Steeping Jar with Coarse Grounds
    const stage1 = new THREE.Group();
    stage1.position.set(-2.0, 0, 0);
    scene.add(stage1);

    const jarShadow = new THREE.Mesh(shadowGeo, shadowMat);
    jarShadow.position.y = 0.005;
    stage1.add(jarShadow);

    const jarGeo = new THREE.CylinderGeometry(0.64, 0.66, 1.55, 32, 1, false);
    const jarMesh = new THREE.Mesh(jarGeo, sharedGlassMat);
    jarMesh.position.y = 0.78;
    jarMesh.renderOrder = 3;
    stage1.add(jarMesh);

    const groundsGeo = new THREE.CylinderGeometry(0.58, 0.6, 0.42, 28);
    const groundsMat = new THREE.MeshStandardMaterial({
      color: 0x261209,
      roughness: 0.9,
      emissive: 0xd4893a,
      emissiveIntensity: 0.15,
    });
    const groundsMesh = new THREE.Mesh(groundsGeo, groundsMat);
    groundsMesh.position.y = 0.25;
    stage1.add(groundsMesh);

    const steepLiquidGeo = new THREE.CylinderGeometry(0.59, 0.59, 0.85, 28);
    const steepLiquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a0a04,
      roughness: 0.12,
      emissive: 0xd4893a,
      emissiveIntensity: 0.08,
    });
    const steepLiquidMesh = new THREE.Mesh(steepLiquidGeo, steepLiquidMat);
    steepLiquidMesh.position.y = 0.84;
    stage1.add(steepLiquidMesh);

    const jarLidGeo = new THREE.CylinderGeometry(0.67, 0.67, 0.14, 32);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x140c09,
      roughness: 0.4,
      metalness: 0.4,
    });
    const jarLid = new THREE.Mesh(jarLidGeo, darkMetalMat);
    jarLid.position.y = 1.62;
    stage1.add(jarLid);
    disposables.push(jarGeo, groundsGeo, groundsMat, steepLiquidGeo, steepLiquidMat, jarLidGeo, darkMetalMat);

    // Stage 2 (x = 0): Cold-Drip Filter Funnel & Receiving Carafe
    const stage2 = new THREE.Group();
    stage2.position.set(0, 0, 0);
    scene.add(stage2);

    const filterShadow = new THREE.Mesh(shadowGeo, shadowMat);
    filterShadow.position.y = 0.005;
    stage2.add(filterShadow);

    const carafeGeo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.58, 0),
        new THREE.Vector2(0.62, 0.35),
        new THREE.Vector2(0.32, 0.95),
        new THREE.Vector2(0.35, 1.05),
      ],
      32,
    );
    const carafeMesh = new THREE.Mesh(carafeGeo, sharedGlassMat);
    carafeMesh.renderOrder = 3;
    stage2.add(carafeMesh);

    const filteredGeo = new THREE.CylinderGeometry(0.45, 0.56, 0.45, 24);
    const filteredMat = new THREE.MeshPhysicalMaterial({
      color: 0x240d05,
      roughness: 0.08,
      emissive: 0xd4893a,
      emissiveIntensity: 0.08,
    });
    const filteredMesh = new THREE.Mesh(filteredGeo, filteredMat);
    filteredMesh.position.y = 0.25;
    stage2.add(filteredMesh);

    const coneGeo = new THREE.ConeGeometry(0.56, 0.72, 28, 1, true);
    coneGeo.rotateX(Math.PI);
    const coneMesh = new THREE.Mesh(coneGeo, sharedGlassMat);
    coneMesh.position.y = 1.44;
    coneMesh.renderOrder = 3;
    stage2.add(coneMesh);

    const dripGeo = new THREE.SphereGeometry(0.05, 12, 10);
    const dripMat = new THREE.MeshStandardMaterial({
      color: 0xd4893a,
      emissive: 0xd4893a,
      emissiveIntensity: 0.65,
      roughness: 0.15,
    });
    const dripDrop = new THREE.Mesh(dripGeo, dripMat);
    dripDrop.position.y = 0.95;
    stage2.add(dripDrop);
    disposables.push(carafeGeo, filteredGeo, filteredMat, coneGeo, dripGeo, dripMat);

    // Stage 3 (x = 2.0): Bottled BASHQALOOB Flask
    const stage3 = new THREE.Group();
    stage3.position.set(2.0, 0, 0);
    scene.add(stage3);

    const bottleShadow = new THREE.Mesh(shadowGeo, shadowMat);
    bottleShadow.position.y = 0.005;
    stage3.add(bottleShadow);

    let needsDraw = true;
    const finishedBottle = createFlaskBottle({
      origin: 'ETHIOPIA',
      isSoftwareGl,
      maxAniso: renderer.capabilities.getMaxAnisotropy(),
      onTextureLoaded: () => {
        needsDraw = true;
      },
    });
    finishedBottle.group.scale.setScalar(0.76);
    finishedBottle.setFillProgress(1);
    finishedBottle.condensationMat.opacity = 0.45;
    stage3.add(finishedBottle.group);

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
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      needsDraw = true;
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const stageTargets = [-2.0, 0.0, 2.0];
    let spotX = stageTargets[activeRef.current] ?? -2.0;
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
      const idx = activeRef.current;

      // Glide stage spotlight smoothly onto the active 3D stage
      spotX = THREE.MathUtils.damp(spotX, stageTargets[idx] ?? 0, 7, dt);
      stageSpot.position.x = spotX;

      // Highlight active stage scale & emissive warmth
      const s1 = idx === 0 ? 1.07 : 0.94;
      const s2 = idx === 1 ? 1.07 : 0.94;
      const s3 = idx === 2 ? 1.07 : 0.94;
      stage1.scale.setScalar(THREE.MathUtils.damp(stage1.scale.x, s1, 7, dt));
      stage2.scale.setScalar(THREE.MathUtils.damp(stage2.scale.x, s2, 7, dt));
      stage3.scale.setScalar(THREE.MathUtils.damp(stage3.scale.x, s3, 7, dt));

      steepLiquidMat.emissiveIntensity = idx === 0 ? 0.42 : 0.06;
      filteredMat.emissiveIntensity = idx === 1 ? 0.45 : 0.06;
      dripMat.emissiveIntensity = idx === 1 ? 0.9 : 0.25;

      if (!reducedMotion) {
        const dripCycle = (elapsed * 0.85) % 1;
        dripDrop.position.y = 1.08 - dripCycle * 0.62;
        dripDrop.scale.setScalar(0.75 + Math.sin(dripCycle * Math.PI) * 0.35);
        if (idx === 2) {
          finishedBottle.group.rotation.y = Math.sin(elapsed * 1.1) * 0.35;
        } else {
          finishedBottle.group.rotation.y = THREE.MathUtils.damp(
            finishedBottle.group.rotation.y,
            0,
            6,
            dt,
          );
        }
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
      finishedBottle.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="process-3d-scene"
      className="relative w-full h-60 sm:h-64 rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: '#120A07',
        borderColor: 'var(--border-on-secondary)',
      }}
    />
  );
}
