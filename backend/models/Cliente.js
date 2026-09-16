const { pool } = require('../config/db');

async function listar() {
  const [filas] = await pool.query(
    'SELECT * FROM clientes ORDER BY id_cliente DESC'
  );
  return filas;
}

async function obtenerPorId(idCliente) {
  const [filas] = await pool.query(
    'SELECT * FROM clientes WHERE id_cliente = :idCliente LIMIT 1',
    { idCliente }
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO clientes
      (nombre, apellido, documento, direccion, telefono, telefono_secundario, email)
     VALUES
      (:nombre, :apellido, :documento, :direccion, :telefono, :telefono_secundario, :email)`,
    datos
  );
  return resultado.insertId;
}

async function actualizar(idCliente, datos) {
  await pool.query(
    `UPDATE clientes SET
      nombre = :nombre,
      apellido = :apellido,
      documento = :documento,
      direccion = :direccion,
      telefono = :telefono,
      telefono_secundario = :telefono_secundario,
      email = :email
     WHERE id_cliente = :idCliente`,
    { ...datos, idCliente }
  );
}

async function eliminar(idCliente) {
  await pool.query('DELETE FROM clientes WHERE id_cliente = :idCliente', { idCliente });
}

async function existeDocumento(documento, excluirId = null) {
  const [filas] = await pool.query(
    `SELECT id_cliente FROM clientes
     WHERE documento = :documento AND (:excluirId IS NULL OR id_cliente <> :excluirId)
     LIMIT 1`,
    { documento, excluirId }
  );
  return filas.length > 0;
}

async function tieneMotocicletas(idCliente) {
  const [filas] = await pool.query(
    'SELECT id_motocicleta FROM motocicletas WHERE id_cliente = :idCliente LIMIT 1',
    { idCliente }
  );
  return filas.length > 0;
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  existeDocumento,
  tieneMotocicletas,
};
