window.ModuloRepuestos = {
  async render(root) {
    const { datos } = await api('/repuestos');
    const puedeEditar = Auth.puede('ADMIN', 'JEFE_TALLER');
    root.innerHTML = `
      <div class="section-title">
        <p class="muted">Catálogo de repuestos disponibles para asociar a reportes.</p>
        ${puedeEditar ? '<button class="btn btn-primary" id="btnNuevo">Nuevo repuesto</button>' : ''}
      </div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Marca</th><th>Nombre</th><th>Descripción</th><th>Costo</th>${puedeEditar ? '<th></th>' : ''}</tr></thead>
          <tbody>
            ${datos.map((r) => `
              <tr>
                <td>${escapeHtml(r.marca)}</td>
                <td>${escapeHtml(r.nombre)}</td>
                <td>${escapeHtml(r.descripcion || '—')}</td>
                <td>${moneda(r.costo)}</td>
                ${puedeEditar ? `<td class="actions">
                  <button class="btn btn-ghost btn-sm" data-editar="${r.id_repuesto}">Editar</button>
                  <button class="btn btn-danger btn-sm" data-borrar="${r.id_repuesto}">Eliminar</button>
                </td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    this.datos = datos;
    if (puedeEditar) {
      $('#btnNuevo').onclick = () => this.formulario();
      root.querySelectorAll('[data-editar]').forEach((btn) => {
        btn.onclick = () => this.formulario(datos.find((r) => r.id_repuesto == btn.dataset.editar));
      });
      root.querySelectorAll('[data-borrar]').forEach((btn) => {
        btn.onclick = async () => {
          if (!await confirmar('¿Eliminar este repuesto del catálogo?')) return;
          try {
            await api(`/repuestos/${btn.dataset.borrar}`, { method: 'DELETE' });
            toast('Repuesto eliminado');
            this.render(root);
          } catch (err) { toast(err.message, 'err'); }
        };
      });
    }
  },

  formulario(item = null) {
    abrirModal(`
      <h3>${item ? 'Editar repuesto' : 'Nuevo repuesto'}</h3>
      <form id="formRp" class="form-grid">
        <label>Marca <input name="marca" required value="${escapeHtml(item?.marca || '')}"></label>
        <label>Nombre <input name="nombre" required value="${escapeHtml(item?.nombre || '')}"></label>
        <label>Descripción <textarea name="descripcion">${escapeHtml(item?.descripcion || '')}</textarea></label>
        <label>Costo <input type="number" min="0" step="1" name="costo" required value="${item?.costo || 0}"></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#formRp').onsubmit = async (evento) => {
      evento.preventDefault();
      const body = JSON.stringify(datosFormulario(evento.target));
      try {
        if (item) await api(`/repuestos/${item.id_repuesto}`, { method: 'PUT', body });
        else await api('/repuestos', { method: 'POST', body });
        toast('Repuesto guardado');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
