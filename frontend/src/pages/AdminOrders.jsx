import React, { useEffect, useState } from 'react'
import { LayoutDashboard, Search, Eye, Trash2 } from 'lucide-react'
import { AdminNav } from './AdminDashboard.jsx'
import { getOrders, updateOrderStatus, deleteOrder } from '../services/api.js'
import Modal from '../components/Modal.jsx'
import Loading from '../components/Loading.jsx'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [viewTarget, setViewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getOrders()
      setOrders(res.data.results || res.data)
    } catch (err) {
      setError('Failed to load orders. Make sure you are logged in as an admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (order, status) => {
    setUpdatingId(order.id)
    try {
      await updateOrderStatus(order.id, status)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
    } catch (err) {
      setError('Failed to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteOrder(deleteTarget.id)
      setDeleteTarget(null)
      fetchOrders()
    } catch (err) {
      setError('Failed to delete order.')
    } finally {
      setDeleting(false)
    }
  }

  const filteredOrders = orders.filter(
    (o) =>
      String(o.id).includes(search) ||
      o.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard className="w-7 h-7 text-gaming-neon" />
        <h1 className="font-display font-bold text-4xl text-white">Order Management</h1>
      </div>
      <p className="text-gray-400 mb-8">Track and update customer orders.</p>

      <AdminNav />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID or username..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gaming-card border border-gaming-border focus:border-gaming-neon focus:outline-none text-white placeholder-gray-500 transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="glass border border-gaming-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Loading key={i} variant="row" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gaming-border text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gaming-border/50 hover:bg-gaming-surface/40 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-300">{o.username}</td>
                    <td className="px-4 py-3 text-gaming-neon font-semibold">${Number(o.total_price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 capitalize cursor-pointer focus:outline-none ${statusColors[o.status] || 'bg-gray-500/20 text-gray-400'}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-gaming-surface text-white">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewTarget(o)} className="p-1.5 rounded-lg hover:bg-gaming-surface text-gray-400 hover:text-gaming-neon2 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Order #${viewTarget?.id}`}>
        {viewTarget && (
          <div className="space-y-4 text-sm">
            <p><span className="text-gray-500">Customer:</span> <span className="text-white">{viewTarget.username}</span></p>
            <p><span className="text-gray-500">Status:</span> <span className="text-white capitalize">{viewTarget.status}</span></p>
            <p><span className="text-gray-500">Placed:</span> <span className="text-white">{new Date(viewTarget.created_at).toLocaleString()}</span></p>
            <p><span className="text-gray-500">Shipping Address:</span> <span className="text-white">{viewTarget.shipping_address || '—'}</span></p>
            <div className="pt-3 border-t border-gaming-border">
              <p className="text-gray-500 mb-2">Items</p>
              <div className="space-y-2">
                {viewTarget.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-300">
                    <span>{item.quantity} x {item.product_name}</span>
                    <span>${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-gaming-border flex justify-between font-semibold">
              <span className="text-white">Total</span>
              <span className="text-gaming-neon">${Number(viewTarget.total_price).toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Order" maxWidth="max-w-sm">
        <p className="text-gray-300 text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">Order #{deleteTarget?.id}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gaming-border text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60 hover:bg-red-500 transition-colors">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminOrders
