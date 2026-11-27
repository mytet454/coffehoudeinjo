import * as THREE from 'three';
import { LOGO_IMAGE_PATH } from '../data/coldBrewData';

export interface CondensationDrop {
  angle: number;
  y: number;
  baseY: number;
  speed: number;
  scale: number;
  delay: number;
}

export interface FlaskBottleRig {
  group: THREE.Group;
  glassMesh: THREE.Mesh;
  glassMat: THREE.MeshPhysicalMaterial;
  liquidGroup: THREE.Group;
  liquidMesh: THREE.Mesh;
  liquidGeo: THREE.LatheGeometry;
  liquidTopPositions: Float32Array;
  liquidTopIndices: number[];
  labelMesh: THREE.Mesh;
  condensationMesh: THREE.InstancedMesh;
  condensationMat: THREE.MeshPhysicalMaterial;
  condensationDrops: CondensationDrop[];
  sloshAmplitude: number;
  sloshPhase: number;
  setFillProgress: (progress: number) => void;
  updateCondensation: (elapsed: number, dt: number, reducedMotion: boolean) => void;
  updateSlosh: (dt: number, elapsed: number) => void;
  triggerSlosh: (strength?: number) => void;
  setTransmissionEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

/**
 * Sculpts a 3D coffee bean ellipsoid with a flattened belly and S-curved central crease.
 */
export function createCoffeeBeanGeometry(radius = 0.32): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius, 22, 16);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    z *= 1.4;
    x *= 0.92;

    if (y < 0) {
      y *= 0.48;
      const sCurve = radius * 0.1 * Math.sin((z / radius) * 3.8);
      const dist = Math.abs(x - sCurve);
      const creaseWidth = radius * 0.28;
      if (dist < creaseWidth) {
        y += (1 - dist / creaseWidth) * (radius * 0.32);
      }
    } else {
      y *= 0.88;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a soft radial shadow texture for grounding bottles on the floor plane.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 124);
    grad.addColorStop(0, 'rgba(6, 2, 1, 0.82)');
    grad.addColorStop(0.55, 'rgba(10, 4, 2, 0.42)');
    grad.addColorStop(1, 'rgba(10, 4, 2, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(canvas);
}

/**
 * Generates a soft low-lying cold chill mist sprite texture (no hot steam).
 */
export function createColdMistTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(220, 234, 248, 0.35)');
    grad.addColorStop(0.5, 'rgba(245, 230, 211, 0.14)');
    grad.addColorStop(1, 'rgba(245, 230, 211, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

/**
 * Builds a round cream label CanvasTexture using the actual BASHQALOOB logo artwork
 * with COLD BREW and the single-origin name (COLOMBIA or ETHIOPIA) printed below.
 */
export function createRoundLabelTexture(
  originName: 'COLOMBIA' | 'ETHIOPIA',
  maxAniso: number,
  onLoaded?: () => void,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;

  const drawLabel = (logoImg: HTMLImageElement | null) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw circular cream sticker centered on the UV wrap
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 236;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#F5E6D3';
    ctx.fill();

    // Subtle double amber & espresso hairline border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#C97B2C';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(26, 15, 12, 0.45)';
    ctx.stroke();
    ctx.clip();

    // Crop the centered BASHQALOOB artwork and multiply-blend seamlessly onto cream paper
    if (logoImg) {
      const iw = logoImg.naturalWidth || logoImg.width;
      const ih = logoImg.naturalHeight || logoImg.height;
      const crop = 0.62;
      const sx = iw * ((1 - crop) / 2);
      const sy = ih * ((1 - crop) / 2);
      const sw = iw * crop;
      const sh = ih * crop;
      const drawSize = 256;

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(logoImg, sx, sy, sw, sh, cx - drawSize / 2, cy - 188, drawSize, drawSize);
      ctx.restore();
    }

    // Typography beneath the logo: COLD BREW + small origin name in crisp espresso ink
    ctx.fillStyle = '#1A0F0C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '800 32px "Plus Jakarta Sans", Georgia, sans-serif';
    ctx.fillText('C O L D   B R E W', cx, cy + 104);

    ctx.fillStyle = '#4A240B';
    ctx.font = '800 22px "Plus Jakarta Sans", Georgia, sans-serif';
    ctx.fillText(originName.split('').join(' '), cx, cy + 148);

    ctx.restore();
    tex.needsUpdate = true;
    onLoaded?.();
  };

  drawLabel(null);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => drawLabel(img);
  img.src = LOGO_IMAGE_PATH;

  return tex;
}

/**
 * Assembles a composite 3D flask-shaped cold brew bottle with LatheGeometry glass,
 * black screw cap, sloshable inner cold brew liquid, camera-facing round cream label,
 * and InstancedMesh condensation droplets.
 */
