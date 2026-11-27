import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROCESS_STEPS, getText } from '../data/coldBrewData';
import { Process3DScene } from '../three/Process3DScene';
import type { Language } from '../utils/showcaseLogic';

gsap.registerPlugin(ScrollTrigger);

interface ProcessSectionProps {
  lang: Language;
}

export function ProcessSection({ lang }: ProcessSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualLock, setManualLock] = useState(false);
  const copy = getText(lang);

  // Tie sequential step illumination to scroll progress via GSAP ScrollTrigger
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || manualLock) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 72%',
      end: 'bottom 45%',
      onUpdate: (self) => {
        const idx = Math.min(
          PROCESS_STEPS.length - 1,
          Math.floor(self.progress * PROCESS_STEPS.length),
        );
        setActiveIndex(idx);
      },
    });

    return () => st.kill();
  }, [manualLock]);

  const activeStep = PROCESS_STEPS[activeIndex] ?? PROCESS_STEPS[0];
  const stepText = lang === 'ar' ? activeStep.ar : activeStep.en;

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative z-10 py-20 sm:py-28 border-t"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <div className="max-w-2xl mb-12 reveal-item">
          <p
            className="text-xs font-semibold tracking-wider mb-2"
            style={{ color: 'var(--accent-text)' }}
          >
            {copy.processKicker}
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ textWrap: 'balance', color: 'var(--text-primary)' }}
          >
            {copy.processTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {copy.processSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 3 Sequential Step Controls */}
          <div className="lg:col-span-6 flex flex-col gap-3 justify-center">
            {PROCESS_STEPS.map((step, idx) => {
              const isSelected = idx === activeIndex;
              const content = lang === 'ar' ? step.ar : step.en;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setManualLock(true);
                    setActiveIndex(idx);
                  }}
                  aria-pressed={isSelected}
                  className="text-start rounded-2xl p-5 border transition-all duration-200 flex items-start justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--surface-secondary)'
                      : 'var(--bg-dominant-elevated)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                    color: isSelected ? 'var(--text-on-secondary)' : 'var(--text-primary)',
                    outlineColor: 'var(--accent)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="font-display text-xl font-bold tabular-nums shrink-0"
                      style={{
                        color: isSelected ? 'var(--accent-on-secondary)' : 'var(--accent-text)',
                      }}
                    >
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold leading-snug">{content.title}</h3>
                      <p
                        className="mt-1 text-sm"
                        style={{
                          color: isSelected
                            ? 'var(--text-on-secondary-muted)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {content.caption}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums whitespace-nowrap shrink-0 mt-1"
                    style={{
                      color: isSelected ? 'var(--accent-on-secondary)' : 'var(--text-muted)',
                    }}
                  >
                    {step.duration}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: 3D Steeping Jar -> Filter -> Bottle Process Scene */}
          <div
            className="lg:col-span-6 rounded-2xl p-6 sm:p-8 border flex flex-col justify-between gap-6"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-on-secondary)',
              color: 'var(--text-on-secondary)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Process3DScene activeIndex={activeIndex} />

            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span
                  className="text-xs font-semibold tracking-wider"
                  style={{ color: 'var(--accent-on-secondary)' }}
                >
                  {activeStep.number} · {activeStep.duration}
                </span>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {PROCESS_STEPS.map((s, i) => (
                    <span
                      key={s.id}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === activeIndex ? '20px' : '6px',
                        backgroundColor:
                          i === activeIndex ? 'var(--accent)' : 'var(--border-on-secondary)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">{stepText.title}</h3>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: 'var(--text-on-secondary-muted)' }}
              >
                {stepText.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
