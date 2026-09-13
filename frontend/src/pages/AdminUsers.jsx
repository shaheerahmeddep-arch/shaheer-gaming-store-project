import React, { useEffect, useState } from 'react'
import { LayoutDashboard, Search, Eye, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react'
import { AdminNav } from './AdminDashboard.jsx'
import { getUsers, deleteUser, getOrders } from '../services/api.js'
import Modal from '../components/Modal.jsx'
import Loading from '../components/Loading.jsx'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [viewTarget, setViewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, ordersRes] = await Promise.all([getUsers(), getOrders()])
      setUsers(usersRes.data.results || usersRes.data)
      setOrders(ordersRes.data.results || ordersRes.data)
    } catch (err) {
      setError('Failed to load users. Make sure you are logged in as an admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      setError('Failed to delete user.')
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const userOrders = (userId) => orders.filter((o) => o.user === userId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard className="w-7 h-7 text-gaming-neon" />
        <h1 className="font-display font-bold text-4xl text-white">User Management</h1>
      </div>
      <p className="text-gray-400 mb-8">View and manage registered users.</p>

      <AdminNav />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gaming-card border border-gaming-border focus:border-gaming-neon focus:outline-none text-white placeholder-gray-500 transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="glass border border-gaming-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Loading key={i} variant="row" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gaming-border text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gaming-border/50 hover:bg-gaming-surface/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gaming-accent to-gaming-neon2 flex items-center justify-center text-white text-xs font-bold">
                          {u.username[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.is_staff ? (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gaming-neon2/20 text-gaming-neon2 w-fit">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 w-fit">
                          <UserIcon className="w-3 h-3" /> Customer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{userOrders(u.id).length}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewTarget(u)} className="p-1.5 rounded-lg hover:bg-gaming-surface text-gray-400 hover:text-gaming-neon2 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!u.is_staff && (
                          <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="User Details">
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Username:</span> <span className="text-white">{viewTarget.username}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="text-white">{viewTarget.email}</span></p>
            <p><span className="text-gray-500">Name:</span> <span className="text-white">{viewTarget.first_name} {viewTarget.last_name}</span></p>
            <p><span className="text-gray-500">Phone:</span> <span className="text-white">{viewTarget.phone || '—'}</span></p>
            <p><span className="text-gray-500">Address:</span> <span className="text-white">{viewTarget.address || '—'}</span></p>
            <p><span className="text-gray-500">Joined:</span> <span className="text-white">{new Date(viewTarget.date_joined).toLocaleString()}</span></p>
            <div className="pt-3 border-t border-gaming-border">
              <p className="text-gray-500 mb-2">Order History ({userOrders(viewTarget.id).length})</p>
              {userOrders(viewTarget.id).length === 0 ? (
                <p className="text-gray-500 text-xs">No orders placed.</p>
              ) : (
                <div className="space-y-2">
                  {userOrders(viewTarget.id).map((o) => (
                    <div key={o.id} className="flex justify-between text-xs text-gray-300">
                      <span>Order #{o.id} · {o.status}</span>
                      <span>${Number(o.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" maxWidth="max-w-sm">
        <p className="text-gray-300 text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">{deleteTarget?.username}</span>? This action cannot be undone.
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

export default AdminUsers
