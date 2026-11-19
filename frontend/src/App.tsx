import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ToastContainer from './components/layout/ToastContainer'
import ErrorBoundary from './components/layout/ErrorBoundary'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </BrowserRouter>
  )
}

export default App