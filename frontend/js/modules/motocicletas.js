window.ModuloMotocicletas = {
  async render(root) {
    const [{ datos: motos }, { datos: clientes }] = await Promise.all([
      api('/motocicletas'),
      api('/clientes'),
    ]);
    this.clientes = clientes;
    root.innerHTML = `
      <div class="section-title">
        <input id="buscar" placeholder="Buscar por placa, marca o dueño">
        <button class="btn btn-primary" id="btnNuevo">Nueva motocicleta</button>
      </div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Placa</th><th>Marca</th><th>Modelo</th><th>Color</th><th>Propietario</th><th></th></tr></thead>
          <tbody id="cuerpo">${this.filas(motos)}</tbody>
        </table>
      </div>`;
    this.datos = motos;
    $('#btnNuevo').onclick = () => this.formulario();
    $('#buscar').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      const filtrados = this.datos.filter((m) =>
        `${m.placa} ${m.marca} ${m.modelo} ${m.cliente_nombre} ${m.cliente_apellido}`.toLowerCase().includes(q)
      );
      $('#cuerpo').innerHTML = this.filas(filtrados);
      this.enlazar();
    };
    this.enlazar();
  },

  filas(lista) {
    return lista.map((m) => `
      <tr>
        <td><strong>${escapeHtml(m.placa)}</strong></td>
        <td>${escapeHtml(m.marca)}</td>
        <td>${escapeHtml(m.modelo)}</td>
        <td>${escapeHtml(m.color)}</td>
        <td>${escapeHtml(m.cliente_nombre)} ${escapeHtml(m.cliente_apellido)}</td>
        <td class="actions">
          <button class="btn btn-ghost btn-sm" data-editar="${m.id_motocicleta}">Editar</button>
          <button class="btn btn-danger btn-sm" data-borrar="${m.id_motocicleta}">Eliminar</button>
        </td>
      </tr>`).join('');
  },

  enlazar() {
    document.querySelectorAll('[data-editar]').forEach((btn) => {
      btn.onclick = () => this.formulario(this.datos.find((m) => m.id_motocicleta == btn.dataset.editar));
    });
    document.querySelectorAll('[data-borrar]').forEach((btn) => {
      btn.onclick = async () => {
        if (!await confirmar('¿Eliminar esta motocicleta?')) return;
        try {
          await api(`/motocicletas/${btn.dataset.borrar}`, { method: 'DELETE' });
          toast('Motocicleta eliminada');
          this.render(document.getElementById('contenido'));
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  },

  formulario(moto = null) {
    const opciones = this.clientes.map((c) =>
      `<option value="${c.id_cliente}" ${moto && moto.id_cliente == c.id_cliente ? 'selected' : ''}>
        ${escapeHtml(c.nombre)} ${escapeHtml(c.apellido)} — ${escapeHtml(c.documento)}
      </option>`
    ).join('');
    abrirModal(`
      <h3>${moto ? 'Editar motocicleta' : 'Nueva motocicleta'}</h3>
      <form id="formMoto" class="form-grid two">
        <label>Placa <input name="placa" required value="${escapeHtml(moto?.placa || '')}"></label>
        <label>Marca <input name="marca" required value="${escapeHtml(moto?.marca || '')}"></label>
        <label>Modelo <input name="modelo" required value="${escapeHtml(moto?.modelo || '')}"></label>
        <label>Color <input name="color" required value="${escapeHtml(moto?.color || '')}"></label>
        <label style="grid-column:1/-1">Propietario <select name="id_cliente" required>${opciones}</select></label>
        <div class="modal-actions" style="grid-column:1/-1">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#formMoto').onsubmit = async (evento) => {
      evento.preventDefault();
      const body = JSON.stringify(datosFormulario(evento.target));
      try {
        if (moto) await api(`/motocicletas/${moto.id_motocicleta}`, { method: 'PUT', body });
        else await api('/motocicletas', { method: 'POST', body });
        toast('Motocicleta guardada');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
