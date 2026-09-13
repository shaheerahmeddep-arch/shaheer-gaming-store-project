import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, Gamepad2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const flat = {}
        Object.entries(data).forEach(([key, val]) => {
          flat[key] = Array.isArray(val) ? val.join(' ') : String(val)
        })
        setErrors(flat)
      } else {
        setErrors({ general: 'Registration failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-gaming-border rounded-2xl p-8 shadow-neon-purple"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 rounded-full bg-gaming-accent/20 text-gaming-neon">
            <Gamepad2 className="w-8 h-8" />
          </div>
        </div>
        <h1 className="font-display font-bold text-3xl text-white text-center mb-2">Create Account</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Join Shaheer Gaming Store today</p>

        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gaming-surface border border-gaming-border focus:border-gaming-neon focus:outline-none text-white transition-colors"
                placeholder="your_username"
              />
            </div>
            {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gaming-surface border border-gaming-border focus:border-gaming-neon focus:outline-none text-white transition-colors"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gaming-surface border border-gaming-border focus:border-gaming-neon focus:outline-none text-white transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gaming-surface border border-gaming-border focus:border-gaming-neon focus:outline-none text-white transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.confirm_password && <p className="text-xs text-red-400 mt-1">{errors.confirm_password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold disabled:opacity-60 hover:shadow-neon-purple transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gaming-neon hover:underline font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register
