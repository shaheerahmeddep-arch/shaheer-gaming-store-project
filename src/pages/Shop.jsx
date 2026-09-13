import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { getProducts } from '../services/api.js'
import ProductGrid from '../components/ProductGrid.jsx'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'rpg', label: 'RPG' },
  { value: 'shooter', label: 'Shooter' },
  { value: 'sports', label: 'Sports' },
  { value: 'racing', label: 'Racing' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'horror', label: 'Horror' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'consoles', label: 'Consoles' },
]

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name: A-Z' },
]

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const ordering = searchParams.get('ordering') || '-created_at'
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setSearchParams(next)
  }

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, ordering }
      if (search) params.search = search
      if (category) params.category = category
      if (minPrice) params.min_price = minPrice
      if (maxPrice) params.max_price = maxPrice

      const res = await getProducts(params)
      if (Array.isArray(res.data)) {
        setProducts(res.data)
        setCount(res.data.length)
      } else {
        setProducts(res.data.results || [])
        setCount(res.data.count || 0)
      }
    } catch (err) {
      setError('Failed to load products. Please make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }, [search, category, ordering, minPrice, maxPrice, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">
          The <span className="text-gradient">Shop</span>
        </h1>
        <p className="text-gray-400">Browse our full catalog of games, consoles, and accessories.</p>
      </div>

      {/* Search + toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('search', e.currentTarget.value)
            }}
            onBlur={(e) => updateParam('search', e.currentTarget.value)}
            placeholder="Search for games, accessories..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gaming-card border border-gaming-border focus:border-gaming-neon focus:outline-none text-white placeholder-gray-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gaming-border glass hover:border-gaming-neon2/60 text-white transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <select
          value={ordering}
          onChange={(e) => updateParam('ordering', e.target.value)}
          className="px-4 py-3 rounded-lg bg-gaming-card border border-gaming-border focus:border-gaming-neon focus:outline-none text-white transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass border border-gaming-border rounded-xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Min Price</label>
            <input
              type="number"
              min="0"
              defaultValue={minPrice}
              onBlur={(e) => updateParam('min_price', e.currentTarget.value)}
              placeholder="$0"
              className="w-full px-3 py-2 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Max Price</label>
            <input
              type="number"
              min="0"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam('max_price', e.currentTarget.value)}
              placeholder="$500"
              className="w-full px-3 py-2 rounded-lg bg-gaming-surface border border-gaming-border text-white focus:border-gaming-neon focus:outline-none"
            />
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">{loading ? 'Loading...' : `${count} product${count !== 1 ? 's' : ''} found`}</p>

      <ProductGrid products={products} loading={loading} error={error} />

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gaming-border disabled:opacity-30 hover:border-gaming-neon/60 text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-400 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gaming-border disabled:opacity-30 hover:border-gaming-neon/60 text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Shop
