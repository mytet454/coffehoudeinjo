import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react';
import {
  BRAND_INFO,
  FEATURED_PRODUCT,
  NAV_LINKS,
  ORIGIN_STORY,
  PRODUCT_RANGE,
  getText,
} from './data/coldBrewData';
import {
  formatPrice,
  getDirectionForLanguage,
  toggleThemeMode,
  type Language,
  type ThemeMode,
} from './utils/showcaseLogic';
import { HeroBottlesScene } from './three/HeroBottlesScene';
import { FallingBeansCanvas } from './three/FallingBeansCanvas';
import { MiniBottlePreview } from './three/MiniBottlePreview';
import { CoffeeBeanLoader } from './components/CoffeeBeanLoader';
import { BashqaloobLogoSvg } from './components/BashqaloobLogoSvg';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { ResilientImage } from './components/ResilientImage';
import { ProcessSection } from './components/ProcessSection';
import { ReviewsCarousel } from './components/ReviewsCarousel';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>('espresso');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !new URLSearchParams(window.location.search).has('autostart');
  });

  // Sync HTML dir, lang, and .dark class for 60/30/10 Espresso/Cream inversion
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = getDirectionForLanguage(lang);
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'espresso') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    document.body.dataset.theme = theme;
  }, [theme]);

  // Brief 3D coffee-bean loader transition on initial mount
  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  // GSAP ScrollTrigger slide-and-fade entrance animations for each section's elements
  useEffect(() => {
    const items = gsap.utils.toArray<HTMLElement>('.reveal-item');
    if (items.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              once: true,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [lang]);

  const handleSmoothNavigate = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Placeholder order action: glowing hover effect, intentionally does nothing when clicked
  const handlePlaceholderOrderClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const brand = BRAND_INFO[lang];
  const copy = getText(lang);
  const featured = FEATURED_PRODUCT[lang];
  const origin = ORIGIN_STORY[lang];

  return (
    <div
      className={`relative min-h-screen transition-opacity duration-500 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <CoffeeBeanLoader visible={isLoading} label={brand.loaderLabel} />
      <CustomCursor />

      {/* Background Falling 3D Coffee Beans with Scroll Velocity Boost */}
      <FallingBeansCanvas theme={theme} />

      <Navbar
        lang={lang}
        theme={theme}
        onToggleLanguage={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        onToggleTheme={() => setTheme((prev) => toggleThemeMode(prev))}
        onNavigate={handleSmoothNavigate}
      />

      <main className="relative z-10">
        {/* 1. HERO SECTION */}
        <section
          id="hero"
          className="relative py-12 sm:py-16 lg:py-20 overflow-hidden"
        >
          {/* Subtle readability gradient scrim behind hero text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                theme === 'espresso'
                  ? 'radial-gradient(circle at 25% 45%, rgba(26, 15, 12, 0.82) 0%, rgba(26, 15, 12, 0.25) 68%)'
                  : 'radial-gradient(circle at 25% 45%, rgba(245, 230, 211, 0.85) 0%, rgba(245, 230, 211, 0.25) 68%)',
            }}
          />

          <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col items-start gap-5">
              <div className="flex items-center gap-3.5">
                <BashqaloobLogoSvg className="w-12 h-14 shrink-0" />
                <p
                  className="text-xs sm:text-sm font-semibold tracking-wider"
                  style={{ color: 'var(--accent-text)' }}
                >
                  {brand.name} · {lang === 'ar' ? 'قهوة مختصة باردة' : 'Specialty Cold Brew'}
                </p>
              </div>

              <h1
                className="font-display font-bold leading-[1.08] tracking-tight"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                  textWrap: 'balance',
                  color: 'var(--text-primary)',
                }}
              >
                {brand.tagline}
              </h1>

              <p
                className="text-base sm:text-lg leading-relaxed max-w-xl"
                style={{ color: 'var(--text-muted)' }}
              >
                {brand.subtagline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handlePlaceholderOrderClick}
                  data-testid="hero-order-btn"
                  className="order-glow-btn min-h-[48px] px-7 py-3 rounded-xl text-sm sm:text-base font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{ outlineColor: 'var(--accent)' }}
                >
                  <span>{brand.orderNow}</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSmoothNavigate('range')}
                  className="min-h-[48px] px-5 py-3 rounded-xl text-sm font-semibold border inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-dominant-elevated)',
                  }}
                >
                  <span>{brand.exploreRange}</span>
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroBottlesScene dragHint={brand.dragHint} />
            </div>
          </div>
        </section>

        {/* 2. FEATURED PRODUCT SECTION */}
        <section
          id="featured"
          className="py-20 sm:py-28 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div
              className="reveal-item rounded-3xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-on-secondary)',
                color: 'var(--text-on-secondary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="lg:col-span-6 min-h-[300px] lg:min-h-[480px] overflow-hidden">
                <ResilientImage
                  src={FEATURED_PRODUCT.image}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>

              <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
                <div>
                  <p
                    className="text-xs font-semibold tracking-wider mb-3"
                    style={{ color: 'var(--accent-on-secondary)' }}
                  >
                    {featured.kicker}
                  </p>
                  <h2
                    className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    {featured.title}
                  </h2>
                  <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: 'var(--text-on-secondary-muted)' }}
                  >
                    {featured.description}
                  </p>

                  {/* Tasting Notes & Specs — Unboxed Typographic Metadata */}
                  <div
                    className="mt-6 pt-6 border-t space-y-3"
                    style={{ borderColor: 'var(--border-on-secondary)' }}
                  >
                    <p
                      className="text-xs font-semibold tracking-wider"
                      style={{ color: 'var(--accent-on-secondary)' }}
                    >
                      {featured.notesLabel}
                    </p>
                    <p className="text-sm sm:text-base font-medium">
                      {featured.notes.join(' · ')}
                    </p>
                    <p
                      className="text-xs sm:text-sm tabular-nums"
                      style={{ color: 'var(--text-on-secondary-muted)' }}
                    >
                      {featured.specs.join(' · ')}
                    </p>
                  </div>
                </div>

                <div
                  className="pt-6 border-t flex flex-wrap items-center justify-between gap-4"
                  style={{ borderColor: 'var(--border-on-secondary)' }}
                >
                  <div>
                    <span
                      className="block text-xs"
                      style={{ color: 'var(--text-on-secondary-muted)' }}
                    >
                      {FEATURED_PRODUCT.volumeMl} ml · {FEATURED_PRODUCT.caffeineMg} mg
                    </span>
                    <span className="font-display text-3xl font-bold tabular-nums">
                      {formatPrice(FEATURED_PRODUCT.priceUsd, lang)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceholderOrderClick}
                    className="order-glow-btn min-h-[46px] px-7 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <span>{brand.orderNow}</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUCT RANGE SECTION (Colombia & Ethiopia 3D Bottle Preview Cards) */}
        <section
          id="range"
          className="py-20 sm:py-28 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="max-w-2xl mb-12 reveal-item">
              <p
                className="text-xs font-semibold tracking-wider mb-2"
                style={{ color: 'var(--accent-text)' }}
              >
                {copy.rangeKicker}
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ textWrap: 'balance', color: 'var(--text-primary)' }}
              >
                {copy.rangeTitle}
              </h2>
              <p
                className="mt-3 text-base leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                {copy.rangeSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {PRODUCT_RANGE.map((item) => {
                const content = item[lang];
                const isHovered = hoveredCardId === item.id;
                return (
                  <article
                    key={item.id}
                    data-cursor="card"
                    onMouseEnter={() => setHoveredCardId(item.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-on-secondary)',
                      color: 'var(--text-on-secondary)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                    className="reveal-item group rounded-2xl border overflow-hidden flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    <div>
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <MiniBottlePreview
                          origin={item.originCode}
                          hovered={isHovered}
                        />
                      </div>

                      <div className="p-6 sm:p-7">
                        <p
                          className="text-xs font-medium mb-1.5"
                          style={{ color: 'var(--text-on-secondary-muted)' }}
                        >
                          {content.subtitle}
                        </p>
                        <h3 className="font-display text-2xl font-bold leading-snug">
                          {content.name}
                        </h3>
                        <p
                          className="mt-2.5 text-sm leading-relaxed"
                          style={{ color: 'var(--text-on-secondary-muted)' }}
                        >
                          {content.description}
                        </p>
                        <p
                          className="mt-4 text-xs font-semibold"
                          style={{ color: 'var(--accent-on-secondary)' }}
                        >
                          {content.notes.join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div
                      className="px-6 sm:px-7 py-4 border-t flex items-center justify-between gap-4"
                      style={{ borderColor: 'var(--border-on-secondary)' }}
                    >
                      <div>
                        <span className="font-display text-2xl font-bold tabular-nums">
                          {formatPrice(item.priceUsd, lang)}
                        </span>
                        <span
                          className="block text-xs tabular-nums"
                          style={{ color: 'var(--text-on-secondary-muted)' }}
                        >
                          {item.volumeMl} ml · {item.caffeineMg} mg
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handlePlaceholderOrderClick}
                        className="order-glow-btn min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <span>{brand.orderShort}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. ORIGIN STORY SECTION */}
        <section
          id="origin"
          className="py-20 sm:py-28 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 reveal-item flex flex-col justify-between gap-8">
                <div>
                  <p
                    className="text-xs font-semibold tracking-wider mb-2"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    {origin.kicker}
                  </p>
                  <h2
                    className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
                    style={{ textWrap: 'balance', color: 'var(--text-primary)' }}
                  >
                    {origin.title}
                  </h2>

                  <div
                    className="mt-6 space-y-4 text-base leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {origin.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  {origin.stats.map((stat, idx) => (
                    <div key={idx}>
                      <p
                        className="font-display text-2xl font-bold tabular-nums"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="lg:col-span-6 reveal-item rounded-3xl overflow-hidden border min-h-[320px]"
                style={{
                  borderColor: 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <ResilientImage
                  src={ORIGIN_STORY.image}
                  alt={origin.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROCESS SECTION (3D Steeping Jar -> Filter -> Bottle) */}
        <ProcessSection lang={lang} />

        {/* 6. REVIEWS CAROUSEL SECTION */}
        <ReviewsCarousel lang={lang} />
      </main>

      {/* 7. FOOTER */}
      <footer
        className="relative z-10 border-t py-14 sm:py-16"
        style={{
          backgroundColor: 'var(--bg-dominant-elevated)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothNavigate('hero');
              }}
              className="font-display text-2xl font-bold tracking-tight inline-block"
              style={{ color: 'var(--text-primary)' }}
            >
              {brand.name}
            </a>
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {copy.footerTagline}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#footer"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#footer"
                onClick={(e) => e.preventDefault()}
                aria-label="Email"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3
              className="text-xs font-semibold tracking-wider"
              style={{ color: 'var(--accent-text)' }}
            >
              {copy.footerNavTitle}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSmoothNavigate(item.id);
                    }}
                    className="hover:underline"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {lang === 'ar' ? item.ar : item.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h3
              className="text-xs font-semibold tracking-wider"
              style={{ color: 'var(--accent-text)' }}
            >
              {copy.footerContactTitle}
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
                <span>{copy.footerAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
                <span className="tabular-nums">{copy.footerHours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
                <span className="tabular-nums" dir="ltr">{copy.footerPhone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
                <span>{copy.footerEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mx-auto max-w-[1280px] px-4 sm:px-8 mt-12 pt-6 border-t text-xs"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          {copy.copyright}
        </div>
      </footer>
    </div>
  );
}
