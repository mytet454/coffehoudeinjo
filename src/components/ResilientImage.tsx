import { useState } from 'react';
import { Coffee } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ResilientImage({ src, alt, className = '' }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 p-6 text-center ${className}`}
        style={{
          background:
            'linear-gradient(145deg, var(--bg-dominant-elevated) 0%, var(--bg-dominant) 100%)',
          color: 'var(--text-muted)',
        }}
      >
        <Coffee className="w-8 h-8" style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-medium">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
