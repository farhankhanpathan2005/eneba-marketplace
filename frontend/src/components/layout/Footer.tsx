import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const handleFooterClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    // Handle internal routes
    if (href.startsWith('/products')) {
      // Extract category from href and navigate
      const category = href.split('=')[1]
      window.location.hash = `#nav-category-${encodeURIComponent(category || '')}`
      return
    }
    if (href.startsWith('/login') || href === '/') {
      window.location.href = href
    }
    // External links or unhandled routes - use placeholder behavior
    console.log('Footer link clicked:', href)
  }

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="logo">
            eneba<span className="logo-dot"></span>
          </Link>
          <p>The safest marketplace for digital game keys, gift cards, and software. Trusted by millions of gamers worldwide.</p>
        </div>

        <div className="footer-col">
          <h4>Marketplace</h4>
          <ul>
            <li><Link to="/products?category=Games" onClick={e => handleFooterClick(e, '/products?category=Games')}>Games</Link></li>
            <li><Link to="/products?category=Gift+Cards" onClick={e => handleFooterClick(e, '/products?category=Gift+Cards')}>Gift Cards</Link></li>
            <li><Link to="/products?category=Software" onClick={e => handleFooterClick(e, '/products?category=Software')}>Software</Link></li>
            <li><Link to="/products?category=Streaming" onClick={e => handleFooterClick(e, '/products?category=Streaming')}>Streaming</Link></li>
            <li><Link to="/products?category=Steam" onClick={e => handleFooterClick(e, '/products?category=Steam')}>Steam Keys</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Help Center - Coming Soon') }}>Help Center</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Contact Us - Coming Soon') }}>Contact Us</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('FAQ - Coming Soon') }}>FAQ</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Sell on Eneba - Coming Soon') }}>Sell on Eneba</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Returns Policy - Coming Soon') }}>Returns Policy</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('About Us - Coming Soon') }}>About Us</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Terms of Service - Coming Soon') }}>Terms of Service</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Privacy Policy - Coming Soon') }}>Privacy Policy</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Cookie Policy - Coming Soon') }}>Cookie Policy</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); alert('Careers - Coming Soon') }}>Careers</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {currentYear} Eneba Marketplace. All rights reserved.</span>
        <span>
          Secure payments via{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.5)' }}>Stripe</a> &middot;{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.5)' }}>PayPal</a> &middot;{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.5)' }}>Crypto</a>
        </span>
      </div>
    </footer>
  )
}

export default Footer