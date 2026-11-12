import { Link } from 'react-router-dom'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.title} />
        )}
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          {discount > 0 && (
            <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '0.5rem' }}>
              -{discount}%
            </span>
          )}
          <div>
            <span className="product-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="product-original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            {product.category} • {product.platform || 'Multi-platform'}
          </p>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
