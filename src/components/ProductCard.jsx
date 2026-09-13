import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Eye, Gamepad2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative rounded-xl overflow-hidden border border-gaming-border bg-gaming-card hover:border-gaming-neon/60 hover:shadow-neon transition-colors flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-gaming-surface overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gaming-surface to-gaming-card">
              <Gamepad2 className="w-16 h-16 text-gaming-border" />
            </div>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gaming-neon2/90 text-white shadow-neon-purple">
              Featured
            </span>
          )}
          {!product.in_stock && (
            <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-red-600/90 text-white">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] uppercase tracking-wider text-gaming-neon2 font-semibold mb-1">
          {product.category_display || product.category}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-white text-lg leading-snug mb-1 hover:text-gaming-neon transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{product.description}</p>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(Number(product.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-display font-bold text-gaming-neon">${Number(product.price).toFixed(2)}</span>
          <div className="flex gap-2">
            <Link
              to={`/product/${product.id}`}
              className="p-2 rounded-lg border border-gaming-border hover:border-gaming-neon2/60 text-gray-300 hover:text-gaming-neon2 transition-all"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className="p-2 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-neon-purple transition-all"
              title="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
