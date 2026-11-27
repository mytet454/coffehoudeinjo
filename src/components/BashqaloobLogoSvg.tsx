/**
 * Animated BASHQALOOB vector emblem used in the hero intro:
 * draws the triangle outline via stroke-dashoffset and blinks the top eye once.
 */
export function BashqaloobLogoSvg({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="BASHQALOOB emblem"
      className={className}
    >
      {/* Top Stylized Eye with single blink animation */}
      <g className="logo-eye-blink">
        <path
          d="M34 24C43 13 77 13 86 24C77 35 43 35 34 24Z"
          stroke="var(--accent)"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="24" r="4.5" fill="var(--accent)" />
        <path
          d="M44 33C40 38 35 39 33 36"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M72 32L72 41"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Triangle Outline drawn in with CSS stroke animation */}
      <path
        d="M60 34L98 94H22L60 34Z"
        stroke="var(--text-primary)"
        strokeWidth="3.2"
        strokeLinejoin="round"
        className="logo-triangle-stroke"
      />

      {/* Coffee Bean centered inside the triangle */}
      <g>
        <ellipse
          cx="60"
          cy="71"
          rx="10"
          ry="13.5"
          stroke="var(--accent)"
          strokeWidth="2.6"
        />
        <path
          d="M60 58.5C56.5 65 63.5 76 60 83.5"
          stroke="var(--accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>

      {/* Row of small hieroglyphic symbols (bird, cup, figure) below triangle */}
      <g stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Bird */}
        <path d="M32 108C34 104 38 104 39 107L44 114H34L36 119M38 114V119" />
        {/* Cup */}
        <path d="M53 106H67C67 113 64 117 60 117C56 117 53 113 53 106Z" />
        <path d="M67 108H70C71.5 108 71.5 112 69 112H67" />
        {/* Seated Figure */}
        <circle cx="82" cy="105" r="2" />
        <path d="M82 108V114H88V119H78L80 114" />
      </g>
    </svg>
  );
}
