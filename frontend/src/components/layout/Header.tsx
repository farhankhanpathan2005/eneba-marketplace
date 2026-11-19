import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { clearAuth, getUser } from '../../services/api'
import type { User } from '../../types'

const CATEGORIES = [
  { name: 'Games', slug: 'Games', icon: '🎮' },
  { name: 'Gift Cards', slug: 'Gift Cards', icon: '💳' },
  { name: 'Software', slug: 'Software', icon: '💻' },
  { name: 'Streaming', slug: 'Streaming', icon: '📺' },
  { name: 'Steam', slug: 'Steam', icon: '🎯' },
  { name: 'PSN', slug: 'PSN', icon: '🕹️' },
  { name: 'Xbox', slug: 'Xbox', icon: '🟢' },
  { name: 'Nintendo', slug: 'Nintendo', icon: '🔴' },
]

const Header = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUser(getUser())
    const stored = localStorage.getItem('eneba_cart_count')
    if (stored) setCartCount(parseInt(stored))

    const handler = () => {
      const count = localStorage.getItem('eneba_cart_count')
      if (count !== null) setCartCount(parseInt(count))
    }
    window.addEventListener('cart-changed', handler)
    return () => window.removeEventListener('cart-changed', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="header-top">
          {/* Logo */}
          <Link to="/" className="logo">
            eneba<span className="logo-dot"></span>
          </Link>

          {/* Search */}
          <form className="search-container" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search games, DLCs, gift cards & more"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Right actions */}
          <div className="header-actions">
            {user ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button className="header-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  👤 {user.username}
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    minWidth: 200,
                    padding: '0.5rem',
                    zIndex: 200,
                    marginTop: '0.5rem',
                    border: '1px solid #e5e0f0',
                  }}>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        color: '#1a1a2e',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                      }}
                    >
                      📦 My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.6rem 1rem',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="header-btn">
                  👤 Sign In
                </Link>
                <Link to="/register" className="header-btn btn-signup">
                  Sign Up
                </Link>
              </>
            )}

            <Link to="/cart" className="header-btn cart-btn">
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Category Nav Bar */}
        <nav className="category-nav">
          <div className="category-nav-inner">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                className="cat-nav-item"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug)}`)}
              >
                <span className="cat-nav-icon">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </nav>
      </header>
    </>
  )
}

export default Header