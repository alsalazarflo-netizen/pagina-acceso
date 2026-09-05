# Sistema de administración — API REST

Backend en **Node.js** (Express) conectado a **Supabase** (PostgreSQL). Las contraseñas se cifran con **bcrypt** y nunca se devuelven en las respuestas.

## Requisitos

- Node.js 18 o superior
- Proyecto Supabase (URL: `https://epfpkafewhbwecvtikty.supabase.co`)

## 1. Crear las tablas en Supabase

En el dashboard de Supabase abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo.

## 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa:

| Variable | Dónde obtenerla |
| --- | --- |
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` (secret) |
| `JWT_SECRET` | Cualquier cadena larga y aleatoria |

Usa **service_role** en el servidor, no la clave `anon`. Esa clave omite RLS y debe quedarse solo en el backend.

## 3. Instalar y arrancar

```bash
npm install
npm run dev
```

La API queda en `http://localhost:3000`.

## Roles

- `admin`: gestiona usuarios, departamentos y empleados
- `gerente`: crea y edita departamentos y empleados
- `empleado`: solo consulta departamentos y empleados

El **primer registro** (cuando no hay usuarios) se convierte automáticamente en `admin`.

## Endpoints

Autenticación: `Authorization: Bearer <token>`

### Auth

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No (primer usuario) / Admin | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/auth/me` | Sí | Usuario actual |

### Usuarios (solo admin)

| Método | Ruta |
| --- | --- |
| GET | `/api/usuarios` |
| GET | `/api/usuarios/:id` |
| POST | `/api/usuarios` |
| PUT | `/api/usuarios/:id` |
| DELETE | `/api/usuarios/:id` |

### Departamentos y empleados

CRUD en `/api/departamentos` y `/api/empleados`. Lectura: cualquier usuario autenticado. Escritura: `admin` o `gerente`. Borrado: `admin`.

## Ejemplos

Registrar el primer administrador:

```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Admin\",\"email\":\"admin@empresa.com\",\"password\":\"secreto123\"}"
```

Iniciar sesión:

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@empresa.com\",\"password\":\"secreto123\"}"
```

Crear un departamento (sustituye `TOKEN`):

```bash
curl -X POST http://localhost:3000/api/departamentos ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN" ^
  -d "{\"nombre\":\"Recursos Humanos\",\"descripcion\":\"Gestión de personal\"}"
```
