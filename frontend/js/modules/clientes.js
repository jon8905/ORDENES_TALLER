window.ModuloClientes = {
  async render(root) {
    const { datos } = await api('/clientes');
    this.datos = datos;
    this.root = root;
    root.innerHTML = `
      <div class="section-title">
        <div>
          <p class="muted" style="margin:0">El cliente es el dueño. Cada motocicleta queda ligada a él y no se duplica el nombre del propietario.</p>
        </div>
        <div class="toolbar" style="margin:0">
          <input id="buscar" placeholder="Buscar cliente, documento o placa">
          <button class="btn btn-primary" id="btnNuevo">Nuevo cliente</button>
        </div>
      </div>
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th><th>Documento</th><th>Teléfono</th><th>Motocicletas</th><th></th>
            </tr>
          </thead>
          <tbody id="cuerpo">${this.filas(datos)}</tbody>
        </table>
      </div>`;
    $('#btnNuevo').onclick = () => this.formularioCliente();
    $('#buscar').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      const filtrados = this.datos.filter((c) => {
        const motos = (c.motocicletas || []).map((m) => m.placa).join(' ');
        return `${c.nombre} ${c.apellido} ${c.documento} ${c.telefono} ${motos}`.toLowerCase().includes(q);
      });
      $('#cuerpo').innerHTML = this.filas(filtrados);
      this.enlazarLista();
    };
    this.enlazarLista();
  },

  filas(lista) {
    return lista.map((c) => {
      const motos = c.motocicletas || [];
      const placas = motos.length
        ? motos.map((m) => `<span class="badge b-orange">${escapeHtml(m.placa)}</span>`).join(' ')
        : '<span class="muted">Sin motos</span>';
      return `
        <tr>
          <td><strong>${escapeHtml(c.nombre)} ${escapeHtml(c.apellido)}</strong></td>
          <td>${escapeHtml(c.documento)}</td>
          <td>${escapeHtml(c.telefono)}</td>
          <td>${placas}</td>
          <td class="actions">
            <button class="btn btn-teal btn-sm" data-ver="${c.id_cliente}">Ver motos</button>
            <button class="btn btn-ghost btn-sm" data-editar="${c.id_cliente}">Editar</button>
            <button class="btn btn-danger btn-sm" data-borrar="${c.id_cliente}">Eliminar</button>
          </td>
        </tr>`;
    }).join('');
  },

  enlazarLista() {
    document.querySelectorAll('[data-ver]').forEach((btn) => {
      btn.onclick = () => this.detalle(btn.dataset.ver);
    });
    document.querySelectorAll('[data-editar]').forEach((btn) => {
      btn.onclick = () => this.formularioCliente(this.datos.find((c) => c.id_cliente == btn.dataset.editar));
    });
    document.querySelectorAll('[data-borrar]').forEach((btn) => {
      btn.onclick = async () => {
        if (!await confirmar('¿Eliminar este cliente? Solo es posible si no tiene motocicletas.')) return;
        try {
          await api(`/clientes/${btn.dataset.borrar}`, { method: 'DELETE' });
          toast('Cliente eliminado');
          this.render(this.root);
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  },

  formularioCliente(cliente = null) {
    const esNuevo = !cliente;
    abrirModal(`
      <h3>${esNuevo ? 'Nuevo cliente' : 'Editar cliente'}</h3>
      <form id="formCliente" class="form-grid two">
        <p class="muted" style="grid-column:1/-1;margin:0">Datos del propietario</p>
        <label>Nombre <input name="nombre" required value="${escapeHtml(cliente?.nombre || '')}"></label>
        <label>Apellido <input name="apellido" required value="${escapeHtml(cliente?.apellido || '')}"></label>
        <label>Documento <input name="documento" required value="${escapeHtml(cliente?.documento || '')}"></label>
        <label>Teléfono <input name="telefono" required value="${escapeHtml(cliente?.telefono || '')}"></label>
        <label>Teléfono secundario <input name="telefono_secundario" value="${escapeHtml(cliente?.telefono_secundario || '')}"></label>
        <label>Email <input type="email" name="email" value="${escapeHtml(cliente?.email || '')}"></label>
        <label style="grid-column:1/-1">Dirección <input name="direccion" value="${escapeHtml(cliente?.direccion || '')}"></label>
        ${esNuevo ? `
          <p class="muted" style="grid-column:1/-1;margin:8px 0 0">Motocicleta (opcional). Si la registra ahora, queda asociada a este cliente.</p>
          <label>Placa <input name="placa" placeholder="Ej. ABC12D"></label>
          <label>Marca <input name="marca"></label>
          <label>Modelo <input name="modelo"></label>
          <label>Color <input name="color"></label>
        ` : ''}
        <div class="modal-actions" style="grid-column:1/-1">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#formCliente').onsubmit = async (evento) => {
      evento.preventDefault();
      const datos = datosFormulario(evento.target);
      if (esNuevo && datos.placa && (!datos.marca || !datos.modelo || !datos.color)) {
        toast('Si registra una placa, complete marca, modelo y color', 'err');
        return;
      }
      try {
        if (cliente) {
          await api(`/clientes/${cliente.id_cliente}`, { method: 'PUT', body: JSON.stringify(datos) });
          toast('Cliente actualizado');
        } else {
          await api('/clientes', { method: 'POST', body: JSON.stringify(datos) });
          toast(datos.placa ? 'Cliente y motocicleta registrados' : 'Cliente guardado');
        }
        cerrarModal();
        this.render(this.root);
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  async detalle(idCliente) {
    const { datos: cliente } = await api(`/clientes/${idCliente}`);
    const motos = cliente.motocicletas || [];
    abrirModal(`
      <h3>${escapeHtml(cliente.nombre)} ${escapeHtml(cliente.apellido)}</h3>
      <p class="muted">${escapeHtml(cliente.documento)} · ${escapeHtml(cliente.telefono)}${cliente.email ? ` · ${escapeHtml(cliente.email)}` : ''}</p>
      <div class="section-title" style="margin-top:8px">
        <strong>Motocicletas de este cliente</strong>
        <button class="btn btn-teal btn-sm" id="btnNuevaMoto">Agregar motocicleta</button>
      </div>
      ${motos.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Placa</th><th>Marca</th><th>Modelo</th><th>Color</th><th></th></tr></thead>
            <tbody>
              ${motos.map((m) => `
                <tr>
                  <td><strong>${escapeHtml(m.placa)}</strong></td>
                  <td>${escapeHtml(m.marca)}</td>
                  <td>${escapeHtml(m.modelo)}</td>
                  <td>${escapeHtml(m.color)}</td>
                  <td class="actions">
                    <button class="btn btn-ghost btn-sm" data-editar-moto="${m.id_motocicleta}">Editar</button>
                    <button class="btn btn-danger btn-sm" data-borrar-moto="${m.id_motocicleta}">Eliminar</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<p class="muted">Este cliente aún no tiene motocicletas registradas.</p>'}
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cerrar</button>
      </div>
    `);

    $('#btnNuevaMoto').onclick = () => this.formularioMoto(cliente);
    document.querySelectorAll('[data-editar-moto]').forEach((btn) => {
      btn.onclick = () => this.formularioMoto(cliente, motos.find((m) => m.id_motocicleta == btn.dataset.editarMoto));
    });
    document.querySelectorAll('[data-borrar-moto]').forEach((btn) => {
      btn.onclick = async () => {
        if (!await confirmar('¿Eliminar esta motocicleta? No es posible si ya tiene órdenes de trabajo.')) return;
        try {
          await api(`/motocicletas/${btn.dataset.borrarMoto}`, { method: 'DELETE' });
          toast('Motocicleta eliminada');
          this.detalle(idCliente);
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  },

  formularioMoto(cliente, moto = null) {
    abrirModal(`
      <h3>${moto ? 'Editar motocicleta' : 'Agregar motocicleta'}</h3>
      <p class="muted">Propietario: <strong>${escapeHtml(cliente.nombre)} ${escapeHtml(cliente.apellido)}</strong></p>
      <form id="formMoto" class="form-grid two">
        <input type="hidden" name="id_cliente" value="${cliente.id_cliente}">
        <label>Placa <input name="placa" required value="${escapeHtml(moto?.placa || '')}"></label>
        <label>Marca <input name="marca" required value="${escapeHtml(moto?.marca || '')}"></label>
        <label>Modelo <input name="modelo" required value="${escapeHtml(moto?.modelo || '')}"></label>
        <label>Color <input name="color" required value="${escapeHtml(moto?.color || '')}"></label>
        <div class="modal-actions" style="grid-column:1/-1">
          <button type="button" class="btn btn-ghost" id="btnVolverCliente">Volver</button>
          <button class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    $('#btnVolverCliente').onclick = () => this.detalle(cliente.id_cliente);
    $('#formMoto').onsubmit = async (evento) => {
      evento.preventDefault();
      const body = JSON.stringify(datosFormulario(evento.target));
      try {
        if (moto) await api(`/motocicletas/${moto.id_motocicleta}`, { method: 'PUT', body });
        else await api('/motocicletas', { method: 'POST', body });
        toast('Motocicleta guardada');
        await this.detalle(cliente.id_cliente);
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
