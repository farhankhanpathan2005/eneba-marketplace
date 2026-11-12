import { useState } from 'react'

const CartPage = () => {
  // TODO: Connect to real cart data
  const [cartItems] = useState<any[]>([])
  const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)

  const handleRemoveItem = (_itemId: number) => {
    // TODO: Implement remove from cart
  }

  const handleUpdateQuantity = (_itemId: number, _newQuantity: number) => {
    // TODO: Implement update quantity
  }

  const handleCheckout = () => {
    // TODO: Implement checkout
  }

  if (cartItems.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '3rem 0' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#666', margin: '1rem 0' }}>Add some products to get started!</p>
        <a href="/products" className="btn btn-primary">Browse Products</a>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="section-title">Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {cartItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
              {item.image_url && <img src={item.image_url} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />}
              <div style={{ flex: 1 }}>
                <h3>{item.title}</h3>
                <p style={{ color: '#666' }}>{item.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' }}>
          <h2>Order Summary</h2>
          <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax</span>
              <span>${(total * 0.1).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.25rem', marginTop: '1rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
              <span>Total</span>
              <span>${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }} onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
