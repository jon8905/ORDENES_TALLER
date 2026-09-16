window.ModuloLiquidaciones = {
  async render(root) {
    const { datos } = await api('/liquidaciones');
    const puedeLiquidar = Auth.puede('ADMIN', 'JEFE_TALLER');
    root.innerHTML = `
      ${puedeLiquidar ? `<div class="section-title"><button class="btn btn-primary" id="btnNueva">Nueva liquidación</button></div>` : '<p class="muted">Se muestran las últimas 4 liquidaciones.</p>'}
      <div class="card table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Técnico</th><th>Período</th><th>M/O</th><th>%</th><th>Total pagar</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            ${datos.map((l) => `
              <tr>
                <td>${l.id_liquidacion}</td>
                <td>${escapeHtml(l.tecnico_nombre)} ${escapeHtml(l.tecnico_apellido)}</td>
                <td>${fechaCorta(l.fecha_inicio)} — ${fechaCorta(l.fecha_fin)}</td>
                <td>${moneda(l.total_mano_obra)}</td>
                <td>${l.porcentaje_aplicado}%</td>
                <td><strong>${moneda(l.total_pagar)}</strong></td>
                <td><span class="badge ${l.estado === 'PAGADA' ? 'b-green' : l.estado === 'LIQUIDADA' ? 'b-blue' : 'b-yellow'}">${l.estado}</span></td>
                <td class="actions">
                  <button class="btn btn-teal btn-sm" data-pdf="${l.id_liquidacion}">PDF</button>
                  ${puedeLiquidar && l.estado !== 'PAGADA' ? `<button class="btn btn-ok btn-sm" data-pagar="${l.id_liquidacion}">Marcar pagada</button>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    if (puedeLiquidar) $('#btnNueva').onclick = () => this.nueva();
    root.querySelectorAll('[data-pdf]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          const blob = await api(`/liquidaciones/${btn.dataset.pdf}/pdf`);
          descargarPdf(blob);
        } catch (err) { toast(err.message, 'err'); }
      };
    });
    root.querySelectorAll('[data-pagar]').forEach((btn) => {
      btn.onclick = async () => {
        if (!await confirmar('¿Marcar esta liquidación como pagada?')) return;
        try {
          await api(`/liquidaciones/${btn.dataset.pagar}/pagar`, { method: 'PATCH' });
          toast('Liquidación pagada');
          this.render(root);
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  },

  async nueva() {
    const { datos: tecnicos } = await api('/tecnicos?activos=1');
    abrirModal(`
      <h3>Liquidar técnico</h3>
      <form id="formLiq" class="form-grid two">
        <label style="grid-column:1/-1">Técnico
          <select name="id_tecnico" required>
            ${tecnicos.map((t) => `<option value="${t.id_tecnico}">${escapeHtml(t.nombre)} ${escapeHtml(t.apellido)} (${t.porcentaje_mano_obra}%)</option>`).join('')}
          </select>
        </label>
        <label>Fecha inicial <input type="date" name="fecha_inicio" required></label>
        <label>Fecha final <input type="date" name="fecha_fin" required></label>
        <div class="modal-actions" style="grid-column:1/-1">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button type="button" class="btn btn-ghost" id="btnCalc">Calcular</button>
          <button class="btn btn-primary">Liquidar</button>
        </div>
      </form>
      <div id="preview"></div>
    `);

    $('#btnCalc').onclick = async () => {
      const f = datosFormulario($('#formLiq'));
      try {
        const { datos } = await api(`/liquidaciones/calcular?id_tecnico=${f.id_tecnico}&fecha_inicio=${f.fecha_inicio}&fecha_fin=${f.fecha_fin}`);
        $('#preview').innerHTML = `
          <div class="card" style="margin-top:12px">
            <p>${datos.registros.length} registros · M/O ${moneda(datos.total_mano_obra)} · ${datos.porcentaje_aplicado}% · <strong>${moneda(datos.total_pagar)}</strong></p>
          </div>`;
      } catch (err) { toast(err.message, 'err'); }
    };

    $('#formLiq').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api('/liquidaciones', { method: 'POST', body: JSON.stringify(datosFormulario(evento.target)) });
        toast('Liquidación generada');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
