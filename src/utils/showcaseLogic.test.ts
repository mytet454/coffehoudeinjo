import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePourFillProgress,
  computeScrollParallaxOffset,
  formatPrice,
  generateBeanSeeds,
  getDirectionForLanguage,
  getResponsiveBeanCount,
  getThemePalette,
  stepCarouselIndex,
  toggleThemeMode,
} from './showcaseLogic';

test('BASHQALOOB theme palette preserves 60/30/10 ratio and exact colors', () => {
  const espresso = getThemePalette('espresso');
  const cream = getThemePalette('cream');

  assert.equal(espresso.dominantBg, '#1A0F0C');
  assert.equal(espresso.secondarySurface, '#F5E6D3');
  assert.equal(espresso.accent, '#D4893A');
  assert.equal(espresso.buttonBg, '#3A1219');
  assert.deepEqual(espresso.ratio, { dominant: 60, secondary: 30, accent: 10 });

  assert.equal(cream.dominantBg, '#F5E6D3');
  assert.equal(cream.secondarySurface, '#1A0F0C');
  assert.equal(cream.accent, '#D4893A');
  assert.equal(cream.buttonBg, '#3A1219');

  assert.equal(toggleThemeMode('espresso'), 'cream');
  assert.equal(toggleThemeMode('cream'), 'espresso');
});

test('language direction and price formatting work for EN and AR', () => {
  assert.equal(getDirectionForLanguage('en'), 'ltr');
  assert.equal(getDirectionForLanguage('ar'), 'rtl');

  assert.equal(formatPrice(6.5, 'en'), '$6.50');
  assert.equal(formatPrice(6.5, 'ar'), '24 ر.س');
  assert.equal(formatPrice(-5, 'en'), '$0.00');
});

test('carousel index wraps cleanly forward and backward', () => {
  assert.equal(stepCarouselIndex(0, 1, 5), 1);
  assert.equal(stepCarouselIndex(4, 1, 5), 0);
  assert.equal(stepCarouselIndex(0, -1, 5), 4);
  assert.equal(stepCarouselIndex(2, -5, 5), 2);
  assert.equal(stepCarouselIndex(0, 1, 0), 0);
});

test('pour fill progress, mobile bean halving, and deterministic bean seeds', () => {
  assert.equal(computePourFillProgress(0, 0, 2), 0);
  assert.ok(computePourFillProgress(1, 0, 2) > 0.5);
  assert.equal(computePourFillProgress(2.5, 0, 2), 1);
  assert.equal(computePourFillProgress(1.5, 2, 2), 0);
  assert.equal(computePourFillProgress(4.5, 2, 2), 1);

  assert.equal(getResponsiveBeanCount(44, 1440), 44);
  assert.equal(getResponsiveBeanCount(44, 390), 22);

  assert.equal(computeScrollParallaxOffset(0, 900), 0);
  assert.ok(computeScrollParallaxOffset(900, 900) > 0);

  const a = generateBeanSeeds(40, 1234);
  const b = generateBeanSeeds(40, 1234);
  assert.equal(a.length, 40);
  assert.deepEqual(a, b);
});
