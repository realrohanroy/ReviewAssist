import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor experience',
  2: 'Fair experience',
  3: 'Good experience',
  4: 'Very good experience',
  5: 'Excellent experience'
};

export function StarRatingSelector({ value, onChange }: StarRatingSelectorProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayRating = hovered !== null ? hovered : value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isFilled ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Star
                size={36}
                color={isFilled ? '#f59e0b' : '#64748b'}
                fill={isFilled ? '#f59e0b' : 'transparent'}
                strokeWidth={isFilled ? 1.5 : 1.75}
              />
            </button>
          );
        })}
      </div>

      <div style={{ height: 22, fontSize: '0.875rem', fontWeight: 500, color: displayRating > 0 ? '#f59e0b' : '#94a3b8' }}>
        {displayRating > 0 ? RATING_LABELS[displayRating] : 'Select your rating (optional)'}
      </div>
    </div>
  );
}
