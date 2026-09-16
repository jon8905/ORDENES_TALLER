window.ModuloTecnicos = {
  async render(root) {
    const { datos } = await api('/tecnicos');
    const esAdmin = Auth.puede('ADMIN');
    root.innerHTML = `
      <p class="muted">Los técnicos se crean desde Usuarios con rol TECNICO. El porcentaje (40%–70%) solo lo modifica el administrador.</p>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Técnico</th><th>Documento</th><th>Email</th><th>Porcentaje</th><th>Estado</th>${esAdmin ? '<th></th>' : ''}</tr></thead>
          <tbody>
            ${datos.map((t) => `
              <tr>
                <td>${escapeHtml(t.nombre)} ${escapeHtml(t.apellido)}</td>
                <td>${escapeHtml(t.documento)}</td>
                <td>${escapeHtml(t.email)}</td>
                <td><strong>${t.porcentaje_mano_obra}%</strong></td>
                <td>${t.activo ? '<span class="badge b-green">ACTIVO</span>' : '<span class="badge b-red">INACTIVO</span>'}</td>
                ${esAdmin ? `<td><button class="btn btn-ghost btn-sm" data-id="${t.id_tecnico}" data-p="${t.porcentaje_mano_obra}">Editar %</button></td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    root.querySelectorAll('[data-id]').forEach((btn) => {
      btn.onclick = () => this.editar(btn.dataset.id, btn.dataset.p, root);
    });
  },

  editar(id, actual, root) {
    abrirModal(`
      <h3>Porcentaje de mano de obra</h3>
      <form id="formPorc" class="form-grid">
        <label>Porcentaje
          <select name="porcentaje_mano_obra">
            ${[40, 45, 50, 55, 60, 65, 70].map((p) =>
              `<option value="${p}" ${Number(actual) === p ? 'selected' : ''}>${p}%</option>`).join('')}
          </select>
        </label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#formPorc').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api(`/tecnicos/${id}/porcentaje`, {
          method: 'PATCH',
          body: JSON.stringify(datosFormulario(evento.target)),
        });
        toast('Porcentaje actualizado');
        cerrarModal();
        this.render(root);
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
