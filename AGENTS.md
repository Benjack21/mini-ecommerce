# AGENTS.md
 
Instrucciones para agentes que trabajen en este repo. Solo hechos no obvios.
 
## Estructura
 
- Monorepo: `backend/` (Django 6 + DRF + SimpleJWT) y `frontend/` (React 19 + Vite 8 + Tailwind 4).
- Backend:
  - Rutas en `backend/store/urls.py` bajo prefijo `/api/`.
  - Vistas organizadas en paquete `backend/store/views/` (los imports se reexportan en `views/__init__.py`).
  - Lógica de negocio extraída a `backend/store/services/`.
  - Patrón: View (Adaptación HTTP) -> Service (Lógica de negocio) -> Model.
  - Auth: `backend/store/auth.py` (serializador/vista JWT custom), `backend/store/backends.py` (`EmailBackend`).
- Frontend:
  - Entrada: `frontend/src/main.jsx` → `App.jsx`.
  - HTTP centralizado en `frontend/src/api.js`; exporta `saveSession()`, `clearSession()`, `isAuthenticated()`.
  - Capa de servicios en `frontend/src/services/` para llamadas a la API.
  - Helpers puros en `frontend/src/utils/` (`rut.js`: `formatRut()` progresivo al teclear y `isValidRut()` con módulo 11; el backend debe mantener la misma lógica en `views/auth_views.py`).
  - Lógica de estado y fetching en `frontend/src/hooks/` (`useAuth`, `useCart`, etc.).
 
## Comandos (Windows / PowerShell)
 
Ejecutar desde la carpeta indicada. Usar `npm.cmd` (PowerShell bloquea `npm.ps1`).
 
```powershell
# Tests backend (desde backend/)
& "..\venv\Scripts\python.exe" manage.py test

# Un solo test / clase
& "..\venv\Scripts\python.exe" manage.py test store.tests.ProductAPITestCase
& "..\venv\Scripts\python.exe" manage.py test store.tests -k cart

# Seed de datos de prueba
& "..\venv\Scripts\python.exe" manage.py seed

# Linting y formateo Python (desde la raíz)
& "venv\Scripts\python.exe" -m ruff check backend/
& "venv\Scripts\python.exe" -m ruff check --fix backend/
& "venv\Scripts\python.exe" -m black backend/

# Frontend (desde frontend/)
npm.cmd run lint
npm.cmd run format
npm.cmd run build
npm.cmd run dev

# Docker (desde la raíz)
docker compose up -d --build
docker compose ps
docker compose logs -f backend
docker compose exec backend python manage.py test
```

- El venv **válido** es `venv/` en la raíz del repo. `backend/venv/` existe pero **no tiene Django**: no usarlo.
- **No hace falta activar el venv**: llamar siempre `& "venv\Scripts\python.exe"` (el `venv\Scripts\activate` no corre en PowerShell; `Activate.ps1` sí, pero es innecesario).
- `requirements.txt` está en la **raíz**, no en `backend/`:
  `& "venv\Scripts\python.exe" -m pip install -r requirements.txt`
- Orden de verificación: `lint` → `build` → backend `test`. No hay typecheck ni CI.
- Linting Python: **Ruff** (reglas `E,F,I,W,UP`) + **Black** (formateo), configurados en `pyproject.toml` en la raíz.
- Linting Frontend: **ESLint** (reglas en `frontend/eslint.config.js`) + **Prettier** (config en `frontend/.prettierrc`).
- No hay markdownlint: los `.md` se revisan a mano (grep de enlaces + lectura).
- `.editorconfig` en la raíz uniforma indentación y finales de línea.
 
## Entorno (.env)
 
- `python-decouple` lee `.env` desde el cwd. Hay **dos** archivos a mantener en sincronía:
  - Raíz: `D:\Proyecto\mini-ecomerce\.env`
  - Backend: `backend\backend\.env`
- **Cuál manda:**
  - Local con cwd en la raíz (`python backend\manage.py ...`): el de la **raíz**.
  - Docker: el de **`backend\backend\.env`** — `Dockerfile.backend` hace `COPY backend/ .` y así queda en `/app/.env` dentro del contenedor. Cambiar solo el de la raíz **no** afecta al contenedor.
