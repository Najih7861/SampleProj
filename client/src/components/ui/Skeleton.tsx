interface SkeletonProps {
  width?: string
  height?: string
  radius?: string
  className?: string
}

export default function Skeleton({ width, height, radius, className = '' }: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden
    />
  )
}

/** A few shimmer text lines (last one shorter). */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="skeleton-line" width={index === lines - 1 ? '60%' : '100%'} />
      ))}
    </>
  )
}

/** Silhouette matching a package/place card so grids don't jump while loading. */
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden>
      <Skeleton className="skeleton-card-media" />
      <div className="skeleton-card-body">
        <Skeleton className="skeleton-line" width="70%" height="1.1rem" />
        <Skeleton className="skeleton-line" width="45%" />
        <Skeleton className="skeleton-line" width="100%" height="2rem" />
      </div>
    </div>
  )
}
