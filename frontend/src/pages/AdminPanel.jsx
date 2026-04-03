import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function AdminPanel() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '', category: '' })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchProducts = () => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => setProducts(res.data))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSave = async () => {
    if (editingId) {
      await axios.put(`http://127.0.0.1:8000/api/products/${editingId}/`, form, { headers })
    } else {
      await axios.post('http://127.0.0.1:8000/api/products/', form, { headers })
    }
    setForm({ name: '', description: '', price: '', stock: '', image_url: '', category: '' })
    setEditingId(null)
    setShowForm(false)
    fetchProducts()
  }

  const handleEdit = (product) => {
    setForm(product)
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`, { headers })
    fetchProducts()
  }

  const handleCancel = () => {
    setForm({ name: '', description: '', price: '', stock: '', image_url: '', category: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const navigate = useNavigate()

  const [imageUrl, setImageUrl] = useState('')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [productImages, setProductImages] = useState([])

  const fetchImages = async (productId) => {
  const res = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/`)
    setProductImages(res.data.images || [])
    setSelectedProductId(productId)
  }

  const addImage = async () => {
    if (!imageUrl) return
    await axios.post(`http://127.0.0.1:8000/api/products/${selectedProductId}/images/`,
      { url: imageUrl },
      { headers }
    )
    setImageUrl('')
    fetchImages(selectedProductId)
  }

  const deleteImage = async (imageId) => {
    await axios.delete(`http://127.0.0.1:8000/api/products/${selectedProductId}/images/`,
      { data: { image_id: imageId }, headers }
    )
    fetchImages(selectedProductId)
  }

  const updateImage = async (imageId, newUrl) => {
    await axios.patch(`http://127.0.0.1:8000/api/products/${selectedProductId}/images/`,
      { image_id: imageId, url: newUrl },
      { headers }
    )
    fetchImages(selectedProductId)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/analytics')}
              className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              📊 Ver analytics
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                + Nuevo producto
              </button>
            )}
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Nombre"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
              <input
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Precio"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
              />
              <input
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Stock"
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
              />
              <input
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="ID de categoría"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              />
              <input
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 sm:col-span-2"
                placeholder="URL de imagen"
                value={form.image_url}
                onChange={e => setForm({...form, image_url: e.target.value})}
              />
              <textarea
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 sm:col-span-2"
                placeholder="Descripción"
                rows={3}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                {editingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button
                onClick={handleCancel}
                className="border border-gray-200 text-gray-500 px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {/*panel de imagenes*/}
        {selectedProductId && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">
                Imágenes del producto #{selectedProductId}
              </h2>
              <button
                onClick={() => setSelectedProductId(null)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {productImages.map(img => (
                <div key={img.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                  <img src={img.url} alt="extra" className="w-16 h-16 object-cover rounded-xl shrink-0" />
                  <input
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    defaultValue={img.url}
                    onBlur={e => {
                      if (e.target.value !== img.url) {
                        updateImage(img.id, e.target.value)
                      }
                    }}
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="text-red-400 hover:text-red-600 border border-red-200 px-3 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors shrink-0"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 border-t border-gray-100 pt-4">
              <input
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="URL de imagen extra"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
              />
              <button
                onClick={addImage}
                className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        )}
        {/* Lista de productos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-sm">No hay productos aún</p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  index !== products.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">${product.price} — Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchImages(product.id)}
                    className="text-sm border border-gray-200 px-4 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    🖼️ Imágenes
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-sm border border-gray-200 px-4 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-sm border border-red-200 text-red-400 px-4 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminPanel