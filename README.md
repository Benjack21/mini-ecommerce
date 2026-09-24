# 🛒 Mini E-commerce
 
Aplicación web de tienda online construida con React y Django.
 
## Tecnologías
 
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
- **SQLite** - Base de datos (`psycopg2-binary` está en `requirements.txt` por si se migra a PostgreSQL, pero `settings.py` fija `django.db.backends.sqlite3`)
- **Gunicorn** 25.3.0 - Servidor WSGI
- **WhiteNoise** 6.12.0 - Servir archivos estáticos
- **Transbank SDK** 6.1.0 - Integración de pagos
 
## Funcionalidades
 
- Registro e inicio de sesión con JWT
- Listado de productos
- Carrito de compras por usuario (agregar, editar cantidad, eliminar)
- Panel de administración para gestionar productos
- Integración de pagos con Transbank
- API RESTful completa
 
## Cómo correr el proyecto

Pasos detallados (local y Docker) en **[GET_STARTED.md](./GET_STARTED.md)**. Resumen:

### Backend
1. Crear el venv en la raíz: `python -m venv venv` (no hace falta activarlo: los comandos usan `& "venv\Scripts\python.exe"`)
2. Instalar dependencias: `& "venv\Scripts\python.exe" -m pip install -r requirements.txt`
3. Configurar `.env` en la raíz y en `backend/backend/.env`.
4. Ejecutar migraciones: `& "venv\Scripts\python.exe" backend\manage.py migrate`
5. Seed de datos: `& "venv\Scripts\python.exe" backend\manage.py seed`
6. Correr servidor: `& "venv\Scripts\python.exe" backend\manage.py runserver`

### Frontend
1. Entrar a carpeta: `cd frontend`
2. Instalar: `npm install`
3. Correr: `npm run dev`

### Docker
- `docker compose up -d --build`

## Documentación del Proyecto
- [GET_STARTED.md](./GET_STARTED.md) - Puesta en marcha local y con Docker.
- [AGENTS.md](./AGENTS.md) - Guía técnica para desarrolladores y agentes.
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Tarjetas de prueba Webpay (ambiente TEST).
 
## 📸 Screenshots

**Home**

<img width="600" height="500" alt="image" src="https://github.com/user-attachments/assets/a6eb16e4-fb45-42cf-81ae-c389481c4ee7" />

**Panel admin**

<img width="600" height="500" alt="image" src="https://github.com/user-attachments/assets/cbfc121e-0312-41f6-a94f-aeee4af09b2e" />

**Detalles producto**

<img width="600" height="500" alt="image" src="https://github.com/user-attachments/assets/83a682a0-bc33-4377-99c8-55811a9ad047" />

