import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCart, removeFromCart, updateCartItem, createOrder, getUser } from '../services/api'
import type { CartItem } from '../types'
import { toast } from '../hooks/useDebounce'
import SkeletonGrid from '../components/layout/SkeletonGrid'

const CartPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    try {
      const data = await fetchCart()
      // The backend already returns product data in the cart items
      // No need for enrichment - just use the data as-is
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.price || 0
    return acc + price * item.quantity
  }, 0)
  const tax = subtotal * 0.0
  const total = subtotal + tax

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromCart(itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
      toast('Removed from cart', 'info')
      updateCartCount()
    } catch {
      toast('Failed to remove item', 'error')
    }
  }

  const handleQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return
    try {
      await updateCartItem(itemId, newQty)
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i))
    } catch {
      toast('Failed to update quantity', 'error')
    }
  }

  function updateCartCount() {
    const count = items.reduce((acc, i) => acc + i.quantity, 0)
    localStorage.setItem('eneba_cart_count', String(count))
    window.dispatchEvent(new Event('cart-changed'))
  }

  const handleCheckout = async () => {
    const user = getUser()
    if (!user) {
      toast('Please login to checkout', 'info')
      navigate('/login')
      return
    }
    setCheckoutOpen(true)
  }

  const confirmOrder = async () => {
    setProcessing(true)
    try {
      const order = await createOrder(selectedPayment)
      setCheckoutOpen(false)
      setItems([])
      localStorage.setItem('eneba_cart_count', '0')
      navigate('/order-confirmation', { state: { order } })
    } catch {
      toast('Checkout failed. Please try again.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="section-title" style={{ marginTop: '1.5rem' }}>Shopping Cart</h1>
        <SkeletonGrid count={3} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-title" style={{ marginTop: '1.5rem' }}>Shopping Cart ({items.length} items)</h1>

      <div className="cart-layout">
        {/* Items */}
        <div>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={item.product?.imageUrl || 'https://via.placeholder.com/90'}
                alt={item.product?.title || 'Product'}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.product?.title || `Product #${item.productId}`}</h3>
                <p className="cart-item-seller">{item.product?.category} • {item.product?.platform || 'Multi-platform'}</p>
                <div className="quantity-control">
                  <button onClick={() => handleQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="cart-item-price">
                <span className="price">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                <button className="remove-btn" onClick={() => handleRemove(item.id)}>✕ Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <div className="summary-save">
            🎉 You're saving ${(items.reduce((acc, i) => {
              const orig = i.product?.originalPrice || i.product?.price || 0
              return acc + (orig - (i.product?.price || 0)) * i.quantity
            }, 0)).toFixed(2)} on this order!
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span className="value">${total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '1.5rem' }}
            onClick={handleCheckout}
          >
            Proceed to Checkout →
          </button>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
            🔒 Secure checkout • Instant delivery
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="modal-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Checkout</h2>
              <button className="modal-close" onClick={() => setCheckoutOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Select Payment Method</h3>
              <div className="payment-options">
                {[
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex' },
                  { id: 'paypal', label: 'PayPal', desc: 'Pay securely with PayPal' },
                  { id: 'crypto', label: 'Cryptocurrency', desc: 'Bitcoin, Ethereum' },
                ].map(method => (
                  <label key={method.id} className={`payment-option ${selectedPayment === method.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                    />
                    <div>
                      <div className="pay-label">{method.label}</div>
                      <div className="pay-desc">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6b7280' }}>Items ({items.reduce((a, i) => a + i.quantity, 0)})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span style={{ color: '#16a34a' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={confirmOrder}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
                By completing this order you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage