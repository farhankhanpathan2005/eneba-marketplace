import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="header">
      <h1><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Eneba Marketplace</Link></h1>
      <nav>
        <ul className="nav-links">
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register" className="btn btn-primary">Sign Up</Link></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
