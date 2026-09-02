import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/AdminPanel.css'

function AdminPanel() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', image_url: '', category: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [productImages, setProductImages] = useState([])
  const navigate = useNavigate()

  const resetForm = () => ({
    name: '', description: '', price: '', stock: '', image_url: '', category: ''
  })

  const fetchProducts = () => {
    api.get('/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error al obtener productos:', err))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/products/${editingId}/`, form)
      } else {
        await api.post('/products/', form)
      }
      setForm(resetForm())
      setEditingId(null)
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      console.error('Error al guardar producto:', err)
    }
  }

  const handleEdit = (product) => {
    setForm(product)
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/products/${id}/`)
      fetchProducts()
    } catch (err) {
      console.error('Error al eliminar producto:', err)
    }
  }

  const handleCancel = () => {
    setForm(resetForm())
    setEditingId(null)
    setShowForm(false)
  }

  const fetchImages = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/`)
      setProductImages(res.data.images || [])
      setSelectedProductId(productId)
    } catch (err) {
      console.error('Error al obtener imágenes:', err)
    }
  }

  const addImage = async () => {
    if (!imageUrl) return
    try {
      await api.post(`/products/${selectedProductId}/images/`, { url: imageUrl })
      setImageUrl('')
      fetchImages(selectedProductId)
    } catch (err) {
      console.error('Error al agregar imagen:', err)
    }
  }

  const deleteImage = async (imageId) => {
    try {
      await api.delete(`/products/${selectedProductId}/images/`, { data: { image_id: imageId } })
      fetchImages(selectedProductId)
    } catch (err) {
      console.error('Error al eliminar imagen:', err)
    }
  }

  const updateImage = async (imageId, newUrl) => {
    try {
      await api.patch(`/products/${selectedProductId}/images/`, { image_id: imageId, url: newUrl })
      fetchImages(selectedProductId)
    } catch (err) {
      console.error('Error al actualizar imagen:', err)
    }
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-header__title">Panel de Administración</h1>
          <div className="admin-header__actions">
            <button onClick={() => navigate('/analytics')} className="admin-btn-analytics">
              📊 Ver analytics
            </button>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="admin-btn-new">
                + Nuevo producto
              </button>
            )}
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="admin-form">
            <h2 className="admin-form__title">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <div className="admin-form__grid">
              <input className="admin-form__input" placeholder="Nombre"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="admin-form__input" placeholder="Precio"
                value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              <input className="admin-form__input" placeholder="Stock"
                value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              <input className="admin-form__input" placeholder="ID de categoría"
                value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              <input className="admin-form__input--full" placeholder="URL de imagen"
                value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
              <textarea className="admin-form__textarea" placeholder="Descripción" rows={3}
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="admin-form__footer">
              <button onClick={handleSave} className="admin-btn-save">
                {editingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button onClick={handleCancel} className="admin-btn-cancel">Cancelar</button>
            </div>
          </div>
        )}

        {/* Panel imágenes */}
        {selectedProductId && (
          <div className="admin-images">
            <div className="admin-images__header">
              <h2 className="admin-images__title">Imágenes del producto #{selectedProductId}</h2>
              <button onClick={() => setSelectedProductId(null)} className="admin-images__close">
                ✕ Cerrar
              </button>
            </div>
            <div className="admin-images__list">
              {productImages.map(img => (
                <div key={img.id} className="admin-images__item">
                  <img src={img.url} alt="extra" className="admin-images__preview" />
                  <input
                    className="admin-images__input"
                    defaultValue={img.url}
                    onBlur={e => { if (e.target.value !== img.url) updateImage(img.id, e.target.value) }}
                  />
                  <button onClick={() => deleteImage(img.id)} className="admin-images__btn-delete">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-images__footer">
              <input
                className="admin-images__url-input"
                placeholder="URL de imagen extra"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
              />
              <button onClick={addImage} className="admin-images__btn-add">Agregar</button>
            </div>
          </div>
        )}

        {/* Lista productos */}
        <div className="admin-list">
          {products.length === 0 ? (
            <div className="admin-list__empty">
              <p className="admin-list__empty-icon">📦</p>
              <p className="admin-list__empty-text">No hay productos aún</p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className={`admin-list__item ${index !== products.length - 1 ? 'admin-list__item--border' : ''}`}
              >
                <div className="admin-list__item-left">
                  <img src={product.image_url} alt={product.name} className="admin-list__item-image" />
                  <div>
                    <p className="admin-list__item-name">{product.name}</p>
                    <p className="admin-list__item-meta">${product.price} — Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="admin-list__item-actions">
                  <button onClick={() => fetchImages(product.id)} className="admin-btn-images">
                    🖼️ Imágenes
                  </button>
                  <button onClick={() => handleEdit(product)} className="admin-btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="admin-btn-delete">
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