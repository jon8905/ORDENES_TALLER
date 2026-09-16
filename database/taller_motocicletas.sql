-- ============================================================
-- Taller de Motocicletas — Esquema completo
-- Motor: InnoDB | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS taller_motocicletas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taller_motocicletas;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS liquidacion_detalles;
DROP TABLE IF EXISTS liquidaciones_tecnicos;
DROP TABLE IF EXISTS reporte_repuestos;
DROP TABLE IF EXISTS reportes_tecnicos;
DROP TABLE IF EXISTS mano_obra;
DROP TABLE IF EXISTS orden_repuestos;
DROP TABLE IF EXISTS orden_tecnicos;
DROP TABLE IF EXISTS ordenes_trabajo;
DROP TABLE IF EXISTS motocicletas;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS tecnicos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS repuestos;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Roles
-- ------------------------------------------------------------
CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  documento VARCHAR(30) NOT NULL UNIQUE,
  direccion VARCHAR(180) NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_usuarios_rol (id_rol),
  INDEX idx_usuarios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Técnicos (perfil adicional del usuario con rol TECNICO)
-- ------------------------------------------------------------
CREATE TABLE tecnicos (
  id_tecnico INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  porcentaje_mano_obra DECIMAL(5,2) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_porcentaje_mo
    CHECK (porcentaje_mano_obra >= 40 AND porcentaje_mano_obra <= 70),
  CONSTRAINT fk_tecnicos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_tecnicos_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Clientes
-- ------------------------------------------------------------
CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  documento VARCHAR(30) NOT NULL UNIQUE,
  direccion VARCHAR(180) NULL,
  telefono VARCHAR(30) NOT NULL,
  telefono_secundario VARCHAR(30) NULL,
  email VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clientes_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Motocicletas
-- ------------------------------------------------------------
CREATE TABLE motocicletas (
  id_motocicleta INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(10) NOT NULL UNIQUE,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  color VARCHAR(40) NOT NULL,
  id_cliente INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_motos_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_motos_cliente (id_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Órdenes de trabajo (cada ingreso al taller)
-- ------------------------------------------------------------
CREATE TABLE ordenes_trabajo (
  id_orden INT AUTO_INCREMENT PRIMARY KEY,
  id_motocicleta INT NOT NULL,
  fecha_ingreso DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion_problema TEXT NOT NULL,
  observaciones_ingreso TEXT NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'RECIBIDA',
  fecha_salida DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_estado_orden
    CHECK (estado IN (
      'RECIBIDA','ASIGNADA','EN_DIAGNOSTICO','EN_REPARACION',
      'ESPERANDO_REPUESTOS','REPARACION_TERMINADA','LISTA_PARA_ENTREGA',
      'ENTREGADA','CANCELADA'
    )),
  CONSTRAINT fk_ordenes_moto
    FOREIGN KEY (id_motocicleta) REFERENCES motocicletas(id_motocicleta)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_ordenes_moto (id_motocicleta),
  INDEX idx_ordenes_estado (estado),
  INDEX idx_ordenes_fecha (fecha_ingreso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Repuestos utilizados en una orden de trabajo
-- ------------------------------------------------------------
CREATE TABLE orden_repuestos (
  id_orden_repuesto INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(12,2) NOT NULL,
  costo_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_or_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_or_costo CHECK (costo_unitario >= 0),
  CONSTRAINT fk_or_orden
    FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id_orden)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_or_orden (id_orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Asignación de técnicos a órdenes
-- ------------------------------------------------------------
CREATE TABLE orden_tecnicos (
  id_orden_tecnico INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_tecnico INT NOT NULL,
  fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  asignado_por INT NOT NULL,
  estado_asignacion VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  CONSTRAINT chk_estado_asignacion
    CHECK (estado_asignacion IN ('ACTIVA','FINALIZADA','RETIRADA')),
  CONSTRAINT fk_ot_orden
    FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id_orden)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ot_tecnico
    FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ot_asignado_por
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uk_orden_tecnico_activo (id_orden, id_tecnico),
  INDEX idx_ot_tecnico (id_tecnico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Liquidaciones (se crea antes de mano_obra por la FK opcional)
-- ------------------------------------------------------------
CREATE TABLE liquidaciones_tecnicos (
  id_liquidacion INT AUTO_INCREMENT PRIMARY KEY,
  id_tecnico INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  total_mano_obra DECIMAL(12,2) NOT NULL DEFAULT 0,
  porcentaje_aplicado DECIMAL(5,2) NOT NULL,
  total_pagar DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  liquidado_por INT NOT NULL,
  fecha_liquidacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_estado_liquidacion
    CHECK (estado IN ('PENDIENTE','LIQUIDADA','PAGADA')),
  CONSTRAINT fk_liq_tecnico
    FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_liq_usuario
    FOREIGN KEY (liquidado_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_liq_tecnico (id_tecnico),
  INDEX idx_liq_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Mano de obra
-- ------------------------------------------------------------
CREATE TABLE mano_obra (
  id_mano_obra INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_tecnico INT NOT NULL,
  descripcion TEXT NOT NULL,
  valor_mano_obra DECIMAL(12,2) NOT NULL,
  estado_aprobacion VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  valor_aprobado DECIMAL(12,2) NULL,
  aprobado_por INT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion DATETIME NULL,
  observaciones_jefe TEXT NULL,
  id_liquidacion INT NULL,
  CONSTRAINT chk_valor_mo CHECK (valor_mano_obra > 0),
  CONSTRAINT chk_estado_mo
    CHECK (estado_aprobacion IN ('PENDIENTE','APROBADA','MODIFICADA','RECHAZADA')),
  CONSTRAINT fk_mo_orden
    FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id_orden)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mo_tecnico
    FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mo_aprobado_por
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_mo_liquidacion
    FOREIGN KEY (id_liquidacion) REFERENCES liquidaciones_tecnicos(id_liquidacion)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_mo_orden (id_orden),
  INDEX idx_mo_tecnico (id_tecnico),
  INDEX idx_mo_estado (estado_aprobacion),
  INDEX idx_mo_liquidacion (id_liquidacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Detalle de liquidación (evita pagar dos veces la misma M/O)
-- ------------------------------------------------------------
CREATE TABLE liquidacion_detalles (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_liquidacion INT NOT NULL,
  id_mano_obra INT NOT NULL UNIQUE,
  valor_aplicado DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_ld_liquidacion
    FOREIGN KEY (id_liquidacion) REFERENCES liquidaciones_tecnicos(id_liquidacion)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ld_mano_obra
    FOREIGN KEY (id_mano_obra) REFERENCES mano_obra(id_mano_obra)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Reportes técnicos
-- ------------------------------------------------------------
CREATE TABLE reportes_tecnicos (
  id_reporte INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_tecnico INT NOT NULL,
  diagnostico TEXT NOT NULL,
  tipo_reparacion VARCHAR(80) NOT NULL,
  descripcion_trabajo TEXT NOT NULL,
  recomendaciones TEXT NULL,
  fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_orden
    FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id_orden)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_rt_tecnico
    FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_rt_orden (id_orden),
  INDEX idx_rt_tecnico (id_tecnico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Catálogo de repuestos
-- ------------------------------------------------------------
CREATE TABLE repuestos (
  id_repuesto INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(80) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  costo DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_costo_repuesto CHECK (costo >= 0),
  INDEX idx_repuestos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Repuestos usados en un reporte
-- ------------------------------------------------------------
CREATE TABLE reporte_repuestos (
  id_reporte_repuesto INT AUTO_INCREMENT PRIMARY KEY,
  id_reporte INT NOT NULL,
  id_repuesto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(12,2) NOT NULL,
  costo_total DECIMAL(12,2) NOT NULL,
  CONSTRAINT chk_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_rr_reporte
    FOREIGN KEY (id_reporte) REFERENCES reportes_tecnicos(id_reporte)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rr_repuesto
    FOREIGN KEY (id_repuesto) REFERENCES repuestos(id_repuesto)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Datos iniciales de roles
-- ------------------------------------------------------------
INSERT INTO roles (nombre_rol, descripcion) VALUES
  ('ADMIN', 'Acceso total al sistema'),
  ('JEFE_TALLER', 'Operación del taller: órdenes, aprobación y liquidación'),
  ('TECNICO', 'Trabajo asignado, mano de obra y reportes técnicos');
