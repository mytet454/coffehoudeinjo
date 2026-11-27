import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Star } from 'lucide-react';
import { REVIEWS, getText } from '../data/coldBrewData';
import { stepCarouselIndex, type Language } from '../utils/showcaseLogic';

interface ReviewsCarouselProps {
  lang: Language;
}

export function ReviewsCarousel({ lang }: ReviewsCarouselProps) {
  const [paused, setPaused] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const copy = getText(lang);

  // Duplicate list for seamless continuous marquee
  const marqueeItems = [...REVIEWS, ...REVIEWS];

  const handleStep = (delta: number) => {
    setPaused(true);
    setFocusedIdx((prev) => stepCarouselIndex(prev, delta, REVIEWS.length));
  };

  return (
    <section
      id="reviews"
      className="relative z-10 py-20 sm:py-28 border-t overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 reveal-item">
        <div>
          <p
            className="text-xs font-semibold tracking-wider mb-2"
            style={{ color: 'var(--accent-text)' }}
          >
            {copy.reviewsKicker}
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ textWrap: 'balance', color: 'var(--text-primary)' }}
          >
            {copy.reviewsTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label={copy.prevReview}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-dominant-elevated)',
              color: 'var(--text-primary)',
            }}
          >
            {lang === 'ar' ? (
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? copy.playCarousel : copy.pauseCarousel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-dominant-elevated)',
              color: 'var(--text-primary)',
            }}
          >
            {paused ? (
              <Play className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Pause className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label={copy.nextReview}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-dominant-elevated)',
              color: 'var(--text-primary)',
            }}
          >
            {lang === 'ar' ? (
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Auto-scrolling Carousel Track (Pauses cleanly on hover or manual control) */}
      <div className="reviews-carousel w-full overflow-hidden">
        <div
          className={`reviews-track gap-6 px-4 sm:px-8 ${paused ? 'is-paused' : ''}`}
          style={
            paused
              ? {
                  transform: `translate3d(${
                    (lang === 'ar' ? 1 : -1) * focusedIdx * 240
                  }px, 0, 0)`,
                  transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                }
              : undefined
          }
        >
          {marqueeItems.map((review, index) => {
            const content = lang === 'ar' ? review.ar : review.en;
            const isHighlighted = paused && index % REVIEWS.length === focusedIdx;
            return (
              <article
                key={`${review.id}-${index}`}
                className="w-[310px] sm:w-[370px] shrink-0 rounded-2xl p-6 border flex flex-col justify-between gap-6 transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: isHighlighted
                    ? 'var(--accent)'
                    : 'var(--border-on-secondary)',
                  color: 'var(--text-on-secondary)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div
                    className="flex items-center justify-between gap-4 mb-4"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className="w-4 h-4 fill-current"
                          style={{ color: 'var(--accent)' }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-on-secondary-muted)' }}
                    >
                      {content.variety}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    “{content.quote}”
                  </p>
                </div>

                <div
                  className="pt-4 border-t"
                  style={{ borderColor: 'var(--border-on-secondary)' }}
                >
                  <p className="text-sm font-semibold">{content.author}</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-on-secondary-muted)' }}
                  >
                    {content.role}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
