import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOrders, getUser } from '../services/api'
import type { Order } from '../types'
import SkeletonGrid from '../components/layout/SkeletonGrid'

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const user = getUser()

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    fetchOrders()
      .then(data => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#16a34a'
      case 'pending': return '#f59e0b'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) return <SkeletonGrid count={3} />

  return (
    <div>
      <h1 className="section-title" style={{ marginTop: '1.5rem' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders. Start shopping!</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>Order #{order.id}</span>
                  <span style={{
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status),
                    padding: '0.2rem 0.6rem',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {order.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                  {' '}• {' '}
                  {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                </p>
                {order.keys && order.keys.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {order.keys.slice(0, 2).map((key, i) => (
                      <code key={i} style={{ fontSize: '0.8rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {key}
                      </code>
                    ))}
                    {order.keys.length > 2 && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>+{order.keys.length - 2} more keys</span>}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                  ${order.total.toFixed(2)}
                </div>
                <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistoryPage