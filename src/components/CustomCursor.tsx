import { useEffect, useRef, useState } from 'react';

type CursorShape = 'default' | 'button' | 'card';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [shape, setShape] = useState<CursorShape>('default');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    setEnabled(true);
    document.body.classList.add('custom-cursor-active');

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('button, a, [data-cursor="button"]')) {
        setShape('button');
      } else if (target.closest('[data-cursor="card"]')) {
        setShape('card');
      } else {
        setShape('default');
      }
    };

    const onPointerLeave = () => {
      setVisible(false);
    };

    const loop = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  if (!enabled) return null;

  const ringSize =
    shape === 'card'
      ? 'w-14 h-14 border-2'
      : shape === 'button'
        ? 'w-10 h-10 border-2'
        : 'w-7 h-7 border';

  const ringBg =
    shape === 'button'
      ? 'rgba(255, 140, 26, 0.18)'
      : shape === 'card'
        ? 'rgba(255, 140, 26, 0.10)'
        : 'transparent';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full transition-[width,height,background-color,opacity] duration-200 ${ringSize}`}
        style={{
          opacity: visible ? 1 : 0,
          borderColor: 'var(--accent)',
          backgroundColor: ringBg,
        }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full transition-transform duration-150"
        style={{
          opacity: visible ? (shape === 'button' ? 0.25 : 1) : 0,
          backgroundColor: 'var(--accent)',
        }}
      />
    </div>
  );
}
