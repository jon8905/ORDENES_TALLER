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
