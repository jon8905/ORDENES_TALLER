const MENU = [
  { hash: 'dashboard', titulo: 'Dashboard', roles: ['ADMIN', 'JEFE_TALLER', 'TECNICO'] },
  { hash: 'usuarios', titulo: 'Usuarios', roles: ['ADMIN'] },
  { hash: 'tecnicos', titulo: 'Técnicos', roles: ['ADMIN', 'JEFE_TALLER'] },
  { hash: 'clientes', titulo: 'Clientes', roles: ['ADMIN', 'JEFE_TALLER'] },
  { hash: 'ordenes', titulo: 'Órdenes de trabajo', roles: ['ADMIN', 'JEFE_TALLER', 'TECNICO'] },
  { hash: 'mano-obra', titulo: 'Mano de obra', roles: ['ADMIN', 'JEFE_TALLER', 'TECNICO'] },
  { hash: 'reportes', titulo: 'Reportes técnicos', roles: ['ADMIN', 'JEFE_TALLER', 'TECNICO'] },
  { hash: 'historial', titulo: 'Historial', roles: ['ADMIN', 'JEFE_TALLER'] },
  { hash: 'liquidaciones', titulo: 'Liquidaciones', roles: ['ADMIN', 'JEFE_TALLER', 'TECNICO'] },
];

const MODULOS = {
  dashboard: window.ModuloDashboard,
  usuarios: window.ModuloUsuarios,
  tecnicos: window.ModuloTecnicos,
  clientes: window.ModuloClientes,
  motocicletas: window.ModuloMotocicletas,
  ordenes: window.ModuloOrdenes,
  'mano-obra': window.ModuloManoObra,
  reportes: window.ModuloReportes,
  repuestos: window.ModuloRepuestos,
  historial: window.ModuloHistorial,
  liquidaciones: window.ModuloLiquidaciones,
};

function pintarSidebar() {
  const rol = Auth.rol();
  const items = MENU.filter((item) => item.roles.includes(rol))
    .map((item) => `<a href="#/${item.hash}" data-hash="${item.hash}">${item.titulo}</a>`)
    .join('');

  document.getElementById('sidebar').innerHTML = `
    <div class="logo">
      <div class="brand-mark">ClinimotosJJ</div>
      <div>
        <span>Gestión de motocicletas</span>
      </div>
    </div>
    <nav class="menu">${items}</nav>
    <div class="sidebar-foot">
      <button class="btn btn-ghost btn-block" id="btnSalir" type="button">Cerrar sesión</button>
    </div>
  `;
  document.getElementById('btnSalir').onclick = () => Auth.salir();
}

function actualizarUsuario() {
  const usuario = Auth.usuario();
  document.getElementById('nombreUsuario').textContent = `${usuario.nombre} ${usuario.apellido}`;
  document.getElementById('rolUsuario').textContent = usuario.rol.replaceAll('_', ' ');
  document.getElementById('avatarUsuario').textContent = usuario.nombre.charAt(0);
}

async function navegar() {
  if (!Auth.token() || !Auth.usuario()) {
    Auth.salir();
    return;
  }

  const hash = (location.hash.replace('#/', '') || 'dashboard');
  if (hash === 'motocicletas') {
    location.hash = '#/clientes';
    return;
  }
  const item = MENU.find((m) => m.hash === hash);
  if (!item || !item.roles.includes(Auth.rol())) {
    location.hash = '#/dashboard';
    return;
  }

  document.getElementById('tituloPagina').textContent = item.titulo;
  document.querySelectorAll('.menu a').forEach((enlace) => {
    enlace.classList.toggle('active', enlace.dataset.hash === hash);
  });
  document.getElementById('sidebar').classList.remove('open');

  const modulo = MODULOS[hash];
  const root = document.getElementById('contenido');
  root.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    await modulo.render(root);
  } catch (err) {
    root.innerHTML = `<div class="card"><p>${escapeHtml(err.message)}</p></div>`;
    toast(err.message, 'err');
  }
}

document.getElementById('btnMenu').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};

pintarSidebar();
actualizarUsuario();
window.addEventListener('hashchange', navegar);
navegar();
