# Taller de Motocicletas ORDEN

Sistema web para controlar el ciclo completo de una motocicleta: ingreso, asignación de técnicos, reparación, mano de obra, reportes, historial y liquidación semanal.

## Tecnologías

- Frontend: HTML5, CSS3, JavaScript (Fetch API)
- Backend: Node.js, Express, JWT, bcryptjs
- Base de datos: MySQL 8 (InnoDB, utf8mb4)

## Requisitos

- Node.js 18 o superior
- MySQL 8
- MySQL Workbench (opcional)

## Instalación

1. Crear la base de datos ejecutando `database/taller_motocicletas.sql` en MySQL Workbench o consola.
2. Copiar `backend/.env.example` a `backend/.env` y configurar usuario/contraseña de MySQL.
3. Instalar dependencias e insertar usuarios de prueba:

```bash
npm run setup
npm run dev
```

O desde la carpeta del servidor:

```bash
cd backend
npm install
npm run setup
npm start
```

4. Abrir [http://localhost:3000](http://localhost:3000)

## Usuarios de demostración

| Rol | Correo | Contraseña |
|-----|--------|------------|
| ADMIN | admin@taller.com | Admin123! |
| JEFE_TALLER | jefe@taller.com | Jefe123! |
| TECNICO | tecnico@taller.com | Tecnico123! |

## API

Prefijo `/api`:

- `/auth` `/usuarios` `/roles` `/clientes` `/motocicletas`
- `/ordenes` `/tecnicos` `/mano-obra` `/reportes`
- `/repuestos` `/historial` `/liquidaciones` `/dashboard`

## Documentación de análisis

- `docs/ANALISIS.md` — requisitos, casos de uso y permisos
- `docs/MODELO_DATOS.md` — relaciones y diagrama ER

## Netlify

Netlify solo sirve el **frontend** (carpeta `frontend/`). El backend (Node + MySQL) no corre ahí.

1. En Netlify, Publish directory: `frontend` (ya viene en `netlify.toml`).
2. Suba el API a un hosting con Node y MySQL (Render, Railway, un VPS, etc.).
3. En `frontend/js/config.js` ponga la URL del API:

```js
window.API_URL = "https://su-api.onrender.com/api";
```

## Render

El error `Cannot find module 'dotenv'` aparece si Render instala paquetes en la raíz y no dentro de `backend`.

En el servicio web de Render configure:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Variables de entorno (Environment):

```
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=taller_motocicletas
JWT_SECRET=
JWT_EXPIRES_IN=8h
TALLER_NOMBRE=Taller Motocicletas ORDEN
```

MySQL debe estar en un servicio aparte (Render PostgreSQL no sirve; hace falta MySQL, por ejemplo PlanetScale, Railway o un VPS).


