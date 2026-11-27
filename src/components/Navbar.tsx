import { useState } from 'react';
import { Menu, Moon, Sun, X, Languages } from 'lucide-react';
import { BRAND_INFO, NAV_LINKS, getText } from '../data/coldBrewData';
import type { Language, ThemeMode } from '../utils/showcaseLogic';

interface NavbarProps {
  lang: Language;
  theme: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onNavigate: (sectionId: string) => void;
}

export function Navbar({
  lang,
  theme,
  onToggleLanguage,
  onToggleTheme,
  onNavigate,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = getText(lang);
  const brand = BRAND_INFO[lang].name;

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-dominant)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          className="font-display text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{
            color: 'var(--text-primary)',
            outlineColor: 'var(--accent)',
          }}
        >
          {brand}
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Primary Navigation'}
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="text-sm font-medium whitespace-nowrap shrink-0 relative py-1 transition-opacity hover:opacity-100 opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[var(--accent)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
              style={{
                color: 'var(--text-primary)',
                outlineColor: 'var(--accent)',
              }}
            >
              {lang === 'ar' ? item.ar : item.en}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language & 60/30/10 Theme Inversion Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            data-testid="lang-toggle"
            aria-label={
              lang === 'ar' ? 'Switch language to English' : 'تبديل اللغة إلى العربية'
            }
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-dominant-elevated)',
              outlineColor: 'var(--accent)',
            }}
          >
            <Languages className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{copy.langSwitchLabel}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            data-testid="theme-toggle"
            aria-label={theme === 'espresso' ? copy.themeToLight : copy.themeToDark}
            title={theme === 'espresso' ? copy.themeToLight : copy.themeToDark}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-dominant-elevated)',
              outlineColor: 'var(--accent)',
            }}
          >
            {theme === 'espresso' ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={
              mobileOpen
                ? lang === 'ar'
                  ? 'إغلاق القائمة'
                  : 'Close menu'
                : lang === 'ar'
                  ? 'فتح القائمة'
                  : 'Open menu'
            }
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border shrink-0"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-dominant-elevated)',
            }}
          >
            {mobileOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label={lang === 'ar' ? 'القائمة السريعة' : 'Mobile Navigation'}
          className="lg:hidden border-t px-4 py-4 flex flex-col gap-2"
          style={{
            backgroundColor: 'var(--bg-dominant)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {lang === 'ar' ? item.ar : item.en}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