export function createFlaskBottle(options: {
  origin: 'COLOMBIA' | 'ETHIOPIA';
  isSoftwareGl: boolean;
  maxAniso: number;
  onTextureLoaded?: () => void;
}): FlaskBottleRig {
  const { origin, isSoftwareGl, maxAniso, onTextureLoaded } = options;
  const disposables: Array<{ dispose: () => void }> = [];
  const group = new THREE.Group();

  // 1. Clear glass flask profile (LatheGeometry, grounded at y = 0)
  const glassProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.72, 0.0),
    new THREE.Vector2(0.79, 0.08),
    new THREE.Vector2(0.8, 1.48),
    new THREE.Vector2(0.73, 1.78),
    new THREE.Vector2(0.32, 2.15),
    new THREE.Vector2(0.28, 2.52),
    new THREE.Vector2(0.31, 2.58),
    new THREE.Vector2(0.24, 2.6),
    new THREE.Vector2(0.23, 2.12),
    new THREE.Vector2(0.67, 1.72),
    new THREE.Vector2(0.73, 1.44),
    new THREE.Vector2(0.72, 0.14),
    new THREE.Vector2(0.0, 0.14),
  ];
  const glassGeo = new THREE.LatheGeometry(glassProfile, 48);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5e6d3,
    roughness: 0.06,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.92,
    transparent: true,
    opacity: isSoftwareGl ? 0.15 : 1.0,
    ior: 1.52,
    thickness: 0.42,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.35,
    depthWrite: false,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.castShadow = !isSoftwareGl;
  glassMesh.renderOrder = 3;
  group.add(glassMesh);
  disposables.push(glassGeo, glassMat);

  // 2. Inner dark cold brew liquid (LatheGeometry, pivot at base y = 0.15 for pour-fill scaling)
  const liquidGroup = new THREE.Group();
  liquidGroup.position.y = 0.15;
  group.add(liquidGroup);

  const liquidHeight = 1.66;
  const liquidProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.69, 0.0),
    new THREE.Vector2(0.71, 0.45),
    new THREE.Vector2(0.71, 1.05),
    new THREE.Vector2(0.68, 1.42),
    new THREE.Vector2(0.56, liquidHeight),
    new THREE.Vector2(0.28, liquidHeight - 0.01),
    new THREE.Vector2(0.0, liquidHeight),
  ];
  const liquidGeo = new THREE.LatheGeometry(liquidProfile, 44);
  const posAttr = liquidGeo.attributes.position;
  const liquidTopPositions = new Float32Array(posAttr.array);
  const liquidTopIndices: number[] = [];

  for (let i = 0; i < posAttr.count; i++) {
    if (posAttr.getY(i) >= liquidHeight - 0.06) {
      liquidTopIndices.push(i);
    }
  }

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: origin === 'COLOMBIA' ? 0x160904 : 0x1f0b05,
    roughness: 0.08,
    metalness: 0.02,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    emissive: origin === 'COLOMBIA' ? 0x240c03 : 0x2e1105,
    emissiveIntensity: 0.25,
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.renderOrder = 1;
  liquidGroup.add(liquidMesh);
  disposables.push(liquidGeo, liquidMat);

  // 3. Black ribbed screw cap & tamper ring
  const capGeo = new THREE.CylinderGeometry(0.32, 0.325, 0.32, 36);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x110c0a,
    roughness: 0.42,
    metalness: 0.18,
  });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = 2.66;
  capMesh.castShadow = !isSoftwareGl;
  capMesh.renderOrder = 4;
  group.add(capMesh);

  const collarGeo = new THREE.TorusGeometry(0.315, 0.022, 10, 36);
  collarGeo.rotateX(Math.PI / 2);
  const collarMesh = new THREE.Mesh(collarGeo, capMat);
  collarMesh.position.y = 2.47;
  collarMesh.renderOrder = 4;
  group.add(collarMesh);
  disposables.push(capGeo, collarGeo, capMat);

  // 4. Round cream label on curved cylinder segment facing +Z camera
  const labelTex = createRoundLabelTexture(origin, maxAniso, onTextureLoaded);
  const labelGeo = new THREE.CylinderGeometry(
    0.808,
    0.808,
    0.92,
    40,
    1,
    true,
    -Math.PI * 0.42,
    Math.PI * 0.84,
  );
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    color: 0xead7bf,
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.88,
    metalness: 0.0,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.94;
  labelMesh.renderOrder = 4;
  group.add(labelMesh);
  disposables.push(labelTex, labelGeo, labelMat);

  // 5. InstancedMesh Condensation Droplets (appear over first seconds & drip slowly)
  const dropCount = 54;
  const dropGeo = new THREE.SphereGeometry(0.014, 10, 8);
  const condensationMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5e6d3,
    roughness: 0.04,
    metalness: 0.0,
    transparent: true,
    opacity: 0.0,
  });
  const condensationMesh = new THREE.InstancedMesh(dropGeo, condensationMat, dropCount);
  condensationMesh.renderOrder = 5;
  condensationMesh.frustumCulled = false;

  const condensationDrops: CondensationDrop[] = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < dropCount; i++) {
    const angle = (i / dropCount) * Math.PI * 2 + (i % 5) * 0.35;
    const baseY = 0.22 + ((i * 43) % 100) / 100 * 1.48;
    const drop: CondensationDrop = {
      angle,
      y: baseY,
      baseY,
      speed: 0.028 + (i % 4) * 0.012,
      scale: 0.65 + (i % 4) * 0.24,
      delay: 0.6 + (i % 10) * 0.28,
    };
    condensationDrops.push(drop);

    const r = 0.806;
    dummy.position.set(Math.sin(angle) * r, baseY, Math.cos(angle) * r);
    dummy.scale.set(drop.scale, drop.scale * 1.35, drop.scale);
    dummy.updateMatrix();
    condensationMesh.setMatrixAt(i, dummy.matrix);
  }
  condensationMesh.instanceMatrix.needsUpdate = true;
  group.add(condensationMesh);
  disposables.push(dropGeo, condensationMat);

  const rig: FlaskBottleRig = {
    group,
    glassMesh,
    glassMat,
    liquidGroup,
    liquidMesh,
    liquidGeo,
    liquidTopPositions,
    liquidTopIndices,
    labelMesh,
    condensationMesh,
    condensationMat,
    condensationDrops,
    sloshAmplitude: 0,
    sloshPhase: 0,

    setFillProgress(progress: number) {
      const clamped = Math.max(0.001, Math.min(1, progress));
      liquidGroup.scale.y = clamped;
      liquidMesh.visible = progress > 0.01;
    },

    updateCondensation(elapsed: number, dt: number, reducedMotion: boolean) {
      // Fade condensation droplets onto glass over the first 4 seconds
      const fadeIn = Math.min(1, Math.max(0, (elapsed - 0.5) / 3.2));
      condensationMat.opacity = fadeIn * 0.52;

      if (reducedMotion) return;

      for (let i = 0; i < condensationDrops.length; i++) {
        const drop = condensationDrops[i];
        if (elapsed > drop.delay) {
          drop.y -= drop.speed * dt;
          if (drop.y < 0.16) {
            drop.y = 1.68;
          }
        }
        const r = 0.806;
        dummy.position.set(Math.sin(drop.angle) * r, drop.y, Math.cos(drop.angle) * r);
        dummy.scale.set(drop.scale, drop.scale * 1.45, drop.scale);
        dummy.updateMatrix();
        condensationMesh.setMatrixAt(i, dummy.matrix);
      }
      condensationMesh.instanceMatrix.needsUpdate = true;
    },

    triggerSlosh(strength = 0.048) {
      rig.sloshAmplitude = Math.max(rig.sloshAmplitude, strength);
    },

    updateSlosh(dt: number, elapsed: number) {
      if (rig.sloshAmplitude <= 0.0005) {
        if (rig.sloshAmplitude !== 0) {
          rig.sloshAmplitude = 0;
          const pos = liquidGeo.attributes.position;
          for (const idx of liquidTopIndices) {
            pos.setY(idx, liquidTopPositions[idx * 3 + 1]);
          }
          pos.needsUpdate = true;
          liquidGeo.computeVertexNormals();
        }
        return;
      }

      rig.sloshPhase += dt * 11;
      rig.sloshAmplitude *= Math.exp(-2.8 * dt);

      const pos = liquidGeo.attributes.position;
      for (const idx of liquidTopIndices) {
        const x = liquidTopPositions[idx * 3];
        const baseY = liquidTopPositions[idx * 3 + 1];
        const z = liquidTopPositions[idx * 3 + 2];
        const wave =
          Math.sin(x * 4.5 + rig.sloshPhase + elapsed * 2) *
          Math.cos(z * 3.0) *
          rig.sloshAmplitude;
        pos.setY(idx, baseY + wave);
      }
      pos.needsUpdate = true;
      liquidGeo.computeVertexNormals();
    },

    setTransmissionEnabled(enabled: boolean) {
      if (isSoftwareGl) return;
      const targetTrans = enabled ? 0.92 : 0;
      const targetOpacity = enabled ? 1.0 : 0.15;
      if (glassMat.transmission !== targetTrans) {
        glassMat.transmission = targetTrans;
        glassMat.opacity = targetOpacity;
        glassMat.needsUpdate = true;
      }
    },

    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };

  return rig;
}
