const API_BASE = (function () {
  if (window.API_URL) return window.API_URL.replace(/\/$/, '');
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (local) {
    return location.port === '3000' ? '/api' : 'http://localhost:3000/api';
  }
  return '/api';
})();

async function api(ruta, opciones = {}) {
  const headers = { ...(opciones.headers || {}) };
  if (!(opciones.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('taller_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });
  const tipo = respuesta.headers.get('content-type') || '';

  if (tipo.includes('application/pdf')) {
    if (!respuesta.ok) throw new Error('No se pudo generar el PDF');
    return respuesta.blob();
  }

  const cuerpo = await respuesta.json();
  if (!respuesta.ok || cuerpo.exito === false) {
    if (respuesta.status === 401) {
      localStorage.removeItem('taller_token');
      localStorage.removeItem('taller_usuario');
      if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
        location.href = 'index.html';
      }
    }
    throw new Error(cuerpo.mensaje || 'Error en la solicitud');
  }
  return cuerpo;
}

function descargarPdf(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
