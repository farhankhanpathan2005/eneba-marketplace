import { Link } from 'react-router-dom'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  showDiscount?: boolean
}

const ProductCard = ({ product, showDiscount = true }: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} loading="lazy" />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1e0f4a 0%, #3d2080 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)', fontSize: '2.5rem',
            }}>
              🎮
            </div>
          )}
          {showDiscount && discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
          {product.platform && (
            <span className="platform-tag">{product.platform}</span>
          )}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-title">{product.title}</h3>
          <span className="product-card-meta">{product.category}{product.platform ? ` · ${product.platform}` : ''}</span>
          <div className="product-card-pricing">
            <span className="product-card-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="product-card-original">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="product-card-footer">
        <Link
          to={`/products/${product.id}`}
          className="btn btn-primary btn-full btn-sm"
        >
          View Deal
        </Link>
      </div>
    </div>
  )
}

export default ProductCard