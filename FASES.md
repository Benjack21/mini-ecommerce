# Plan multi-fase: SOLID, calidad y tests
 
> **ESTADO: Completado el 22 de Septiembre de 2026** ✅
> Todas las fases (1 a 4) han sido ejecutadas, verificadas y validadas.
 
> Fase 1 (seguridad/bugs P0) ya aplicada. Este documento es la guía ejecutable de las fases restantes.

> Convenciones del repo: ver `AGENTS.md`. Comentarios y textos en español; marcar cambios con `[FASE 2.x]`, `[FASE 3.x]`, etc.
> Orden de verificación en cada fase: `npm.cmd run lint` → `npm.cmd run build` → tests backend.

---

## Fase 2 — SOLID en el backend

**Objetivo:** sacar la lógica de negocio de `backend/store/views.py` sin cambiar contratos de la API (mismos endpoints, mismos status codes).

### 2.1 Crear capa `services/`

- Crear paquete `backend/store/services/`.
- Extraer dominios (una función/clase por archivo o por tema claro):
  - `catalog.py` — listado/filtrado de productos y categorías (lógica de queryset, permisos de catálogo).
  - `cart.py` — `add_to_cart`, `get_cart`, reglas de cantidad/stock.
  - `orders.py` — `place_order`, cálculo de totales, creación de `Order`/`OrderItem`, descuento de stock.
  - `payments.py` — `_get_webpay_transaction`, `create_payment`, `confirm_payment` (Transbank).
  - `reviews.py` — crear/obtener reseñas, regla de una reseña por usuario.
  - `wishlist.py` — add/remove/list.
  - `notifications.py` — `get_notifications`, `mark_notifications_read`.
  - `images.py` — alta/baja de `ProductImage`.
  - `chat.py` — validación de mensajes + llamada a Groq (timeout, manejo de error).
  - `analytics.py` — agregaciones para el panel admin.
- **Regla SRP:** los services no importan `Request` de Django si es evitable; reciben datos ya parseados o `user`/`pk`. Si necesitan HTTP (Groq), encapsular ahí.
- **Regla DIP:** views dependen de services; services no dependen de views.

### 2.2 Dividir `views.py`

- Mantener **los mismos paths** de `backend/store/urls.py` (no romper el frontend).
- Opción preferida: convertir en un paquete `backend/store/views/` con `__init__.py` que reexporta los símbolos usados en `urls.py` (o actualizar imports de `urls.py` de forma explícita).
  - Ej.: `views/__init__.py`, `views/auth_views.py`, `views/cart_views.py`, `views/order_views.py`, `views/payment_views.py`, `views/product_views.py`, `views/misc_views.py` (chat, notificaciones, analytics, wishlist, images).
- Cada view: parsear/validar request → llamar service → serializar respuesta. Sin lógica de negocio en la view.
- Mantener decoradores `@api_view`, `@authentication_classes`, `@permission_classes` **en la view** (no en services).

### 2.3 Serializadores y permisos

- Revisar `serializers.py`: si crece, agrupar o dividir (`serializers/` con `product.py`, `cart.py`, etc.) solo si aporta claridad.
- `IsAdminOrReadOnly` y `CartItemViewSet` (IDOR) **no se tocan en regla**, solo se reubican si hay que mover clases.
- `CustomTokenObtainPairView` en `store/auth.py` se deja como está (ya es un módulo propio).

### 2.4 Tests Fase 2

- Los 21 tests actuales deben pasar **sin cambios de contrato**.
- Añadir tests de services unitarios (sin HTTP) para `orders` (totales/stock) y `cart` (cantidad).
- Si algo cambia de path interno, actualizar solo imports; no renombrar endpoints.

### 2.5 Criterio de aceptación Fase 2

- [ ] `backend/store/views.py` ya no contiene la lógica de negocio (solo adaptación HTTP).
- [ ] Existe `backend/store/services/` con al menos cart, orders, payments.
- [ ] `manage.py test` en verde (21+ tests).
- [ ] Ningún path de `store/urls.py` cambiado.
- [ ] Comentarios `[FASE 2.x]` en archivos nuevos/modificados.

---

## Fase 3 — SOLID en el frontend

**Objetivo:** sacar acceso a red y estado compartido de los componentes, sin rediseñar la UI.

### 3.1 Capa `services/` (HTTP)

- Crear `frontend/src/services/` (o `api/` solo si se prefiere un nombre distinto al módulo `api.js` existente).
- Un módulo por dominio, **usando siempre** la instancia `api` de `frontend/src/api.js` (no crear otra baseURL):
  - `authService.js` — login, register, me, refresh si aplica.
  - `productService.js` — listado, detalle, reviews, images.
  - `cartService.js` — add, get, update, delete (incluye `/api/cartitems/`).
  - `orderService.js` — place, list.
  - `paymentService.js` — create/confirm.
  - `wishlistService.js`, `notificationService.js`, `chatService.js`, `analyticsService.js`.
