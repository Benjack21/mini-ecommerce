import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import AdminPanel from './pages/AdminPanel'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import PaymentConfirm from './pages/PaymentConfirm'
import Wishlist from './pages/Wishlist'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-panel" element={
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/analytics" element={
          <ProtectedRoute adminOnly={true}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/payment/confirm" element={<PaymentConfirm />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App