- `docker-compose.yml` **no** define `env_file`; en contenedor solo se inyecta lo que esté en el Dockerfile/compose.
- Variables clave: `SECRET_KEY`, `DEBUG`, `GROQ_API_KEY`, `TBK_COMMERCE_CODE`, `TBK_API_KEY`, `TBK_RETURN_URL`, `TBK_INTEGRATION_TYPE`.
- No hardcodear credenciales Transbank/Groq en el código; usar `config(...)` de decouple.
- `frontend/.env` ya no contiene llaves de API (se manejan vía backend).
 
## Tailwind 4 / CSS
 
- Un CSS por página: `frontend/src/styles/<Pagina>.css`.
- Patrón obligatorio en cada archivo:
  ```css
  @reference "tailwindcss";
  @layer components {
    .clase { @apply ...; }
  }
  ```
- En Tailwind 4 **no existe** `bg-opacity-*` (sintaxis v3). Usar opacidad slash: `bg-white/80`, `hover:bg-white/100`.
- Un `@layer components` sin `}` cierra mal el build de **todo** el frontend.
- Import de estilos en la página: `import '../styles/home.css'` (minúscula exacta; case-sensitive en algunos entornos).
 
## Convenciones del repo

- Comentarios y textos en **español**; marcar cambios con `[FASE x.y]` o `[FIX ...]`.
- En JSX, jamás `// comentario` dentro del `return`: se renderiza como texto visible. Usar `{/* comentario */}`.
- Rutas protegidas: solo `PrivateRoute` (`adminOnly` decodifica el claim JWT `is_staff`).
- Guard admin: `payload.is_staff` en el token de `POST /api/token/` (serializador custom en `backend/store/auth.py`).
- No romper la API pública (paths ni contratos de respuesta) salvo petición explícita.
- No inventar fases ni features no pedidas; si algo queda fuera, anotarlo aquí.
- Commits: solo cuando el usuario lo pide explícitamente.
- Tamaño de cambio: tocar lo justo; evitar tocar un segundo archivo si no se pidió (p. ej. `README.md`).
 
## API / Auth

Endpoints de auth. **Los `token/` viven en `backend/backend/urls.py`** (no en `store/urls.py`); `register/` y `me/` sí en `store/urls.py`:

- `POST /api/token/` — login. Acepta `email` **o** `username` + `password` (`username`/`password` declarados opcionales en el serializer y validados a mano en `validate()`).
  - **400** `{"error": "El correo y la contraseña son requeridos"}` si falta alguno.
  - **401** `{"error": "Correo o contraseña incorrectos"}` si `authenticate()` falla.
  - Éxito → `{"access", "refresh"}`; el access lleva el claim **`is_staff`** (lo inyecta `CustomTokenObtainPairSerializer.get_token()`). `PrivateRoute adminOnly` depende de ese claim.
  - **No existe `POST /api/login/`** (eliminado): duplicaba semántica 400 vs 401 y emitía tokens **sin** `is_staff`.
- `POST /api/token/refresh/` — `{"refresh": "..."}` → `{"access": "..."}` (SimpleJWT estándar, sin claim custom).
- `POST /api/register/` — obligatorios `email, password, first_name, last_name, rut, phone`; `birth_date` opcional (vacío → `None`; un `''` directo a `DateField` daba 500); solo `@gmail.com`; email y RUT únicos. 201 `{"message"}` / 400 `{"error": "<string>"}`.
  - **RUT:** `_normalize_rut()` (en `views/auth_views.py`) limpia y guarda **siempre** formateado `11.111.111-1`; valida estructura (7-8 dígitos) y **DV módulo 11** (`_rut_dv_is_valid()`). Inválido → 400 `{"error": "RUT inválido..."}`. La unicidad se compara sobre la forma formateada → `12345678-5` y `12.345.678-5` chocan. El frontend replica la lógica en `utils/rut.js` (input de `Register.jsx` formatea al teclear).
- `GET /api/me/` — **exige autenticación** (`@authentication_classes([JWTAuthentication, SessionAuthentication])` + `@permission_classes([IsAuthenticated])`) → **401** si no. Devuelve `email, username, is_staff, first_name, last_name, rut, phone, birth_date`. Lo consume `useAuth`/`Profile`.

**Formato de error de auth:** el cuerpo es **siempre** `{"error": "<string>"}` (nunca listas). `as_serializer_error()` de DRF convertiría los valores en listas → `CustomTokenObtainPairView.post()` los normaliza con `_error_message()`.

**Backends** (`settings.AUTHENTICATION_BACKENDS`, en este orden):
1. `store.backends.EmailBackend` — busca **por email** (parámetro `username` de `authenticate()`), ejecuta el hasher aunque el correo no exista (anti-timing) y llama a `user_can_authenticate()` (usuarios `is_active=False` no entran).
2. `django.contrib.auth.backends.ModelBackend` — respaldo estándar de Django; no quitarlo.

**Permisos de catálogo:** `IsAdminOrReadOnly` en `backend/store/permissions.py` (Product/Category).

**`frontend/src/api.js`** (interceptores):
- Adjunta `Authorization: Bearer <token>` **excepto** a `AUTH_PATHS = ['/token/', '/token/refresh/', '/register/']` (tampoco los redirige en 401; si no, un token caducado bloquearía volver a iniciar sesión).
- **401** (fuera de `AUTH_PATHS`) → refresh automático con el `refresh` de `localStorage` (un solo refresh concurrente, serializado) y reintento de la petición original. Si falla → `clearSession()` + `window.location = '/login'`.
- **403** → `window.location = '/'`. **500** → `console.error`.
- Exports: `saveSession({access, refresh})`, `clearSession()`, `isAuthenticated()`; `api` default con `baseURL: '/api'`. Claves en `localStorage`: `token` y `refresh`.
 
## Testing

- Solo `backend/store/tests.py` (Django `TestCase` + DRF `APIClient`). Sin tests de frontend.
- La BD de tests es SQLite temporal; no requiere servicios externos.
- Añadir tests de permisos/IDOR al tocar views protegidas.
- 52 tests en verde. `AuthAPITestCase` cubre `/api/token/` (200/400/401 + claim `is_staff`), `/api/me/` (401 sin token), el formato estricto de email en `/api/register/` (regex `^[^@\s]+@gmail\.com$`: un solo `@`, sin espacios, con parte local) y RUT (normalización a `11.111.111-1`, DV módulo 11, unicidad entre formatos).
- **Ojo con `User.email` (unique):** usuarios creados con `create_user()` sin email o con el mismo email chocan con `UNIQUE constraint failed: store_user.email` y truena el `setUp` de toda la clase. Siempre email único por usuario.

## Proxy de dev (Vite)

- `frontend/vite.config.js` define `server.proxy: { '/api': 'http://localhost:8000' }`.
- Sin ese proxy, con `npm run dev` el `baseURL: '/api'` de `api.js` apunta a `:5173` y Vite responde **404 en POST** (su fallback a `index.html` solo cubre GET/HEAD) → login imposible en local.
- En Docker el proxy no se usa: nginx ya hace `location /api/ { proxy_pass http://backend:8000; }`.

## Docker

- Comandos: `docker compose up -d --build`, `docker compose ps`, `docker compose logs -f backend`, `docker compose exec backend python manage.py test`. (El binario legacy `docker-compose` también existe en esta máquina.)
- Puertos: backend `:8000` (gunicorn), frontend `:5173`→80 (nginx).
- DB SQLite: `backend/db.sqlite3` (montada en el volumen del compose).
- **`Dockerfile.backend` debe usar `COPY backend/ .`**; con `COPY . .` no se resuelve `backend.wsgi` y gunicorn cae con `ModuleNotFoundError` (exit 3). Contexto = raíz del repo, por eso el `COPY` es relativo a `backend/`.
- Hay `.dockerignore` en la raíz (`.git`, `venv`, `backend/venv`, `frontend/node_modules`, `**/__pycache__`, `dist`): sin él el build context arrastra gigabytes.
- `docker-compose.yml` **no** define `env_file`: el `.env` efectivo es el de `backend/backend/.env` (ver sección Entorno).