- Las páginas importan services; **no** llamen `api.get/post` directamente fuera de `services/` y de `api.js`.

### 3.2 Hooks

- Extraer a `frontend/src/hooks/` la lógica de fetching reutilizable o compleja:
  - Ej.: carrito en varias vistas, notificaciones, chat (estado de mensajes + loading).
- Hooks usan services, no axios directo.
- Mantener `useToast` como está si no duele; no renombrar sin necesidad.

### 3.3 Auth y guards

- `PrivateRoute` y el interceptor de `api.js` son la fuente de verdad de sesión/roles: no duplicar lógica de `is_staff` en cada página.
- Si una página necesita el usuario actual, usar un hook o service `me` — no decodificar JWT a mano en varios sitios (solo `PrivateRoute` y, si hace falta, un único helper).

### 3.4 Limpieza puntual

- Eliminar usos muertos: `VITE_GROQ_API_KEY` en `frontend/.env` si sigue sin usarse; `App.css` si nadie lo importa (verificar con grep antes de borrar).
- Un CSS por página en `frontend/src/styles/` con el patrón de `AGENTS.md` (Tailwind 4).

### 3.5 Tests / verificación Fase 3

- No hay test runner de frontend: la verificación es `lint` + `build` (+ `dev` manual de rutas críticas: login, carrito, admin, chat sin sesión).
- Chat sin token debe seguir mostrando mensaje amable (comportamiento de Fase 1.6).

### 3.6 Criterio de aceptación Fase 3

- [ ] Ninguna página hace `axios`/`api.*` fuera de `src/services/` (salvo `api.js`).
- [ ] Lógica de chat/carrito extraída a hooks o services donde repetía.
- [ ] `npm.cmd run lint` y `npm.cmd run build` en verde.
- [ ] Comentarios `[FASE 3.x]`.

---

## Fase 4 — Calidad, tests y docs

**Objetivo:** cerrar deuda de testing, endurecer reglas y alinear docs con el código.

### 4.1 Tests backend (ampliar)

- Archivo actual: `backend/store/tests.py`. Si crece mucho, dividir en `tests/` paquete (solo entonces).
- Cobrir lo que Fase 1/2 tocaron:
  - Permisos: anon no escribe en Product/Category; staff sí.
  - IDOR: usuario A no ve/borra carrito de usuario B (`/api/cartitems/`).
  - JWT: `POST /api/token/` incluye `is_staff` true solo para staff.
  - `groq_chat`: 401 sin token; body inválido → 400.
  - Orders: total y stock al confirmar pago (unitario del service si existe).
- Mantener `APIClient` + `TestCase`; sin servicios externos (Groq/Transbank mockeados o rutas de error).

### 4.2 Calidad de código

- Revisar imports duplicados y código muerto en `store/` (tras Fase 2).
- Formato/consistencia: sin formatter configurado → seguir estilo del archivo vecino; no reformatear el repo entero.
- `seed` (`management/commands/seed.py`): comprobar que sigue funcionando tras refactors.

### 4.3 Docs

- `README.md`: rellenar **Cómo correr el proyecto** (era `#pendiente`):
  - Backend: venv raíz, `requirements.txt` raíz, `.env` (raíz + `backend/backend/.env`), `migrate`, `seed`, `runserver`.
  - Frontend: `npm.cmd install`, `npm.cmd run dev`.
  - Docker: `docker-compose up`.
  - Enlace a `AGENTS.md` y a este archivo de fases.
- `AGENTS.md`: actualizar solo si cambian comandos, estructura o convenciones verificables (p. ej. si `views.py` deja de existir como archivo único).

### 4.4 Verificación final

```powershell
# desde frontend/
npm.cmd run lint
npm.cmd run build

# desde backend/
& "..\venv\Scripts\python.exe" manage.py test
```

### 4.5 Criterio de aceptación Fase 4

- [ ] Tests de permisos/IDOR/JWT presentes y en verde.
- [ ] README con instrucciones reales de arranque (no `#pendiente`).
- [ ] `AGENTS.md` coherente con el estado real del código.
- [ ] Comentarios `[FASE 4.x]` donde aplique.

---

## Reglas transversales (todas las fases)

1. **No romper la API pública** salvo petición explícita del usuario.
2. **No inventar fases ni features** no pedidas; si algo queda fuera, apuntarlo aquí o en `AGENTS.md`.
3. **Commits:** solo si el usuario lo pide.
4. **Creds:** nunca hardcodear; siempre `config(...)` de decouple / env.
5. **JSX:** comentarios solo con `{/* ... */}`.
6. **CSS:** Tailwind 4 (`@reference`, sin `bg-opacity-*`).
7. Tras cada bloque de cambios: lint → build → test backend.
