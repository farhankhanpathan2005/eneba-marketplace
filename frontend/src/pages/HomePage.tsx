import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/api'
import type { Product } from '../types'
import SkeletonGrid from '../components/layout/SkeletonGrid'

const HomePage = () => {
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    fetchProducts({ limit: 60 })
      .then(data => setAllProducts(data.data || data))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))

    // Animate hero on load
    setTimeout(() => setHeroVisible(true), 100)
  }, [])

  if (loading) {
    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, #1e0f4a 0%, #3d2080 50%, #6b3fa0 100%)',
          borderRadius: '20px',
          padding: '3rem',
          marginBottom: '2.5rem',
        }}>
          <div className="skeleton" style={{ width: '380px', height: '44px', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ width: '280px', height: '18px', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ width: '160px', height: '50px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
          <div className="skeleton" style={{ height: '140px', borderRadius: '14px' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: '14px' }} />
        </div>
        <SkeletonGrid count={8} />
      </div>
    )
  }

  const bestSellers = [...allProducts]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8)

  const deals = allProducts.filter(p => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => {
      const dA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100
      const dB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100
      return dB - dA
    })
    .slice(0, 8)

  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return (
    <div>
      {/* Hero Banner with animation */}
      <section className="hero-banner" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
        <div className="hero-content">
          <span className="hero-tag">🔥 Hot Deals</span>
          <h1>
            Best Prices on<br /><span>Digital Games</span>
          </h1>
          <p>
            Get game keys, gift cards, and software at unbeatable prices.
            Instant delivery from trusted sellers worldwide.
          </p>
          <div className="hero-actions">
            <button
              className="btn-hero"
              onClick={() => navigate('/products')}
              style={{ animation: 'pulse 2s infinite' }}
            >
              Browse All Products →
            </button>
            <button
              className="btn-hero-outline"
              onClick={() => navigate('/products?category=Deals')}
            >
              Today's Deals
            </button>
          </div>
        </div>
      </section>

      {/* Promotional Banner Row with hover lift */}
      <div className="banner-row dark-section">
        <div
          className="promo-banner purple"
          onClick={() => navigate('/products?category=Games')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}
        >
          <h3>Top Game Deals</h3>
          <p>Save up to 90% on AAA titles</p>
          <span className="promo-discount">-90%</span>
        </div>
        <div
          className="promo-banner dark-section"
          onClick={() => navigate('/products?category=Gift+Cards')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}
        >
          <h3>Gift Cards</h3>
          <p>Steam, PSN, Xbox & more</p>
          <span className="promo-discount">💳</span>
        </div>
      </div>

      {/* Category Icons Row */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { name: 'Games', slug: 'Games', icon: '🎮' },
            { name: 'Gift Cards', slug: 'Gift Cards', icon: '💳' },
            { name: 'Software', slug: 'Software', icon: '💻' },
            { name: 'Streaming', slug: 'Streaming', icon: '📺' },
            { name: 'Steam', slug: 'Steam', icon: '🎯' },
            { name: 'PSN', slug: 'PSN', icon: '🕹️' },
            { name: 'Xbox', slug: 'Xbox', icon: '🟢' },
            { name: 'Nintendo', slug: 'Nintendo', icon: '🔴' },
          ].map(cat => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug)}`)}
              className="cat-icon-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '1rem 1.25rem',
                background: 'white',
                border: '1px solid #e5e0f0',
                borderRadius: '14px',
                minWidth: '90px',
                cursor: 'pointer',
              }}
            >
              <span className="cat-icon-emoji" style={{ fontSize: '1.75rem', display: 'inline-block', transition: 'transform 0.3s' }}>
                {cat.icon}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a2e' }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="section dark-section">
          <div className="section-header">
            <h2 className="section-title">⭐ Best Sellers</h2>
            <Link to="/products?sortBy=rating&sortOrder=desc" className="section-link">See all →</Link>
          </div>
          <div className="product-grid">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Today's Deals */}
      {deals.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🔥 Today's Deals</h2>
            <Link to="/products" className="section-link">All deals →</Link>
          </div>
          <div className="product-grid">
            {deals.map(p => <ProductCard key={p.id} product={p} showDiscount />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section dark-section">
          <div className="section-header">
            <h2 className="section-title">🆕 New Arrivals</h2>
            <Link to="/products?sortBy=newest&sortOrder=desc" className="section-link">See all →</Link>
          </div>
          <div className="product-grid">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {allProducts.length === 0 && (
        <div className="empty-state dark-section">
          <div className="empty-state-icon">🎮</div>
          <h2>No products yet</h2>
          <p>Check back soon for exciting deals on digital games and more!</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      )}
    </div>
  )
}

// Import ProductCard locally to avoid circular dependency issues
import ProductCard from '../components/products/ProductCard'

export default HomePage