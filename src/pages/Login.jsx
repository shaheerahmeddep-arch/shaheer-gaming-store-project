import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Gamepad2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
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
        <h1 className="font-display font-bold text-3xl text-white text-center mb-2">Welcome Back</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Login to your Shaheer Gaming Store account</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Username or Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gaming-surface border border-gaming-border focus:border-gaming-neon focus:outline-none text-white transition-colors"
                placeholder="your_username"
              />
            </div>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white font-semibold disabled:opacity-60 hover:shadow-neon-purple transition-all"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-gaming-neon hover:underline font-medium">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
