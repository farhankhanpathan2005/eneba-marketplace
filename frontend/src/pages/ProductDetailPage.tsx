import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchProductById, addToCart } from '../services/api'
import type { Product } from '../types'
import { toast } from '../hooks/useDebounce'

interface SellerOffer {
  id: number
  sellerName: string
  sellerRating: number
  price: number
  originalPrice?: number
  region: string
  deliveryTime: string
  isBestPrice?: boolean
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [offers, setOffers] = useState<SellerOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchProductById(Number(id))
      .then(data => {
        setProduct(data)
        setOffers(generateMockOffers(data))
        setSelectedOfferId(100) // Default to first offer
        setLoading(false)
      })
      .catch(() => {
        setError('Product not found')
        setLoading(false)
      })
  }, [id])

  function generateMockOffers(product: Product): SellerOffer[] {
    const sellers = [
      { name: 'GameKeyPro', rating: 4.8, regions: ['EU'], delivery: '< 5 min' },
      { name: 'DigitalDeals', rating: 4.5, regions: ['ROW'], delivery: '< 1 hour' },
      { name: 'KeyMaster', rating: 4.9, regions: ['NA'], delivery: 'Instant' },
      { name: 'BudgetKeys', rating: 4.2, regions: ['EU'], delivery: '< 30 min' },
    ]
    return sellers.map((seller, i) => ({
      id: 100 + i,
      sellerName: seller.name,
      sellerRating: seller.rating,
      price: product.price + (i === 0 ? -1.5 : i === 1 ? -0.5 : i === 2 ? 1 : 0),
      originalPrice: product.originalPrice,
      region: seller.regions[0],
      deliveryTime: seller.delivery,
      isBestPrice: i === 0,
    }))
  }

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = async () => {
    if (!product || !selectedOfferId) return
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      toast(`Added ${quantity}x ${product.title} to cart!`, 'success')
      const current = parseInt(localStorage.getItem('eneba_cart_count') || '0')
      localStorage.setItem('eneba_cart_count', String(current + quantity))
      window.dispatchEvent(new Event('cart-changed'))
    } catch (err) {
      toast('Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    await handleAddToCart()
    setTimeout(() => {
      navigate('/cart')
    }, 500)
  }

  if (loading) {
    return (
      <div>
        <Link to="/products" className="back-link" style={{ color: '#6b7280', marginBottom: '1rem', display: 'inline-block' }}>
          Back to products
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginTop: '2rem' }}>
          <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: '14px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '36px', width: '70%' }} />
            <div className="skeleton" style={{ height: '20px', width: '40%' }} />
            <div className="skeleton" style={{ height: '48px', width: '30%' }} />
            <div className="skeleton" style={{ height: '20px', width: '100%' }} />
            <div className="skeleton" style={{ height: '20px', width: '80%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😕</div>
        <h2>Product not found</h2>
        <p>{error || 'The product you are looking for does not exist.'}</p>
        <Link to="/products" className="btn btn-primary">Back to Products</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/products" className="back-link" style={{ color: '#6b7280', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to products
      </Link>

      <div className="detail-layout" style={{ marginTop: '1.5rem' }}>
        {/* Left: Image Gallery */}
        <div>
          <div className="detail-image" style={{ position: 'relative', overflow: 'hidden' }}>
            {!imageLoaded && (
              <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: '14px' }} />
            )}
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                onLoad={() => setImageLoaded(true)}
                style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #1e0f4a 0%, #3d2080 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '5rem', borderRadius: '14px',
              }}>
                🎮
              </div>
            )}

            {/* Image zoom on hover */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0)',
              cursor: 'zoom-in',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
            />
          </div>

          {/* Thumbnail gallery */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: '80px',
                height: '60px',
                borderRadius: '8px',
                background: i === 1 ? 'var(--eneba-purple-mid)' : 'var(--eneba-bg)',
                border: i === 1 ? '2px solid var(--eneba-purple-mid)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                🎮
              </div>
            ))}
          </div>

          {/* Related products */}
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Related Products</h3>
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '0.75rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}
                >
                  <div style={{ background: 'linear-gradient(135deg, #1e0f4a, #3d2080)', borderRadius: '8px', aspectRatio: '4/3', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎮</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--eneba-green)' }}>${(Math.random() * 30 + 5).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="detail-info">
          <h1>{product.title}</h1>

          <div className="detail-meta">
            <span className="meta-tag">{product.category}</span>
            {product.platform && <span className="meta-tag">{product.platform}</span>}
            <span className="meta-tag">⭐ {product.rating?.toFixed(1) || 'New'}</span>
            <span className="meta-tag" style={{ color: 'var(--eneba-green)', background: '#f0fdf4' }}>✓ Verified Seller</span>
          </div>

          <div className="detail-price-block">
            <span className="detail-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="detail-original-price">${product.originalPrice.toFixed(2)}</span>
                <span className="detail-discount">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Tabs for description/reviews/shipping */}
          <div style={{ borderBottom: '2px solid var(--eneba-border)', marginBottom: '1.5rem' }}>
            {[
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${Math.floor(Math.random() * 50 + 10)})` },
              { id: 'shipping', label: 'Delivery Info' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.75rem 1.5rem',
                  marginRight: '0.5rem',
                  borderBottom: activeTab === tab.id ? '2px solid var(--eneba-purple-mid)' : '2px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--eneba-purple-mid)' : 'var(--eneba-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ minHeight: '100px', marginBottom: '1.5rem' }}>
            {activeTab === 'description' && (
              <p className="detail-description">
                {product.description || 'Get your digital key delivered instantly after purchase. Compatible with the selected platform. Enjoy endless hours of entertainment! This product comes with a 30-day money-back guarantee and 24/7 customer support.'}
              </p>
            )}
            {activeTab === 'reviews' && (
              <div style={{ color: 'var(--eneba-text-muted)', fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--eneba-bg)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--eneba-accent)' }}>★★★★★</span>
                    <span style={{ fontWeight: 600 }}>Excellent!</span>
                  </div>
                  <p>"Got my key instantly. Worked perfectly on the first try. Great price too!"</p>
                  <span style={{ fontSize: '0.8rem' }}>- GamingLegend42 • 2 days ago</span>
                </div>
                <div style={{ padding: '1rem', background: 'var(--eneba-bg)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--eneba-accent)' }}>★★★★☆</span>
                    <span style={{ fontWeight: 600 }}>Good deal</span>
                  </div>
                  <p>"Fast delivery, good price. Minor delay in key generation but overall satisfied."</p>
                  <span style={{ fontSize: '0.8rem' }}>- KeyHunter • 1 week ago</span>
                </div>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div style={{ color: 'var(--eneba-text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { icon: '⚡', title: 'Instant Delivery', desc: 'Receive your key within minutes' },
                    { icon: '🔒', title: 'Secure Payment', desc: '256-bit SSL encryption' },
                    { icon: '↩️', title: '30-Day Refund', desc: 'Money-back guarantee' },
                  ].map(item => (
                    <div key={item.title} style={{ display: 'flex', gap: '1rem', alignItems: 'start', padding: '1rem', background: 'var(--eneba-bg)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--eneba-text)' }}>{item.title}</div>
                        <div style={{ fontSize: '0.85rem' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="detail-quantity">
            <label>Quantity:</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <span style={{ color: product.stock > 0 ? '#16a34a' : '#ef4444', fontSize: '0.88rem', fontWeight: 600 }}>
              {product.stock > 0 ? `✓ In stock (${product.stock} available)` : '✗ Out of stock'}
            </span>
          </div>

          <div className="detail-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || adding}
            >
              {adding ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button className="btn btn-accent btn-lg" style={{ flex: 1 }} onClick={handleBuyNow}>
              ⚡ Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {['🔒 Secure Checkout', '⚡ Instant Delivery', '↩️ Money-Back Guarantee'].map(badge => (
              <span key={badge} style={{ fontSize: '0.78rem', color: 'var(--eneba-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Seller Comparison Table */}
      <div className="seller-table-wrapper" style={{ marginTop: '3rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e0f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Available Offers from {offers.length} Sellers</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Compare prices and choose the best deal for your region
          </p>
        </div>
        <table className="seller-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Price</th>
              <th>Region</th>
              <th>Delivery</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr
                key={offer.id}
                className={offer.isBestPrice ? 'best-price' : ''}
                onClick={() => setSelectedOfferId(offer.id)}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => {
                  if (!offer.isBestPrice) e.currentTarget.style.background = 'rgba(124, 77, 219, 0.05)'
                }}
                onMouseLeave={e => {
                  if (!offer.isBestPrice) e.currentTarget.style.background = ''
                }}
              >
                <td>
                  <div style={{ fontWeight: 600 }}>{offer.sellerName}</div>
                  {offer.isBestPrice && <span className="best-badge">BEST PRICE</span>}
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.1rem' }}>
                    ${offer.price.toFixed(2)}
                  </div>
                  {offer.originalPrice && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                      ${offer.originalPrice.toFixed(2)}
                    </div>
                  )}
                </td>
                <td><span className="region-tag">{offer.region}</span></td>
                <td style={{ color: '#6b7280' }}>{offer.deliveryTime}</td>
                <td>
                  <span className="rating-stars">{'★'.repeat(Math.floor(offer.sellerRating))}{'☆'.repeat(5 - Math.floor(offer.sellerRating))}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                    {offer.sellerRating}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOfferId(offer.id)
                      toast(`Selected ${offer.sellerName}`, 'info')
                    }}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductDetailPage