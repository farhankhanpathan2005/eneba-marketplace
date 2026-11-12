import { useEffect, useState } from 'react'
import ProductCard from '../components/products/ProductCard'
import { fetchProducts } from '../services/api'
import type { Product } from '../types'

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then((data) => {
      setFeaturedProducts(data.slice(0, 8))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="hero">
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a2e' }}>
            Best Deals on Digital Games
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
            Get game keys, gift cards, and more at unbeatable prices
          </p>
        </div>
      </section>

      <section className="container">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
