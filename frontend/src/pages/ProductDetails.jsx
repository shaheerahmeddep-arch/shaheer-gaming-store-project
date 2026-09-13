import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Gamepad2, CheckCircle2, XCircle } from 'lucide-react'
import { getProduct, getProducts } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import Loading from '../components/Loading.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      setAdded(false)
      setQuantity(1)
      try {
        const res = await getProduct(id)
        setProduct(res.data)
        const relatedRes = await getProducts({ category: res.data.category, page_size: 4 })
        const relatedList = (relatedRes.data.results || relatedRes.data).filter((p) => p.id !== res.data.id)
        setRelated(relatedList)
      } catch (err) {
        setError('Product not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) return <Loading />

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-red-400 mb-4">{error || 'Product not found.'}</p>
        <Link to="/shop" className="text-gaming-neon hover:underline">Back to shop</Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gaming-neon mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl overflow-hidden border border-gaming-border bg-gaming-card aspect-square flex items-center justify-center"
        >
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Gamepad2 className="w-32 h-32 text-gaming-border" />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <span className="inline-block text-xs uppercase tracking-wider font-semibold text-gaming-neon2 mb-2">
            {product.category_display || product.category}
          </span>
          <h1 className="font-display font-bold text-4xl text-white mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(Number(product.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
              />
            ))}
            <span className="text-sm text-gray-500">({product.rating} / 5)</span>
          </div>

          <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-lg border border-gaming-border p-3">
              <p className="text-xs text-gray-500 mb-1">Brand</p>
              <p className="text-sm text-white font-medium">{product.brand}</p>
            </div>
            <div className="glass rounded-lg border border-gaming-border p-3">
              <p className="text-xs text-gray-500 mb-1">Platform</p>
              <p className="text-sm text-white font-medium">{product.platform_display || product.platform}</p>
            </div>
            <div className="glass rounded-lg border border-gaming-border p-3">
              <p className="text-xs text-gray-500 mb-1">Stock</p>
              <p className={`text-sm font-medium flex items-center gap-1 ${product.in_stock ? 'text-green-400' : 'text-red-400'}`}>
                {product.in_stock ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {product.in_stock ? `${product.stock} available` : 'Out of stock'}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-display font-bold text-gaming-neon">${Number(product.price).toFixed(2)}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center border border-gaming-border rounded-lg overflow-hidden w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-gaming-surface text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 text-white font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                className="p-3 hover:bg-gaming-surface text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-neon-purple transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display font-bold text-3xl text-white mb-8">
            Related <span className="text-gradient">Products</span>
          </h2>
          <ProductGrid products={related} loading={false} error={null} />
        </div>
      )}
    </div>
  )
}

export default ProductDetails
