const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="skeleton skeleton-card" />
        <div style={{ padding: '1rem' }}>
          <div className="skeleton skeleton-text w-50" style={{ marginBottom: '0.5rem' }} />
          <div className="skeleton skeleton-text w-75" style={{ marginBottom: '0.5rem' }} />
          <div className="skeleton skeleton-text w-25" />
        </div>
      </div>
    ))}
  </div>
)

export default SkeletonGrid