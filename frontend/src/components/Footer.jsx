import React from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Twitter, Instagram, Youtube, Twitch } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-gaming-border bg-gaming-surface/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-7 h-7 text-gaming-neon" />
              <span className="font-display font-bold text-lg text-white">
                SHAHEER <span className="text-gradient">GAMING</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your premium destination for the latest games, consoles, and gear.
              Level up your setup with Shaheer Gaming Store.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3 tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-gaming-neon transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=action" className="hover:text-gaming-neon transition-colors">Action Games</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-gaming-neon transition-colors">Accessories</Link></li>
              <li><Link to="/shop?category=consoles" className="hover:text-gaming-neon transition-colors">Consoles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3 tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-gaming-neon transition-colors">My Dashboard</Link></li>
              <li><Link to="/cart" className="hover:text-gaming-neon transition-colors">My Cart</Link></li>
              <li><Link to="/login" className="hover:text-gaming-neon transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-gaming-neon transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3 tracking-wide">Follow Us</h4>
            <div className="flex gap-3">
              {[Twitter, Instagram, Youtube, Twitch].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg border border-gaming-border hover:border-gaming-neon/50 hover:shadow-neon transition-all text-gray-300 hover:text-gaming-neon"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gaming-border text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Shaheer Gaming Store. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
