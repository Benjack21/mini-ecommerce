import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import AdminPanel from './pages/AdminPanel'
// [FASE 1.2] Se eliminó el import de ProtectedRoute: era código muerto.
// App.jsx lo importaba pero NUNCA lo usaba (solo usaba PrivateRoute).
// Existían 2 guards casi idénticos (PrivateRoute y ProtectedRoute);
// nos quedamos con PrivateRoute que es el que realmente protege rutas.
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import PaymentConfirm from './pages/PaymentConfirm'
import Wishlist from './pages/Wishlist'
import Notifications from './pages/Notifications'
import SupportChat from './components/SupportChat'
import PrivateRoute from './components/PrivateRoute'
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={
          <PrivateRoute><Cart /></PrivateRoute>
        } />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
        {/* [FASE 1.8] ANTES era "// Rutas..." (comentario JS). Dentro de JSX
            eso NO es un comentario: se renderiza como TEXTO VISIBLE en la página.
            La sintaxis correcta es el comentario de multilinea de JSX. */}
        <Route path="/admin-panel" element={
          <PrivateRoute adminOnly><AdminPanel /></PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
        <Route path="/orders" element={
          <PrivateRoute><Orders /></PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute adminOnly><Analytics /></PrivateRoute>
        } />
        <Route path="/payment/confirm" element={<PaymentConfirm />} />
        <Route path="/wishlist" element={
          <PrivateRoute><Wishlist /></PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute><Notifications /></PrivateRoute>
        } />
      </Routes>
      <SupportChat />
    </BrowserRouter>
  )
}

export default App