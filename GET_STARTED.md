# 🚀 Guía de Inicio Rápido (Quick Start)

Este documento describe los pasos exactos para poner en marcha el proyecto desde cero, tanto en modo local como mediante Docker.

## 🛠️ Opción 1: Ejecución Local (Desarrollo)

### 1. Backend (Django)
Ejecutar los siguientes comandos desde la raíz del proyecto:

```powershell
# 1. Crear el entorno virtual
python -m venv venv

# 2. Activar el entorno virtual
& "venv\Scripts\activate"

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
# Copiar el contenido de .env a backend/backend/.env
copy .env backend\backend\.env

# 5. Preparar la base de datos
python backend/manage.py migrate
python backend/manage.py seed

# 6. Iniciar el servidor
python backend/manage.py runserver
```

### 2. Frontend (React + Vite)
Abrir una nueva terminal y ejecutar:

```powershell
cd frontend
npm install
npm run dev
```
El frontend estará disponible en: `http://localhost:5173`

---

## 🐳 Opción 2: Ejecución con Docker (Recomendado)

Es la forma más rápida de levantar todo el stack sin instalar dependencias localmente.

```powershell
# 1. Construir e iniciar los contenedores en segundo plano
docker-compose up -d --build

# 2. Ejecutar las migraciones y la semilla de datos dentro del contenedor
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed
```

**Accesos:**
- **Frontend**: `http://localhost:5173` (o el puerto definido en tu proxy/nginx)
- **Backend API**: `http://localhost:8000/api`

---

## 📌 Notas Importantes

- **Variables de Entorno**: Asegúrate de que el archivo `.env` tenga las llaves de `GROQ_API_KEY` y las credenciales de `Transbank` correctamente configuradas.
- **Modo de Pago**: Por defecto, el sistema inicia en `TBK_INTEGRATION_TYPE=TEST`. Para producción, cambia este valor a `LIVE`.
- **Documentación**:
  - Para detalles técnicos: ver `AGENTS.md`.
  - Para el plan de refactorización: ver `FASES.md`.
  - Para probar los pagos: ver `TESTING_GUIDE.md`.
