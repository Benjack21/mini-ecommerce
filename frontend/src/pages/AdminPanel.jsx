import { useEffect, useState } from 'react'
import axios from 'axios'
/*import { useNavigate } from 'react-router-dom'*/

function AdminPanel() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '', category: '' })
  const [editingId, setEditingId] = useState(null)
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
    fetchProducts()
  }

  const handleEdit = (product) => {
    setForm(product)
    setEditingId(product.id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`, { headers })
    fetchProducts()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ Panel de Administración</h1>

      {/* Formulario */}
      <div className="border rounded-lg p-4 mb-8 shadow-sm">
        <h2 className="font-semibold text-lg mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Nombre"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Precio"
            value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Stock"
            value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="URL de imagen"
            value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="ID de categoría"
            value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          <textarea className="border rounded px-3 py-2 sm:col-span-2" placeholder="Descripción"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            {editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', stock: '', image_url: '', category: '' }) }}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de productos */}
      <div>
        {products.map(product => (
          <div key={product.id} className="flex items-center justify-between border rounded-lg p-4 mb-3 shadow-sm">
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-gray-500 text-sm">${product.price} — Stock: {product.stock}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(product)}
                className="bg-yellow-400 px-4 py-1 rounded hover:bg-yellow-500 text-sm">
                Editar
              </button>
              <button onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPanel