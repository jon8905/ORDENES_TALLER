const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function campoObligatorio(valor, nombre) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    throw new Error(`El campo ${nombre} es obligatorio`);
  }
}

function validarEmail(email) {
  if (!EMAIL_REGEX.test(String(email).trim())) {
    throw new Error('El correo electrónico no es válido');
  }
}

function validarPorcentaje(porcentaje) {
  const valor = Number(porcentaje);
  if (Number.isNaN(valor) || valor < 40 || valor > 70) {
    throw new Error('El porcentaje de mano de obra debe estar entre 40 y 70');
  }
  return valor;
}

function validarMonto(monto, nombre = 'valor') {
  const valor = Number(monto);
  if (Number.isNaN(valor) || valor <= 0) {
    throw new Error(`El ${nombre} debe ser un número positivo`);
  }
  return Number(valor.toFixed(2));
}

function normalizarPlaca(placa) {
  return String(placa || '').trim().toUpperCase().replace(/\s+/g, '');
}

function esRol(nombre) {
  return ['ADMIN', 'JEFE_TALLER', 'TECNICO'].includes(nombre);
}

const ESTADOS_ORDEN = [
  'RECIBIDA',
  'ASIGNADA',
  'EN_DIAGNOSTICO',
  'EN_REPARACION',
  'ESPERANDO_REPUESTOS',
  'REPARACION_TERMINADA',
  'LISTA_PARA_ENTREGA',
  'ENTREGADA',
  'CANCELADA',
];

const ESTADOS_TECNICO = [
  'EN_DIAGNOSTICO',
  'EN_REPARACION',
  'ESPERANDO_REPUESTOS',
  'REPARACION_TERMINADA',
  'LISTA_PARA_ENTREGA',
];

function validarEstadoOrden(estado, rol = null) {
  const permitidos = rol === 'TECNICO' ? ESTADOS_TECNICO : ESTADOS_ORDEN;
  if (!permitidos.includes(estado)) {
    throw new Error('Estado de orden no válido');
  }
  return estado;
}

module.exports = {
  campoObligatorio,
  validarEmail,
  validarPorcentaje,
  validarMonto,
  normalizarPlaca,
  esRol,
  ESTADOS_ORDEN,
  ESTADOS_TECNICO,
  validarEstadoOrden,
};
