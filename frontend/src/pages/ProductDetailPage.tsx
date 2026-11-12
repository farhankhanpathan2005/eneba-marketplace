import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductById } from '../services/api'
import type { Product } from '../types'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchProductById(id).then((data) => {
      setProduct(data)
      setLoading(false)
    }).catch(() => {
      setError('Product not found')
      setLoading(false)
    })
  }, [id])

  const addToCart = () => {
    // TODO: Implement add to cart logic
    console.log('Add to cart:', { productId: id, quantity })
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!product) return <p>Product not found</p>

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="container">
      <Link to="/products" style={{ color: '#666', textDecoration: 'none' }}>&larr; Back to products</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.title} style={{ width: '100%', borderRadius: '12px' }} />
        )}

        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product.title}</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{product.category} &bull; {product.platform || 'Multi-platform'}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80' }}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: '1.25rem', color: '#999', textDecoration: 'line-through' }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{product.description || 'No description available.'}</p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginRight: '1rem' }}>Quantity:</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={addToCart} style={{ flex: 1 }}>
              Add to Cart
            </button>
            <button className="btn btn-secondary" onClick={() => {/* TODO: Buy now */}}>
              Buy Now
            </button>
          </div>

          <p style={{ marginTop: '1rem', color: product.stock > 0 ? '#4ade80' : '#ef4444' }}>
            {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
