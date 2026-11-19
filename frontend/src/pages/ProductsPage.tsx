import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import { fetchProducts } from '../services/api'
import type { Product } from '../types'
import { useDebouncedValue } from '../hooks/useDebounce'
import SkeletonGrid from '../components/layout/SkeletonGrid'

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'

const CATEGORIES = ['Games', 'Gift Cards', 'Software', 'Streaming', 'Trading Cards']
const PLATFORMS = ['PC', 'Xbox', 'PlayStation', 'Nintendo', 'Mobile', 'Multi-platform']

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialPlatform = searchParams.get('platform') || ''
  const initialSortBy = searchParams.get('sortBy') || 'relevance'
  const initialSortOrder = searchParams.get('sortOrder') || 'desc'

  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Filters
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [platform, setPlatform] = useState(initialPlatform)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy as SortOption)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder as 'asc' | 'desc')

  const debouncedSearch = useDebouncedValue(searchTerm, 300)
  const PRODUCTS_PER_PAGE = 16

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (category) params.category = category
    if (platform) params.platform = platform
    params.sortBy = sortBy
    params.sortOrder = sortOrder
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, category, platform, sortBy, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch products
  useEffect(() => {
    setLoading(true)
    fetchProducts({ limit: 200 })
      .then(data => {
        const all: Product[] = data.data || data
        setProducts(all)
        applyFilters(all, debouncedSearch, category, platform, minPrice, maxPrice, sortBy, sortOrder)
        setLoading(false)
      })
      .catch(() => { setProducts([]); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters
  useEffect(() => {
    setPage(1)
    applyFilters(products, debouncedSearch, category, platform, minPrice, maxPrice, sortBy, sortOrder)
  }, [debouncedSearch, category, platform, minPrice, maxPrice, sortBy, sortOrder, products])

  function applyFilters(
    list: Product[],
    search: string,
    cat: string,
    plat: string,
    minP: string,
    maxP: string,
    sort: SortOption,
    order: 'asc' | 'desc'
  ) {
    let result = [...list]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.platform && p.platform.toLowerCase().includes(q))
      )
    }
    if (cat) result = result.filter(p => p.category === cat)
    if (plat) result = result.filter(p => p.platform === plat)
    if (minP !== '') result = result.filter(p => p.price >= parseFloat(minP))
    if (maxP !== '') result = result.filter(p => p.price <= parseFloat(maxP))

    result.sort((a, b) => {
      let cmp = 0
      switch (sort) {
        case 'price_asc': cmp = a.price - b.price; break
        case 'price_desc': cmp = b.price - a.price; break
        case 'rating': cmp = (b.rating || 0) - (a.rating || 0); break
        case 'newest': cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); break
        default: cmp = 0;
      }
      return order === 'desc' ? cmp : -cmp
    })

    setFiltered(result)
  }

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE)

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategory('')
    setPlatform('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('relevance')
    setSortOrder('desc')
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters = category || platform || minPrice || maxPrice || sortBy !== 'relevance'

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '1.25rem' }}>
        {debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Products'}
      </h1>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="">All Platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Min Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Max Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="999"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Order</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="results-count">
          Showing <strong>{filtered.length}</strong> products
          {category && <> in <strong>{category}</strong></>}
          {platform && <> for <strong>{platform}</strong></>}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <SkeletonGrid count={16} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>No products found</h2>
          <p>Try adjusting your filters or search terms.</p>
          <button className="btn btn-primary" onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {paginated.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .map((n, i, arr) => (
                  <>
                    {i > 0 && arr[i - 1] !== n - 1 && (
                      <span style={{ color: '#6b7280' }}>…</span>
                    )}
                    <button
                      key={n}
                      className={n === page ? 'active' : ''}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </>
                ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductsPage