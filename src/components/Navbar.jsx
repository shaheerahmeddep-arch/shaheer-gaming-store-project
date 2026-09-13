import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `relative px-1 py-1 text-sm font-medium tracking-wide transition-colors ${
      isActive ? 'text-gaming-neon' : 'text-gray-300 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 glass border-b border-gaming-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="w-8 h-8 text-gaming-neon group-hover:text-gaming-neon2 transition-colors" />
              <div className="absolute inset-0 blur-md bg-gaming-neon/40 group-hover:bg-gaming-neon2/40 transition-colors" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              SHAHEER <span className="text-gradient">GAMING</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 rounded-lg border border-gaming-border hover:border-gaming-neon/50 hover:shadow-neon transition-all"
            >
              <ShoppingCart className="w-5 h-5 text-gray-200" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gaming-neon3 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-neon-pink">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gaming-border hover:border-gaming-neon2/50 text-sm text-gray-200 hover:text-white transition-all"
                >
                  <User className="w-4 h-4" />
                  {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg border border-gaming-border hover:border-gaming-neon3/50 text-gray-300 hover:text-gaming-neon3 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white text-sm font-semibold hover:shadow-neon-purple transition-all"
              >
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden text-gray-200" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gaming-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block text-gray-200 hover:text-gaming-neon py-1"
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 text-gray-200 py-1">
                <ShoppingCart className="w-4 h-4" /> Cart ({totalItems})
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 text-gray-200 py-1">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 text-gray-200 py-1">
                    <User className="w-4 h-4" /> {user?.username}
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center gap-2 text-gaming-neon3 py-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-gaming-accent to-gaming-neon2 text-white text-sm font-semibold"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
