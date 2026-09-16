function $(selector, root = document) {
  return root.querySelector(selector);
}

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function moneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function fecha(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

function fechaCorta(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleDateString('es-CO');
}

function toast(mensaje, tipo = 'ok') {
  const wrap = document.getElementById('toasts');
  const item = document.createElement('div');
  item.className = `toast ${tipo}`;
  item.textContent = mensaje;
  wrap.appendChild(item);
  setTimeout(() => item.remove(), 3800);
}

function abrirModal(html) {
  const overlay = document.getElementById('overlay');
  overlay.className = 'overlay show';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.onclick = (evento) => {
    if (evento.target === overlay) cerrarModal();
  };
}

function cerrarModal() {
  const overlay = document.getElementById('overlay');
  overlay.className = 'overlay';
  overlay.innerHTML = '';
}

function confirmar(mensaje) {
  return new Promise((resolve) => {
    abrirModal(`
      <h3>Confirmar</h3>
      <p>${escapeHtml(mensaje)}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="btnNo">Cancelar</button>
        <button class="btn btn-danger" id="btnSi">Confirmar</button>
      </div>
    `);
    $('#btnNo').onclick = () => { cerrarModal(); resolve(false); };
    $('#btnSi').onclick = () => { cerrarModal(); resolve(true); };
  });
}

function datosFormulario(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function badgeEstadoOrden(estado) {
  const mapa = {
    RECIBIDA: 'b-gray',
    ASIGNADA: 'b-blue',
    EN_DIAGNOSTICO: 'b-purple',
    EN_REPARACION: 'b-orange',
    ESPERANDO_REPUESTOS: 'b-yellow',
    REPARACION_TERMINADA: 'b-teal',
    LISTA_PARA_ENTREGA: 'b-green',
    ENTREGADA: 'b-green',
    CANCELADA: 'b-red',
  };
  return `<span class="badge ${mapa[estado] || 'b-gray'}">${escapeHtml(estado.replaceAll('_', ' '))}</span>`;
}

function badgeMo(estado) {
  const mapa = {
    PENDIENTE: ['b-yellow', 'PENDIENTE DE APROBACIÓN'],
    APROBADA: ['b-green', 'APROBADA'],
    MODIFICADA: ['b-blue', 'MODIFICADA'],
    RECHAZADA: ['b-red', 'RECHAZADA'],
  };
  const [clase, texto] = mapa[estado] || ['b-gray', estado];
  return `<span class="badge ${clase}">${texto}</span>`;
}

const ESTADOS_ORDEN = [
  'RECIBIDA', 'ASIGNADA', 'EN_DIAGNOSTICO', 'EN_REPARACION',
  'ESPERANDO_REPUESTOS', 'REPARACION_TERMINADA', 'LISTA_PARA_ENTREGA',
  'ENTREGADA', 'CANCELADA',
];

const ESTADOS_TECNICO = [
  'EN_DIAGNOSTICO', 'EN_REPARACION', 'ESPERANDO_REPUESTOS',
  'REPARACION_TERMINADA', 'LISTA_PARA_ENTREGA',
];
