import './Skeleton.css';

/**
 * Skeleton loader component for showing loading placeholders
 */
function Skeleton({ variant = 'text', width, height, className = '', style = {} }) {
  const baseClass = `skeleton skeleton-${variant}`;
  const combinedStyle = {
    ...(width && { width }),
    ...(height && { height }),
    ...style,
  };

  return <div className={`${baseClass} ${className}`} style={combinedStyle} />;
}

/**
 * Skeleton card for camp/session list items
 */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <div className="skeleton-card-title">
          <Skeleton variant="text" width="60%" height="1.25rem" />
          <Skeleton variant="text" width="80px" height="1rem" style={{ marginTop: '0.5rem' }} />
        </div>
        <div className="skeleton-card-actions">
          <Skeleton variant="button" width="70px" height="32px" />
          <Skeleton variant="button" width="70px" height="32px" />
        </div>
      </div>
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="40%" height="0.9rem" />
        <Skeleton variant="text" width="35%" height="0.9rem" />
      </div>
    </div>
  );
}

/**
 * Skeleton list showing multiple card placeholders
 */
function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList };
