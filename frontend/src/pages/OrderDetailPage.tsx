import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchOrderById, getUser } from '../services/api'
import type { Order } from '../types'
import SkeletonGrid from '../components/layout/SkeletonGrid'
import { toast } from '../hooks/useToast'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    const user = getUser()
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrderById(Number(id))
      .then(data => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, navigate])

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast('Key copied!', 'success')
  }

  if (loading) return <SkeletonGrid count={1} />

  if (!order) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <h2>Order not found</h2>
        <p>The order you are looking for does not exist or you do not have access.</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    )
  }

  const statusColor = order.status === 'completed' ? '#16a34a' : order.status === 'pending' ? '#f59e0b' : '#ef4444'

  return (
    <div>
      <Link to="/orders" style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to orders
      </Link>

      <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order #{order.id}</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span style={{
            background: `${statusColor}20`,
            color: statusColor,
            padding: '0.35rem 0.75rem',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Digital Keys */}
      {order.keys && order.keys.length > 0 && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e0f0' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🔑 Your Digital Keys</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>Save these keys — they grant access to your purchased products.</p>
          {order.keys.map((key, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8f7ff', border: '1px solid #e5e0f0', borderRadius: '8px', marginBottom: '0.5rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }}>
              <span>{key}</span>
              <button onClick={() => copyKey(key)} style={{ background: 'none', border: 'none', color: '#7c4ddb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Copy</button>
            </div>
          ))}
        </div>
      )}

      {/* Order Items */}
      {order.orderItems && order.orderItems.length > 0 && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e0f0' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h2>
          {order.orderItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontSize: '0.9rem' }}>{item.productName || `Product #${item.productId}`} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
            <span>Total</span>
            <span style={{ color: '#16a34a' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage