# AGENTS.md
 
Instrucciones para agentes que trabajen en este repo. Solo hechos no obvios.
 
## Estructura
 
- Monorepo: `backend/` (Django 6 + DRF + SimpleJWT) y `frontend/` (React 19 + Vite 8 + Tailwind 4).
- Backend:
  - Rutas en `backend/store/urls.py` bajo prefijo `/api/`.
  - Vistas organizadas en paquete `backend/store/views/`.
  - Lógica de negocio extraída a `backend/store/services/`.
  - Patrón: View (Adaptación HTTP) -> Service (Lógica de negocio) -> Model.
- Frontend:
  - Entrada: `frontend/src/main.jsx` → `App.jsx`.
  - HTTP centralizado en `frontend/src/api.js`.
  - Capa de servicios en `frontend/src/services/` para llamadas a la API.
  - Lógica de estado y fetching en `frontend/src/hooks/`.
 
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
```

- El venv **válido** es `venv/` en la raíz del repo. `backend/venv/` existe pero **no tiene Django**: no usarlo.
- `requirements.txt` está en la **raíz**, no en `backend/`:
  `& "venv\Scripts\python.exe" -m pip install -r requirements.txt`
- Orden de verificación: `lint` → `build` → backend `test`. No hay typecheck ni CI.
- Linting Python: **Ruff** (reglas `E,F,I,W,UP`) + **Black** (formateo), configurados en `pyproject.toml` en la raíz.
- Linting Frontend: **ESLint** (reglas en `frontend/eslint.config.js`) + **Prettier** (config en `frontend/.prettierrc`).
- `.editorconfig` en la raíz uniforma indentación y finales de línea.
 
## Entorno (.env)
 
- `python-decouple` lee `.env` desde el cwd. Hay **dos** archivos a mantener en sincronía:
  - Raíz: `D:\Proyecto\mini-ecomerce\.env`
  - Backend: `backend\backend\.env`
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
 
## API / Auth
 
- Login: `POST /api/token/` → JWT con `is_staff`; refresh en `POST /api/token/refresh/`.
- Endpoints privados: decoradores `@authentication_classes([JWTAuthentication, SessionAuthentication])` + `@permission_classes([IsAuthenticated])`.
- Permisos de catálogo: `IsAdminOrReadOnly` en `backend/store/permissions.py` (Product/Category).
- `frontend/src/api.js`: 401 → borra token y `window.location = '/login'`; 403 → `'/'`. Considerar este efecto al llamar APIs autenticadas desde componentes sin sesión.
 
## Testing
 
- Solo `backend/store/tests.py` (Django `TestCase` + DRF `APIClient`). Sin tests de frontend.
- La BD de tests es SQLite temporal; no requiere servicios externos.
- Añadir tests de permisos/IDOR al tocar views protegidas.
 
## Docker
 
- `docker-compose up`: backend `:8000` (gunicorn), frontend `:5173`→80.
- DB SQLite: `backend/db.sqlite3` (montada en el volumen del compose).
