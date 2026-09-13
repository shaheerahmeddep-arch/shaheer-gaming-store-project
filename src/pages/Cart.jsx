import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingCart, Gamepad2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { createOrder, resolveMediaUrl } from '../services/api.js'

const CartItemImage = ({ item }) => {
  const [imgError, setImgError] = useState(false)
  const src = !imgError ? resolveMediaUrl(item.image_url) : null
  if (!src) return <Gamepad2 className="w-8 h-8 text-gaming-border" />
  return (
    <img
      src={src}
      alt={item.name}
      loading="lazy"
      onError={() => setImgError(true)}
      className="w-full h-full object-cover"
    />
  )
}

const Cart = () => {
  const { items, increaseQuantity, decreaseQuantity, removeFromCart, totalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setCheckingOut(true)
    setError(null)
    try {
      await createOrder({
        shipping_address: '',
        items: items.map((i) => ({ product: i.id, quantity: i.quantity })),
      })
      clearCart()
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">Order Placed!</h1>
        <p className="text-gray-400 mb-8">Your order has been submitted successfully.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="px-6 py-3 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold hover:shadow-neon-purple transition-all">
            View My Orders
          </Link>
          <Link to="/shop" className="px-6 py-3 rounded-lg border border-gaming-border text-white font-semibold hover:border-gaming-neon/60 transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <ShoppingCart className="w-16 h-16 text-gaming-border mx-auto mb-6" />
        <h1 className="font-display font-bold text-3xl text-white mb-3">Your cart is empty</h1>
        <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold hover:shadow-neon-purple transition-all">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display font-bold text-4xl text-white mb-8">
        Your <span className="text-gradient">Cart</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 glass border border-gaming-border rounded-xl p-4"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gaming-surface flex-shrink-0 flex items-center justify-center">
                <CartItemImage item={item} />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.id}`} className="font-display font-semibold text-white hover:text-gaming-neon transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-gaming-neon font-semibold mt-1">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center border border-gaming-border rounded-lg overflow-hidden">
                <button onClick={() => decreaseQuantity(item.id)} className="p-2 hover:bg-gaming-surface text-white transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-white text-sm font-semibold">{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.id)} className="p-2 hover:bg-gaming-surface text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="glass border border-gaming-border rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-xl text-white mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="border-t border-gaming-border pt-4 mb-6 flex justify-between">
            <span className="font-display font-semibold text-white">Total</span>
            <span className="font-display font-bold text-xl text-gaming-neon">${totalPrice.toFixed(2)}</span>
          </div>
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold disabled:opacity-60 hover:shadow-neon-purple transition-all"
          >
            {checkingOut ? 'Processing...' : isAuthenticated ? 'Checkout' : 'Login to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
