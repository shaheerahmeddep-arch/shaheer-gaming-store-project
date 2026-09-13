import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminRoute from './routes/AdminRoute.jsx'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminOrders from './pages/AdminOrders.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gaming-bg bg-grid">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

const NotFound = () => (
  <div className="max-w-7xl mx-auto px-4 py-32 text-center">
    <h1 className="text-6xl font-display font-bold text-gradient mb-4">404</h1>
    <p className="text-gray-400">The page you're looking for doesn't exist.</p>
  </div>
)

export default App
