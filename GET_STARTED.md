# 🚀 Guía de Inicio Rápido (Quick Start)

Este documento describe los pasos exactos para poner en marcha el proyecto desde cero, tanto en modo local como mediante Docker.

## 🛠️ Opción 1: Ejecución Local (Desarrollo)

### 1. Backend (Django)

Ejecutar los siguientes comandos desde la **raíz** del proyecto:

```powershell
# 1. Crear el entorno virtual (solo la primera vez)
python -m venv venv

# 2. Instalar dependencias (requirements.txt está en la raíz)
& "venv\Scripts\python.exe" -m pip install -r requirements.txt

# 3. Variables de entorno: hay DOS archivos .env que deben ir sincronizados
#    - .env            (raíz)      -> el que usa este modo local
#    - backend\backend\.env          -> el que usa Docker
#    No copies uno sobre otro a ciegas: añade las claves faltantes en ambos.
#    Claves mínimas: SECRET_KEY, DEBUG, GROQ_API_KEY, TBK_* (ver AGENTS.md)

# 4. Preparar la base de datos
& "venv\Scripts\python.exe" backend\manage.py migrate
& "venv\Scripts\python.exe" backend\manage.py seed

# 5. (Opcional) Admin de Django para /admin/
& "venv\Scripts\python.exe" backend\manage.py createsuperuser

# 6. Iniciar el servidor (queda en http://localhost:8000)
& "venv\Scripts\python.exe" backend\manage.py runserver
```

> ⚠️ **No hace falta (ni funciona bien) activar el venv en PowerShell** con `venv\Scripts\activate`. Basta con llamar siempre al intérprete como `& "venv\Scripts\python.exe"`.

### 2. Frontend (React + Vite)

Abrir una **nueva** terminal y ejecutar:

```powershell
cd frontend
npm install
npm run dev
```

El frontend queda en: `http://localhost:5173`

> 🔁 **Proxy**: `vite.config.js` reenvía `/api` a `http://localhost:8000`. Sin ese proxy el login falla con **404** en local (por eso el backend debe estar corriendo en el paso anterior).

---

## 🐳 Opción 2: Ejecución con Docker (Recomendado)

Es la forma más rápida de levantar todo el stack sin instalar dependencias localmente.

```powershell
# 1. Construir e iniciar los contenedores en segundo plano
docker compose up -d --build

# 2. Migraciones y seed dentro del contenedor
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed

# 3. (Opcional) Admin de Django
docker compose exec backend python manage.py createsuperuser
```

Útiles de seguimiento:

```powershell
docker compose ps
docker compose logs -f backend
```

**Accesos:**
- **Frontend**: `http://localhost:5173` (nginx)
- **Backend API**: `http://localhost:8000/api`

> ⚠️ En Docker el `.env` que se usa es **`backend\backend\.env`** (el `Dockerfile` hace `COPY backend/ .`). Si cambias solo el `.env` de la raíz, **el contenedor no lo ve**.

---

## 📌 Notas Importantes

- **Registro de usuarios**: `POST /api/register/` solo acepta correos `@gmail.com` y exige `email, password, first_name, last_name, rut, phone` (`birth_date` es opcional).
- **Login**: `POST /api/token/` (no existe `/api/login/`) con `email` o `username` + `password`.
- **Variables de Entorno**: asegúrate de que `GROQ_API_KEY` y las credenciales de `Transbank` estén en **ambos** `.env`.
- **Modo de Pago**: por defecto el sistema arranca en `TBK_INTEGRATION_TYPE=TEST`; para producción cambia a `LIVE`.
- **Documentación**:
  - Para detalles técnicos, convenciones y comandos: ver `AGENTS.md`.
  - Para las credenciales y tarjetas de prueba de Webpay: ver `TESTING_GUIDE.md`.
  - Para una visión general del proyecto: ver `README.md`.
