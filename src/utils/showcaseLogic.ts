export type Language = 'en' | 'ar';
export type ThemeMode = 'espresso' | 'cream';

export interface ThemePalette {
  mode: ThemeMode;
  dominantBg: string;
  secondarySurface: string;
  accent: string;
  buttonBg: string;
  textOnDominant: string;
  textOnSecondary: string;
  ratio: {
    dominant: number;
    secondary: number;
    accent: number;
  };
}

/**
 * Returns the 60/30/10 palette configuration for BASHQALOOB Espresso (dark) vs Cream (light) mode.
 */
export function getThemePalette(mode: ThemeMode): ThemePalette {
  if (mode === 'espresso') {
    return {
      mode: 'espresso',
      dominantBg: '#1A0F0C',
      secondarySurface: '#F5E6D3',
      accent: '#D4893A',
      buttonBg: '#3A1219',
      textOnDominant: '#F5E6D3',
      textOnSecondary: '#1A0F0C',
      ratio: { dominant: 60, secondary: 30, accent: 10 },
    };
  }
  return {
    mode: 'cream',
    dominantBg: '#F5E6D3',
    secondarySurface: '#1A0F0C',
    accent: '#D4893A',
    buttonBg: '#3A1219',
    textOnDominant: '#1A0F0C',
    textOnSecondary: '#F5E6D3',
    ratio: { dominant: 60, secondary: 30, accent: 10 },
  };
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'espresso' ? 'cream' : 'espresso';
}

export function getDirectionForLanguage(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Formats USD base price into USD ($) for English or SAR for Arabic.
 */
export function formatPrice(usdPrice: number, lang: Language): string {
  const safePrice = Number.isFinite(usdPrice) && usdPrice >= 0 ? usdPrice : 0;
  if (lang === 'ar') {
    const sar = Math.round(safePrice * 3.75);
    return `${sar} ر.س`;
  }
  return `$${safePrice.toFixed(2)}`;
}

/**
 * Computes carousel wrap-around indices cleanly.
 */
export function stepCarouselIndex(
  currentIndex: number,
  delta: number,
  totalItems: number,
): number {
  if (totalItems <= 0) return 0;
  return (((currentIndex + delta) % totalItems) + totalItems) % totalItems;
}

/**
 * Computes normalized 0..1 pour fill progress for bottle 1 (0..2s) and bottle 2 (2..4s).
 */
export function computePourFillProgress(
  elapsedSeconds: number,
  startSeconds: number,
  durationSeconds = 2,
): number {
  if (!Number.isFinite(elapsedSeconds) || durationSeconds <= 0) return 1;
  if (elapsedSeconds <= startSeconds) return 0;
  if (elapsedSeconds >= startSeconds + durationSeconds) return 1;
  const t = (elapsedSeconds - startSeconds) / durationSeconds;
  // Smooth easeOutCubic
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Halves background bean count on mobile viewports for consistent 60fps performance.
 */
export function getResponsiveBeanCount(desktopCount: number, viewportWidth: number): number {
  const safeCount = Math.max(0, Math.floor(desktopCount));
  return viewportWidth < 768 ? Math.max(1, Math.floor(safeCount / 2)) : safeCount;
}

/**
 * Computes smooth scroll-driven vertical parallax offset in world units for 3D coffee beans.
 */
export function computeScrollParallaxOffset(
  scrollY: number,
  viewportHeight: number,
  factor = 0.0045,
): number {
  if (!Number.isFinite(scrollY) || !Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return 0;
  }
  const normalized = Math.max(0, scrollY) / viewportHeight;
  return normalized * factor * 100;
}

export interface BeanSeed {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  driftAmp: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  phase: number;
  tintFactor: number;
}

/**
 * Deterministic PRNG for reproducible 3D coffee bean distribution across page loads.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateBeanSeeds(count: number, seed = 4208): BeanSeed[] {
  const rand = createSeededRandom(seed);
  const beans: BeanSeed[] = [];
  const safeCount = Math.max(0, Math.floor(count));

  for (let i = 0; i < safeCount; i++) {
    beans.push({
      x: (rand() - 0.5) * 22,
      y: (rand() - 0.5) * 18,
      z: -2 - rand() * 10,
      scale: 0.85 + rand() * 0.3,
      speed: 0.4 + rand() * 0.6,
      driftAmp: 0.25 + rand() * 0.45,
      rotSpeedX: (rand() - 0.5) * 0.85,
      rotSpeedY: (rand() - 0.5) * 1.05,
      rotSpeedZ: (rand() - 0.5) * 0.75,
      phase: rand() * Math.PI * 2,
      tintFactor: rand(),
    });
  }
  return beans;
}
