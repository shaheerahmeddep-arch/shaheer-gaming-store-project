import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ShoppingBag, Gamepad2, Truck, ShieldCheck, Headphones, ArrowRight } from 'lucide-react'
import { getProducts } from '../services/api.js'
import ProductGrid from '../components/ProductGrid.jsx'

const categories = [
  { key: 'action', label: 'Action', emoji: '⚔️' },
  { key: 'rpg', label: 'RPG', emoji: '🛡️' },
  { key: 'shooter', label: 'Shooter', emoji: '🎯' },
  { key: 'racing', label: 'Racing', emoji: '🏎️' },
  { key: 'strategy', label: 'Strategy', emoji: '♟️' },
  { key: 'horror', label: 'Horror', emoji: '👻' },
  { key: 'accessories', label: 'Accessories', emoji: '🎧' },
  { key: 'consoles', label: 'Consoles', emoji: '🎮' },
]

const Home = () => {
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [featuredRes, latestRes] = await Promise.all([
          getProducts({ featured: true, page_size: 8 }),
          getProducts({ ordering: '-created_at', page_size: 8 }),
        ])
        setFeatured(featuredRes.data.results || featuredRes.data)
        setLatest(latestRes.data.results || latestRes.data)
      } catch (err) {
        setError('Unable to load products from the server.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gaming-accent/20 via-transparent to-transparent" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gaming-neon2/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-gaming-neon/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-gaming-neon tracking-wider uppercase mb-6"
          >
            <Zap className="w-3.5 h-3.5" /> Welcome to Shaheer Gaming Store
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight text-white mb-6"
          >
            Level Up Your <span className="text-gradient">Gaming</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Discover the latest games, premium accessories, and next-gen consoles.
            Built for gamers, powered by performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/shop"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold hover:shadow-neon-purple transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/shop"
              className="flex items-center gap-2 px-8 py-3.5 rounded-lg border border-gaming-border glass text-white font-semibold hover:border-gaming-neon/60 hover:shadow-neon transition-all"
            >
              <Gamepad2 className="w-5 h-5" />
              Explore Games
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Quick shipping worldwide' },
            { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Your data stays protected' },
            { icon: Headphones, title: '24/7 Support', desc: "We're always here to help" },
          ].map((f, i) => (
            <div key={i} className="glass rounded-xl border border-gaming-border p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gaming-accent/20 text-gaming-neon">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white">{f.title}</h4>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="font-display font-bold text-3xl text-white mb-8">
          Browse <span className="text-gradient">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/shop?category=${cat.key}`}
              className="group rounded-xl border border-gaming-border bg-gaming-card p-6 text-center hover:border-gaming-neon/60 hover:shadow-neon transition-all"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</div>
              <p className="font-display font-semibold text-white text-sm tracking-wide">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-white">
            Featured <span className="text-gradient">Products</span>
          </h2>
          <Link to="/shop" className="text-sm text-gaming-neon hover:text-gaming-neon2 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} error={error} />
      </section>

      {/* LATEST PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-white">
            Latest <span className="text-gradient">Arrivals</span>
          </h2>
          <Link to="/shop" className="text-sm text-gaming-neon hover:text-gaming-neon2 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={latest} loading={loading} error={error} />
      </section>
    </div>
  )
}

export default Home
