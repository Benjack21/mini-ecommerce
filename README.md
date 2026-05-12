# 🛒 Mini E-commerce

Aplicación web de tienda online construida con React y Django.

## 🚀 Tecnologías

### Frontend
- **React** 19.2.4 - UI Framework
- **Vite** 8.0.1 - Build tool con HMR
- **Tailwind CSS** 4.2.2 - Framework de estilos
- **Axios** 1.14.0 - Cliente HTTP
- **React Router DOM** 7.13.2 - Routing y navegación
- **ESLint** 9.39.4 - Linter de código

### Backend
- **Django** 6.0.3 - Framework web
- **Django REST Framework** 3.17.1 - API REST
- **SimpleJWT** 5.5.1 - Autenticación con tokens JWT
- **Django CORS Headers** 4.9.0 - Manejo de CORS
- **PostgreSQL/SQLite** - Base de datos
- **Gunicorn** 25.3.0 - Servidor WSGI
- **WhiteNoise** 6.12.0 - Servir archivos estáticos
- **Transbank SDK** 6.1.0 - Integración de pagos

## ✅ Funcionalidades

- Registro e inicio de sesión con JWT
- Listado de productos
- Carrito de compras por usuario (agregar, editar cantidad, eliminar)
- Panel de administración para gestionar productos
- Integración de pagos con Transbank
- Autenticación segura con tokens JWT
- API RESTful completa

## ⚙️ Cómo correr el proyecto

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

cd frontend
npm install
npm run dev

📸 Screenshots
(agrega capturas de pantalla aquí)
