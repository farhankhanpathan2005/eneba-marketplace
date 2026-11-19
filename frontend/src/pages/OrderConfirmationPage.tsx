import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import type { Order } from '../types'
import { toast } from '../hooks/useDebounce'

const OrderConfirmationPage = () => {
  const location = useLocation()
  const [order, setOrder] = useState<Order | null>(null)
  const [copiedKey, setCopiedKey] = useState<number | null>(null)

  useEffect(() => {
    const stateOrder = location.state?.order as Order | undefined
    if (stateOrder) {
      setOrder(stateOrder)
    } else {
      // Fallback: generate mock keys for demonstration
      const mockKeys = Array.from({ length: 3 }, () =>
        `${String(Math.random()).slice(2, 6).toUpperCase()}-${String(Math.random()).slice(2, 6).toUpperCase()}-${String(Math.random()).slice(2, 6).toUpperCase()}-${String(Math.random()).slice(2, 6).toUpperCase()}`
      )
      setOrder({
        id: Date.now(),
        userId: 1,
        status: 'completed',
        total: 45.97,
        createdAt: new Date().toISOString(),
        keys: mockKeys,
        orderItems: [
          { id: 1, orderId: 0, productId: 1, productName: 'Game Key 1', productImage: '', quantity: 1, price: 15.99 },
          { id: 2, orderId: 0, productId: 2, productName: 'Game Key 2', productImage: '', quantity: 1, price: 29.98 },
        ],
      } as Order)
    }
  }, [location.state])

  const copyKey = (key: string, index: number) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(index)
    toast('Key copied!', 'success')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (!order) return null

  return (
    <div className="confirmation">
      <div className="confirmation-icon">✓</div>
      <h1>Order Confirmed!</h1>
      <p className="order-id">Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>

      <div className="keys-section">
        <h3>🔑 Your Digital Keys</h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
          Save these keys — you can find them again in My Orders
        </p>
        {(order.keys || ['XXXX-XXXX-XXXX-XXXX', 'YYYY-YYYY-YYYY-YYYY']).map((key, i) => (
          <div key={i} className="key-item">
            <span>{key}</span>
            <button
              className="copy-btn"
              onClick={() => copyKey(key, i)}
            >
              {copiedKey === i ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn btn-secondary">View All Orders</Link>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '14px', maxWidth: '500px', marginInline: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
        {(order.orderItems || []).map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
            <span>{item.productName || `Product #${item.productId}`} × {item.quantity}</span>
            <span style={{ fontWeight: 600 }}>${(item.price || 0).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
          <span>Total</span>
          <span style={{ color: '#16a34a' }}>${(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage