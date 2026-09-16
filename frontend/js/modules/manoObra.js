window.ModuloManoObra = {
  async render(root) {
    const { datos } = await api('/mano-obra');
    this.datos = datos;
    const puedeRegistrar = Auth.puede('TECNICO', 'ADMIN');
    const puedeAprobar = Auth.puede('ADMIN', 'JEFE_TALLER');
    let totalesHtml = '';
    if (Auth.usuario().id_tecnico) {
      const { datos: tot } = await api(`/mano-obra/totales/${Auth.usuario().id_tecnico}`);
      totalesHtml = `
        <div class="cards">
          <article class="card stat ok"><div class="label">Total M/O aprobada</div><div class="value">${moneda(tot.total_mo_aprobada)}</div></article>
          <article class="card stat orange"><div class="label">Total a pagar</div><div class="value">${moneda(tot.total_a_pagar)}</div></article>
        </div>`;
    }

    root.innerHTML = `
      ${totalesHtml}
      <div class="section-title">
        <p class="muted">Los registros nuevos quedan en <strong>PENDIENTE DE APROBACIÓN</strong>.</p>
        ${puedeRegistrar ? '<button class="btn btn-primary" id="btnNueva">Registrar mano de obra</button>' : ''}
      </div>
      <div class="card table-wrap">
        <table>
          <thead>
            <tr><th>Fecha</th><th>Placa</th><th>Técnico</th><th>Descripción</th><th>Valor</th><th>Aprobado</th><th>Estado</th>${puedeAprobar ? '<th></th>' : ''}</tr>
          </thead>
          <tbody>
            ${datos.map((m) => `
              <tr>
                <td>${fecha(m.fecha_registro)}</td>
                <td>${escapeHtml(m.placa)}</td>
                <td>${escapeHtml(m.tecnico_nombre)} ${escapeHtml(m.tecnico_apellido)}</td>
                <td>${escapeHtml(m.descripcion)}</td>
                <td>${moneda(m.valor_mano_obra)}</td>
                <td>${m.valor_aprobado ? moneda(m.valor_aprobado) : '—'}</td>
                <td>${badgeMo(m.estado_aprobacion)}</td>
                ${puedeAprobar && m.estado_aprobacion === 'PENDIENTE' ? `
                  <td class="actions">
                    <button class="btn btn-ok btn-sm" data-acc="aprobar" data-id="${m.id_mano_obra}">Aprobar</button>
                    <button class="btn btn-warn btn-sm" data-acc="modificar" data-id="${m.id_mano_obra}">Modificar</button>
                    <button class="btn btn-danger btn-sm" data-acc="rechazar" data-id="${m.id_mano_obra}">Rechazar</button>
                  </td>` : (puedeAprobar ? '<td></td>' : '')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    if (puedeRegistrar) $('#btnNueva').onclick = () => this.registrar();
    root.querySelectorAll('[data-acc]').forEach((btn) => {
      btn.onclick = () => this.decidir(btn.dataset.id, btn.dataset.acc);
    });
  },

  async registrar() {
    const { datos: ordenes } = await api('/ordenes');
    if (!ordenes.length) {
      toast('No tiene órdenes asignadas', 'err');
      return;
    }
    abrirModal(`
      <h3>Registrar mano de obra</h3>
      <form id="formMo" class="form-grid">
        <label>Motocicleta / orden
          <select name="id_orden" required>
            ${ordenes.map((o) => `<option value="${o.id_orden}">${escapeHtml(o.placa)} — Orden #${o.id_orden}</option>`).join('')}
          </select>
        </label>
        <label>Descripción del trabajo <textarea name="descripcion" required></textarea></label>
        <label>Valor de mano de obra <input type="number" min="1" step="1" name="valor_mano_obra" required></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#formMo').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api('/mano-obra', { method: 'POST', body: JSON.stringify(datosFormulario(evento.target)) });
        toast('Mano de obra registrada');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  decidir(id, accion) {
    const extra = accion === 'modificar'
      ? '<label>Nuevo valor aprobado <input type="number" min="1" name="valor_aprobado" required></label>'
      : '';
    const obsReq = accion !== 'aprobar' ? 'required' : '';
    abrirModal(`
      <h3>${accion.toUpperCase()} mano de obra</h3>
      <form id="formDec" class="form-grid">
        ${extra}
        <label>Observaciones del jefe <textarea name="observaciones_jefe" ${obsReq}></textarea></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Confirmar</button>
        </div>
      </form>
    `);
    $('#formDec').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api(`/mano-obra/${id}/${accion}`, { method: 'PATCH', body: JSON.stringify(datosFormulario(evento.target)) });
        toast('Decisión registrada');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
