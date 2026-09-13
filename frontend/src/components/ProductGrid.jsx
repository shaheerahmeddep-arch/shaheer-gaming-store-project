import React from 'react'
import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import Loading from './Loading.jsx'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Loading key={i} variant="card" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <PackageSearch className="w-14 h-14 text-gaming-border mb-4" />
        <h3 className="text-xl font-display font-semibold text-white mb-1">No products found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ProductGrid
