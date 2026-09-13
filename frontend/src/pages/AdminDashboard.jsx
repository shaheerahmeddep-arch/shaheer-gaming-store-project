import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Users, ShoppingBag, DollarSign, LayoutDashboard, ArrowRight } from 'lucide-react'
import { getProducts, getUsers, getOrders } from '../services/api.js'
import Loading from '../components/Loading.jsx'

export const AdminNav = () => (
  <div className="flex flex-wrap gap-2 mb-8">
    {[
      { to: '/admin', label: 'Overview' },
      { to: '/admin/products', label: 'Products' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/orders', label: 'Orders' },
    ].map((l) => (
      <Link
        key={l.to}
        to={l.to}
        className="px-4 py-2 rounded-lg border border-gaming-border glass text-sm text-gray-300 hover:text-gaming-neon hover:border-gaming-neon/60 transition-all"
      >
        {l.label}
      </Link>
    ))}
  </div>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, revenue: 0 })
  const [recentProducts, setRecentProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          getProducts({ page_size: 5, ordering: '-created_at' }),
          getUsers(),
          getOrders(),
        ])

        const products = productsRes.data.results || productsRes.data
        const productCount = productsRes.data.count ?? products.length
        const users = usersRes.data.results || usersRes.data
        const orders = ordersRes.data.results || ordersRes.data
        const revenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)

        setStats({
          products: productCount,
          users: users.length,
          orders: orders.length,
          revenue,
        })
        setRecentProducts(products.slice(0, 5))
        setRecentOrders(orders.slice(0, 5))
      } catch (err) {
        // silently handled by empty states
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const cards = [
    { icon: Package, label: 'Total Products', value: stats.products, color: 'text-gaming-neon' },
    { icon: Users, label: 'Total Users', value: stats.users, color: 'text-gaming-neon2' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, color: 'text-gaming-neon3' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'text-green-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard className="w-7 h-7 text-gaming-neon" />
        <h1 className="font-display font-bold text-4xl text-white">Admin Dashboard</h1>
      </div>
      <p className="text-gray-400 mb-8">Manage your store's products, users, and orders.</p>

      <AdminNav />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {cards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass border border-gaming-border rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <c.icon className={`w-6 h-6 ${c.color}`} />
                </div>
                <p className="text-2xl font-display font-bold text-white">{c.value}</p>
                <p className="text-xs text-gray-500 mt-1">{c.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass border border-gaming-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg text-white">Recent Products</h2>
                <Link to="/admin/products" className="text-xs text-gaming-neon hover:underline flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No products yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 truncate">{p.name}</span>
                      <span className="text-gaming-neon font-medium">${Number(p.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass border border-gaming-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg text-white">Recent Orders</h2>
                <Link to="/admin/orders" className="text-xs text-gaming-neon hover:underline flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-sm">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Order #{o.id} - {o.username}</span>
                      <span className="text-gaming-neon font-medium">${Number(o.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
