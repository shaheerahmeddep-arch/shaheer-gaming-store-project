import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, Eye, X, Gamepad2,
  ChevronLeft, ChevronRight, LayoutDashboard,
} from 'lucide-react'
import { AdminNav } from './AdminDashboard.jsx'
import { getProducts, createProduct, updateProduct, deleteProduct, resolveMediaUrl } from '../services/api.js'
import Modal from '../components/Modal.jsx'
import Loading from '../components/Loading.jsx'

const ThumbImage = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false)
  const resolved = !imgError ? resolveMediaUrl(src) : null
  if (!resolved) return <Gamepad2 className="w-5 h-5 text-gaming-border" />
  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      onError={() => setImgError(true)}
      className="w-full h-full object-cover"
    />
  )
}

const CATEGORY_CHOICES = ['action', 'adventure', 'rpg', 'shooter', 'sports', 'racing', 'strategy', 'horror', 'accessories', 'consoles']
const PLATFORM_CHOICES = ['pc', 'ps5', 'ps4', 'xbox', 'switch', 'multi']

const emptyForm = {
  name: '', description: '', price: '', category: 'action', brand: '',
  platform: 'pc', stock: '', rating: '0', featured: false, image: null,
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [viewTarget, setViewTarget] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page }
      if (search) params.search = search
      const res = await getProducts(params)
      setProducts(res.data.results || res.data)
      setCount(res.data.count ?? (res.data.results || res.data).length)
    } catch (err) {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      platform: product.platform,
      stock: product.stock,
      rating: product.rating,
      featured: product.featured,
      image: null,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleFormChange = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('price', form.price)
    fd.append('category', form.category)
    fd.append('brand', form.brand)
    fd.append('platform', form.platform)
    fd.append('stock', form.stock)
    fd.append('rating', form.rating)
    fd.append('featured', form.featured)
    if (form.image) fd.append('image', form.image)
    return fd
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const fd = buildFormData()
      if (editingProduct) {
        await updateProduct(editingProduct.id, fd)
      } else {
        await createProduct(fd)
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      const data = err.response?.data
      setFormError(
        data && typeof data === 'object'
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
          : 'Failed to save product.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
      fetchProducts()
    } catch (err) {
      setError('Failed to delete product.')
    } finally {
      setDeleting(false)
    }
  }

  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard className="w-7 h-7 text-gaming-neon" />
        <h1 className="font-display font-bold text-4xl text-white">Product Management</h1>
      </div>
      <p className="text-gray-400 mb-8">Full CRUD control over your store's product catalog.</p>

      <AdminNav />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gaming-card border border-gaming-border focus:border-gaming-neon focus:outline-none text-white placeholder-gray-500 transition-colors"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold hover:shadow-neon-purple transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="glass border border-gaming-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Loading key={i} variant="row" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gaming-border text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gaming-border/50 hover:bg-gaming-surface/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gaming-surface flex items-center justify-center">
                        <ThumbImage src={p.image_url || p.image} alt={p.name} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-gaming-neon font-semibold">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-300">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.in_stock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewTarget(p)} className="p-1.5 rounded-lg hover:bg-gaming-surface text-gray-400 hover:text-gaming-neon2 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg hover:bg-gaming-surface text-gray-400 hover:text-gaming-neon transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
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

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg border border-gaming-border disabled:opacity-30 hover:border-gaming-neon/60 text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-400 px-3">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg border border-gaming-border disabled:opacity-30 hover:border-gaming-neon/60 text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{formError}</div>}

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Product Name</label>
            <input required type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => handleFormChange('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Price ($)</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => handleFormChange('price', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Stock</label>
              <input required type="number" min="0" value={form.stock} onChange={(e) => handleFormChange('stock', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none">
                {CATEGORY_CHOICES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Platform</label>
              <select value={form.platform} onChange={(e) => handleFormChange('platform', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none">
                {PLATFORM_CHOICES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Brand</label>
              <input required type="text" value={form.brand} onChange={(e) => handleFormChange('brand', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => handleFormChange('rating', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">Product Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleFormChange('image', e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gaming-accent/30 file:text-gaming-neon file:font-semibold hover:file:bg-gaming-accent/50" />
            {editingProduct && <p className="text-xs text-gray-500 mt-1">Leave empty to keep the current image.</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.featured} onChange={(e) => handleFormChange('featured', e.target.checked)}
              className="w-4 h-4 rounded accent-gaming-neon2" />
            Featured Product
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gaming-border text-gray-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold disabled:opacity-60 hover:shadow-neon-purple transition-all">
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Product Details">
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-gaming-surface flex items-center justify-center mb-4">
              <ThumbImage src={viewTarget.image_url || viewTarget.image} alt={viewTarget.name} />
            </div>
            <p><span className="text-gray-500">Name:</span> <span className="text-white">{viewTarget.name}</span></p>
            <p><span className="text-gray-500">Description:</span> <span className="text-white">{viewTarget.description}</span></p>
            <p><span className="text-gray-500">Price:</span> <span className="text-gaming-neon">${Number(viewTarget.price).toFixed(2)}</span></p>
            <p><span className="text-gray-500">Category:</span> <span className="text-white capitalize">{viewTarget.category}</span></p>
            <p><span className="text-gray-500">Brand:</span> <span className="text-white">{viewTarget.brand}</span></p>
            <p><span className="text-gray-500">Platform:</span> <span className="text-white capitalize">{viewTarget.platform}</span></p>
            <p><span className="text-gray-500">Stock:</span> <span className="text-white">{viewTarget.stock}</span></p>
            <p><span className="text-gray-500">Rating:</span> <span className="text-white">{viewTarget.rating} / 5</span></p>
            <p><span className="text-gray-500">Featured:</span> <span className="text-white">{viewTarget.featured ? 'Yes' : 'No'}</span></p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" maxWidth="max-w-sm">
        <p className="text-gray-300 text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">{deleteTarget?.name}</span>? This action cannot be undone.
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

export default AdminProducts
