import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";

interface StarRatingProps {
  value: number; // 0~5
  max?: number;
  size?: number; // pixel size
  className?: string;
}

const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(max, num));

export default function StarRating({
  value,
  max = 5,
  size = 18,
  className,
}: StarRatingProps) {
  const v = clamp(Math.round(value || 0), 0, max);
  return (
    <div
      className={className}
      aria-label={`별점 ${v}/${max}`}
      title={`${v}/${max}`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) =>
          i < v ? (
            <StarSolid
              key={i}
              style={{ width: size, height: size }}
              className="text-yellow-400"
            />
          ) : (
            <StarOutline
              key={i}
              style={{ width: size, height: size }}
              className="text-gray-300"
            />
          )
        )}
      </div>
    </div>
  );
}
