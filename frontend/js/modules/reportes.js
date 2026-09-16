window.ModuloReportes = {
  async render(root) {
    this.root = root;
    const puedeBuscar = Auth.puede('ADMIN', 'JEFE_TALLER');
    const { datos } = await api('/reportes');
    this.pintar(root, datos, puedeBuscar);
  },

  pintar(root, datos, puedeBuscar) {
    root.innerHTML = `
      <div class="section-title">
        <p class="muted">Cada reporte queda ligado a la orden y al técnico.</p>
        <div class="acciones-fila">
          ${puedeBuscar ? `
            <form id="formBuscarReporte" class="busqueda-inline">
              <input id="inputPlacaReporte" name="placa" placeholder="Buscar por placa" autocomplete="off">
              <button class="btn btn-teal" type="submit">Buscar</button>
            </form>
          ` : ''}
          <button class="btn btn-primary" id="btnNuevo" type="button">Nuevo reporte</button>
        </div>
      </div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Placa</th><th>Técnico</th><th>Tipo</th><th>Diagnóstico</th><th></th></tr></thead>
          <tbody id="cuerpoReportes">${this.filas(datos)}</tbody>
        </table>
      </div>`;
    $('#btnNuevo').onclick = () => this.nuevo();
    this.enlazarPdf(root);
    if (puedeBuscar) {
      $('#formBuscarReporte').onsubmit = async (evento) => {
        evento.preventDefault();
        await this.buscar($('#inputPlacaReporte').value);
      };
    }
  },

  filas(datos) {
    if (!datos.length) {
      return '<tr><td colspan="6" class="muted">No se encontraron reportes.</td></tr>';
    }
    return datos.map((r) => `
      <tr>
        <td>${fecha(r.fecha_reporte)}</td>
        <td>${escapeHtml(r.placa)}</td>
        <td>${escapeHtml(r.tecnico_nombre)} ${escapeHtml(r.tecnico_apellido)}</td>
        <td>${escapeHtml(r.tipo_reparacion)}</td>
        <td>${escapeHtml((r.diagnostico || '').slice(0, 70))}</td>
        <td class="actions">
          <button class="btn btn-teal btn-sm" data-pdf="${r.id_reporte}">PDF</button>
        </td>
      </tr>`).join('');
  },

  enlazarPdf(root) {
    root.querySelectorAll('[data-pdf]').forEach((btn) => {
      btn.onclick = () => this.pdf(btn.dataset.pdf);
    });
  },

  async buscar(placa) {
    const cuerpo = $('#cuerpoReportes');
    const valor = (placa || '').trim();
    cuerpo.innerHTML = '<tr><td colspan="6" class="muted">Buscando...</td></tr>';
    try {
      const ruta = valor ? `/reportes?placa=${encodeURIComponent(valor)}` : '/reportes';
      const { datos } = await api(ruta);
      cuerpo.innerHTML = this.filas(datos);
      this.enlazarPdf(this.root);
    } catch (err) {
      cuerpo.innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
    }
  },

  async nuevo() {
    const { datos: ordenes } = await api('/ordenes');
    abrirModal(`
      <h3>Reporte técnico</h3>
      <form id="formRep" class="form-grid">
        <label>Orden / placa
          <select name="id_orden" required>
            ${ordenes.map((o) => `<option value="${o.id_orden}">${escapeHtml(o.placa)} — #${o.id_orden}</option>`).join('')}
          </select>
        </label>
        <label>Tipo de reparación <input name="tipo_reparacion" required placeholder="Motor, frenos, eléctrica..."></label>
        <label>Diagnóstico <textarea name="diagnostico" required></textarea></label>
        <label>Trabajo realizado <textarea name="descripcion_trabajo" required></textarea></label>
        <label>Recomendaciones <textarea name="recomendaciones"></textarea></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#formRep').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api('/reportes', { method: 'POST', body: JSON.stringify(datosFormulario(evento.target)) });
        toast('Reporte creado');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  async pdf(id) {
    try {
      const blob = await api(`/reportes/${id}/pdf`);
      descargarPdf(blob, `reporte-${id}.pdf`);
    } catch (err) { toast(err.message, 'err'); }
  },
};
