import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Package, Heart, ShoppingCart, LogOut, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getOrders, updateMe } from '../services/api.js'
import Loading from '../components/Loading.jsx'

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'cart', label: 'My Cart', icon: ShoppingCart },
]

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const UserDashboard = () => {
  const { user, logout, refreshUser } = useAuth()
  const { items, totalPrice } = useCart()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true)
      getOrders()
        .then((res) => setOrders(res.data.results || res.data))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [tab])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await updateMe(profileForm)
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display font-bold text-4xl text-white mb-8">
        My <span className="text-gradient">Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="glass border border-gaming-border rounded-xl p-4 h-fit">
          <div className="flex items-center gap-3 p-3 mb-4 border-b border-gaming-border pb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gaming-accent to-gaming-neon2 flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key ? 'bg-gaming-accent/20 text-gaming-neon' : 'text-gray-400 hover:text-white hover:bg-gaming-surface'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gaming-neon3 hover:bg-gaming-surface transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass border border-gaming-border rounded-xl p-6">
              <h2 className="font-display font-semibold text-xl text-white mb-6">Profile Information</h2>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Address</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold disabled:opacity-60 hover:shadow-neon-purple transition-all"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          )}

          {tab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass border border-gaming-border rounded-xl p-6">
              <h2 className="font-display font-semibold text-xl text-white mb-6">My Orders</h2>
              {ordersLoading ? (
                <Loading />
              ) : orders.length === 0 ? (
                <p className="text-gray-400 text-sm">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gaming-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gaming-surface transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-white font-semibold text-sm">Order #{order.id}</p>
                          <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {order.status}
                          </span>
                          <span className="text-gaming-neon font-semibold text-sm">${Number(order.total_price).toFixed(2)}</span>
                          {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {expandedOrder === order.id && (
                        <div className="p-4 border-t border-gaming-border bg-gaming-surface/40 space-y-2">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-gray-300">
                              <span>{item.quantity} x {item.product_name}</span>
                              <span>${Number(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'cart' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass border border-gaming-border rounded-xl p-6">
              <h2 className="font-display font-semibold text-xl text-white mb-6">My Cart</h2>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-4">Your cart is empty.</p>
                  <Link to="/shop" className="text-gaming-neon hover:underline text-sm">Start shopping</Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-300">
                        <span>{item.quantity} x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gaming-border pt-4 flex justify-between items-center">
                    <span className="text-white font-semibold">Total: ${totalPrice.toFixed(2)}</span>
                    <Link to="/cart" className="px-4 py-2 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white text-sm font-semibold hover:shadow-neon-purple transition-all">
                      Go to Cart
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
