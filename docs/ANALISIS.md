# FASE 1 — Análisis del Sistema

## 1. Descripción

Sistema web para gestionar el ciclo completo de un **Taller de Motocicletas**: desde el ingreso de la moto hasta su entrega, incluyendo clientes, órdenes de trabajo, técnicos, mano de obra, repuestos, reportes técnicos, historial y liquidación semanal.

## 2. Requisitos funcionales

| ID | Requisito |
|----|-----------|
| RF-01 | Autenticación con JWT y contraseñas cifradas (bcrypt). |
| RF-02 | Administración de usuarios y roles (ADMIN). |
| RF-03 | Activar / desactivar usuarios. |
| RF-04 | Crear técnicos con porcentaje de mano de obra (40%–70%). |
| RF-05 | CRUD de clientes. |
| RF-06 | CRUD de motocicletas asociadas a un cliente (placa única). |
| RF-07 | Registrar entradas como órdenes de trabajo (historial por ingresos). |
| RF-08 | Asignar uno o más técnicos a una orden. |
| RF-09 | Cambiar el estado de reparación de una orden. |
| RF-10 | El técnico registra mano de obra en estado PENDIENTE. |
| RF-11 | El jefe aprueba, modifica o rechaza mano de obra. |
| RF-12 | Calcular totales de M/O aprobada × porcentaje del técnico. |
| RF-13 | Registrar reportes técnicos y repuestos utilizados. |
| RF-14 | Consultar historial de una moto por placa. |
| RF-15 | Liquidar técnicos por rango de fechas sin duplicar M/O. |
| RF-16 | Generar PDF de reporte técnico y de liquidación. |
| RF-17 | Dashboards diferenciados por rol. |
| RF-18 | El técnico solo ve sus asignaciones y sus liquidaciones. |

## 3. Requisitos no funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Interfaz responsive (escritorio, tablet, móvil). |
| RNF-02 | Arquitectura MVC (rutas → controladores → servicios → modelos). |
| RNF-03 | MySQL InnoDB, utf8mb4, FKs e índices. |
| RNF-04 | Validaciones en frontend y backend. |
| RNF-05 | Protección de rutas por token y rol. |
| RNF-06 | Sin duplicar datos de cliente dentro de la motocicleta. |
| RNF-07 | Tiempos de respuesta adecuados para operación diaria del taller. |

## 4. Casos de uso

1. **Iniciar sesión** — cualquier usuario activo.
2. **Gestionar usuarios** — ADMIN.
3. **Registrar cliente y motocicleta** — ADMIN / JEFE_TALLER.
4. **Registrar ingreso (orden)** — JEFE_TALLER / ADMIN.
5. **Asignar técnico** — JEFE_TALLER / ADMIN.
6. **Actualizar estado de orden** — JEFE_TALLER / ADMIN / TECNICO (sus órdenes).
7. **Registrar mano de obra** — TECNICO.
8. **Aprobar / modificar / rechazar M/O** — JEFE_TALLER / ADMIN.
9. **Registrar reporte y repuestos** — TECNICO.
10. **Consultar historial por placa** — ADMIN / JEFE_TALLER.
11. **Liquidar técnico** — JEFE_TALLER / ADMIN.
12. **Descargar PDF** — ADMIN / JEFE_TALLER / TECNICO (propios).

## 5. Roles y permisos

| Módulo | ADMIN | JEFE_TALLER | TECNICO |
|--------|:-----:|:-----------:|:-------:|
| Usuarios / roles | Sí | No | No |
| Porcentaje de técnicos | Sí | No | No |
| Clientes / motocicletas | Sí | Sí | Consulta de asignadas |
| Órdenes / asignación | Sí | Sí | Solo asignadas |
| Aprobar mano de obra | Sí | Sí | No |
| Reportes / repuestos | Sí | Sí | Propios |
| Historial | Sí | Sí | No |
| Liquidaciones | Sí | Sí | Solo las suyas |
| Dashboards | Completo | Operativo | Personal |

## 6. Flujo principal

```
Cliente → Motocicleta → Orden de trabajo (ingreso)
       → Asignación de técnico
       → Diagnóstico / reparación / reporte + repuestos
       → Registro de mano de obra (PENDIENTE)
       → Aprobación del jefe (APROBADA / MODIFICADA / RECHAZADA)
       → Entrega (ENTREGADA)
       → Liquidación semanal del técnico
```
