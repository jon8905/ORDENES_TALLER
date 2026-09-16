require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, verificarConexion } = require('../config/db');

async function seed() {
  await verificarConexion();

  const [roles] = await pool.query('SELECT id_rol, nombre_rol FROM roles');
  const mapaRoles = Object.fromEntries(roles.map((r) => [r.nombre_rol, r.id_rol]));

  if (!mapaRoles.ADMIN) {
    throw new Error('Ejecute primero database/taller_motocicletas.sql');
  }

  const claveAdmin = await bcrypt.hash('Admin123!', 10);
  const claveJefe = await bcrypt.hash('Jefe123!', 10);
  const claveTecnico = await bcrypt.hash('Tecnico123!', 10);

  async function upsertUsuario(datos) {
    const [existente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = :email LIMIT 1',
      { email: datos.email }
    );
    if (existente[0]) return existente[0].id_usuario;
    const [resultado] = await pool.query(
      `INSERT INTO usuarios
        (nombre, apellido, documento, direccion, telefono, email, password, id_rol, activo)
       VALUES
        (:nombre, :apellido, :documento, :direccion, :telefono, :email, :password, :id_rol, 1)`,
      datos
    );
    return resultado.insertId;
  }

  const idAdmin = await upsertUsuario({
    nombre: 'Ana',
    apellido: 'Ríos',
    documento: '10000001',
    direccion: 'Oficina principal',
    telefono: '3001111111',
    email: 'admin@taller.com',
    password: claveAdmin,
    id_rol: mapaRoles.ADMIN,
  });

  await upsertUsuario({
    nombre: 'Carlos',
    apellido: 'Mendoza',
    documento: '10000002',
    direccion: 'Taller',
    telefono: '3002222222',
    email: 'jefe@taller.com',
    password: claveJefe,
    id_rol: mapaRoles.JEFE_TALLER,
  });

  const idTecnicoUsuario = await upsertUsuario({
    nombre: 'Luis',
    apellido: 'Pérez',
    documento: '10000003',
    direccion: 'Taller',
    telefono: '3003333333',
    email: 'tecnico@taller.com',
    password: claveTecnico,
    id_rol: mapaRoles.TECNICO,
  });

  const [tecnico] = await pool.query(
    'SELECT id_tecnico FROM tecnicos WHERE id_usuario = :id LIMIT 1',
    { id: idTecnicoUsuario }
  );
  let idTecnico = tecnico[0] && tecnico[0].id_tecnico;
  if (!idTecnico) {
    const [ins] = await pool.query(
      'INSERT INTO tecnicos (id_usuario, porcentaje_mano_obra, activo) VALUES (:id, 50, 1)',
      { id: idTecnicoUsuario }
    );
    idTecnico = ins.insertId;
  }

  const [clienteExistente] = await pool.query(
    "SELECT id_cliente FROM clientes WHERE documento = '1098765432' LIMIT 1"
  );
  let idCliente = clienteExistente[0] && clienteExistente[0].id_cliente;
  if (!idCliente) {
    const [ins] = await pool.query(
      `INSERT INTO clientes
        (nombre, apellido, documento, direccion, telefono, telefono_secundario, email)
       VALUES
        ('María', 'Gómez', '1098765432', 'Cra 15 # 8-20', '3105556677', '6014445566', 'maria@correo.com')`
    );
    idCliente = ins.insertId;
  }

  const [motoExistente] = await pool.query(
    "SELECT id_motocicleta FROM motocicletas WHERE placa = 'ABC12D' LIMIT 1"
  );
  let idMoto = motoExistente[0] && motoExistente[0].id_motocicleta;
  if (!idMoto) {
    const [ins] = await pool.query(
      `INSERT INTO motocicletas (placa, marca, modelo, color, id_cliente)
       VALUES ('ABC12D', 'Yamaha', 'FZ 2.0', 'Negro', :idCliente)`,
      { idCliente }
    );
    idMoto = ins.insertId;
  }

  const [repuestos] = await pool.query('SELECT COUNT(*) AS total FROM repuestos');
  if (Number(repuestos[0].total) === 0) {
    await pool.query(
      `INSERT INTO repuestos (marca, nombre, descripcion, costo) VALUES
        ('Yamaha', 'Filtro de aceite', 'Filtro original', 35000),
        ('NGK', 'Bujía CR8E', 'Bujía de iridio', 28000),
        ('Michelin', 'Llanta 110/70-17', 'Llanta delantera', 280000)`
    );
  }

  const [ordenExistente] = await pool.query(
    'SELECT id_orden FROM ordenes_trabajo WHERE id_motocicleta = :idMoto LIMIT 1',
    { idMoto }
  );
  if (!ordenExistente[0] && idTecnico) {
    const [orden] = await pool.query(
      `INSERT INTO ordenes_trabajo
        (id_motocicleta, descripcion_problema, observaciones_ingreso, estado)
       VALUES
        (:idMoto, 'Ruido en el motor y pérdida de potencia', 'Cliente reporta el síntoma desde hace una semana', 'ASIGNADA')`,
      { idMoto }
    );
    const [jefe] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = 'jefe@taller.com' LIMIT 1"
    );
    await pool.query(
      `INSERT INTO orden_tecnicos (id_orden, id_tecnico, asignado_por, estado_asignacion)
       VALUES (:idOrden, :idTecnico, :asignadoPor, 'ACTIVA')`,
      {
        idOrden: orden.insertId,
        idTecnico,
        asignadoPor: jefe[0] ? jefe[0].id_usuario : idAdmin,
      }
    );
  }

  console.log('Semilla completada.');
  console.log('Usuarios de prueba:');
  console.log('  ADMIN        admin@taller.com    / Admin123!');
  console.log('  JEFE_TALLER  jefe@taller.com     / Jefe123!');
  console.log('  TECNICO      tecnico@taller.com  / Tecnico123!');
  console.log(`Usuario admin id: ${idAdmin}, técnico id: ${idTecnico}, moto ${idMoto}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en semilla:', err.message);
  process.exit(1);
});
