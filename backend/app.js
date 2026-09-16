require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { verificarConexion } = require('./config/db');
const { error } = require('./utils/respuestas');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const motocicletaRoutes = require('./routes/motocicletaRoutes');
const ordenRoutes = require('./routes/ordenRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const manoObraRoutes = require('./routes/manoObraRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const repuestoRoutes = require('./routes/repuestoRoutes');
const historialRoutes = require('./routes/historialRoutes');
const liquidacionRoutes = require('./routes/liquidacionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const puerto = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/motocicletas', motocicletaRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/mano-obra', manoObraRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/repuestos', repuestoRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/liquidaciones', liquidacionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/salud', (_req, res) => {
  res.json({ exito: true, mensaje: 'API Taller Motocicletas en línea' });
});

app.use('/api', (_req, res) => error(res, 'Ruta no encontrada', 404));

app.use((err, _req, res, _next) => {
  console.error(err);
  return error(res, err.message || 'Error interno del servidor', 500);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

verificarConexion()
  .then(() => {
    app.listen(puerto, () => {
      console.log(`Servidor listo en http://localhost:${puerto}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  });
