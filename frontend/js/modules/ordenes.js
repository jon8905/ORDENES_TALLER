window.ModuloOrdenes = {
  async render(root) {
    const { datos } = await api('/ordenes');
    this.datos = datos;
    const esOperativo = Auth.puede('ADMIN', 'JEFE_TALLER');
    root.innerHTML = `
      <div class="section-title">
        <p class="muted">${
          Auth.puede('TECNICO')
            ? 'Solo se muestran las motocicletas asignadas que aún no han sido entregadas al cliente.'
            : Auth.puede('JEFE_TALLER')
              ? 'Las motocicletas entregadas salen de esta lista. Consúltelas en Historial.'
              : 'Cada ingreso genera una nueva orden y conserva el historial.'
        }</p>
        ${esOperativo ? '<button class="btn btn-primary" id="btnNueva">Nueva entrada</button>' : ''}
      </div>
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Placa</th><th>Moto</th><th>Propietario</th>
              <th>Ingreso</th><th>Problema</th><th>Estado</th><th>Técnico</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${datos.map((o) => `
              <tr>
                <td>${o.id_orden}</td>
                <td><strong>${escapeHtml(o.placa)}</strong></td>
                <td>${escapeHtml(o.marca)} ${escapeHtml(o.modelo)}</td>
                <td>${escapeHtml(o.cliente_nombre)} ${escapeHtml(o.cliente_apellido)}</td>
                <td>${fecha(o.fecha_ingreso)}</td>
                <td>${escapeHtml((o.descripcion_problema || '').slice(0, 60))}</td>
                <td>${badgeEstadoOrden(o.estado)}</td>
                <td>${(o.tecnicos || []).map((t) => `${escapeHtml(t.nombre)} ${escapeHtml(t.apellido)}`).join(', ') || '—'}</td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm" data-ver="${o.id_orden}">Abrir</button>
                  <button class="btn btn-teal btn-sm" data-repuestos="${o.id_orden}">Agregar repuestos</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    if (esOperativo) $('#btnNueva').onclick = () => this.nueva();
    root.querySelectorAll('[data-ver]').forEach((btn) => {
      btn.onclick = () => this.detalle(btn.dataset.ver);
    });
    root.querySelectorAll('[data-repuestos]').forEach((btn) => {
      btn.onclick = () => this.repuestos(btn.dataset.repuestos);
    });
  },

  async nueva() {
    abrirModal(`
      <h3>Entrada de motocicleta</h3>
      <form id="formOrden" class="form-grid">
        <label>Buscar por placa
          <div class="toolbar" style="margin:0">
            <input id="inputPlaca" name="placa_busqueda" required placeholder="Ej. ABC12A" autocomplete="off" style="text-transform:uppercase;max-width:none">
            <button type="button" class="btn btn-teal" id="btnBuscarPlaca">Buscar</button>
          </div>
        </label>
        <input type="hidden" name="id_motocicleta" id="idMotocicleta" value="">
        <div id="resultadoMoto" class="muted">Escriba la placa y pulse Buscar.</div>
        <label>Descripción del problema <textarea name="descripcion_problema" required></textarea></label>
        <label>Observaciones de ingreso <textarea name="observaciones_ingreso"></textarea></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">Registrar ingreso</button>
        </div>
      </form>
    `);

    const buscar = async () => {
      const placa = $('#inputPlaca').value.trim();
      const caja = $('#resultadoMoto');
      $('#idMotocicleta').value = '';
      if (!placa) {
        caja.className = 'muted';
        caja.innerHTML = 'Escriba la placa y pulse Buscar.';
        return;
      }
      caja.className = 'muted';
      caja.textContent = 'Buscando...';
      try {
        const { datos: moto } = await api(`/motocicletas?placa=${encodeURIComponent(placa)}`);
        $('#idMotocicleta').value = moto.id_motocicleta;
        caja.className = '';
        caja.innerHTML = `
          <div class="card" style="box-shadow:none;margin:0">
            <p style="margin:0"><strong>${escapeHtml(moto.placa)}</strong> · ${escapeHtml(moto.marca)} ${escapeHtml(moto.modelo)} · ${escapeHtml(moto.color)}</p>
            <p class="muted" style="margin:6px 0 0">Propietario: ${escapeHtml(moto.cliente_nombre)} ${escapeHtml(moto.cliente_apellido)} · ${escapeHtml(moto.cliente_documento)} · ${escapeHtml(moto.cliente_telefono || '')}</p>
          </div>`;
      } catch (err) {
        caja.className = 'muted';
        caja.innerHTML = `<span style="color:var(--danger)">${escapeHtml(err.message)}</span>`;
      }
    };

    $('#btnBuscarPlaca').onclick = buscar;
    $('#inputPlaca').addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        buscar();
      }
    });

    $('#formOrden').onsubmit = async (evento) => {
      evento.preventDefault();
      const datos = datosFormulario(evento.target);
      if (!datos.id_motocicleta) {
        toast('Busque y seleccione una motocicleta por placa', 'err');
        return;
      }
      try {
        await api('/ordenes', { method: 'POST', body: JSON.stringify(datos) });
        toast('Orden creada');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  async detalle(id) {
    const { datos: orden } = await api(`/ordenes/${id}`);
    const esOperativo = Auth.puede('ADMIN', 'JEFE_TALLER');
    let tecnicosHtml = '';
    if (esOperativo) {
      const { datos: tecnicos } = await api('/tecnicos?activos=1');
      tecnicosHtml = `
        <form id="formAsignar" class="toolbar">
          <select name="id_tecnico" required>
            ${tecnicos.map((t) => `<option value="${t.id_tecnico}">${escapeHtml(t.nombre)} ${escapeHtml(t.apellido)}</option>`).join('')}
          </select>
          <button class="btn btn-teal btn-sm">Asignar técnico</button>
        </form>`;
    }

    abrirModal(`
      <h3>Orden #${orden.id_orden} · ${escapeHtml(orden.placa)}</h3>
      <p><strong>${escapeHtml(orden.marca)} ${escapeHtml(orden.modelo)}</strong> · ${escapeHtml(orden.cliente_nombre)} ${escapeHtml(orden.cliente_apellido)}</p>
      <p>Problema: ${escapeHtml(orden.descripcion_problema)}</p>
      <p>Estado actual: ${badgeEstadoOrden(orden.estado)}</p>
      <p>Técnicos: ${(orden.tecnicos || []).map((t) => `${t.nombre} ${t.apellido}`).join(', ') || 'Sin asignar'}</p>
      ${tecnicosHtml}
      <form id="formEstado" class="toolbar">
        <select name="estado">
          ${(Auth.puede('TECNICO') ? ESTADOS_TECNICO : ESTADOS_ORDEN).map((e) =>
            `<option value="${e}" ${orden.estado === e ? 'selected' : ''}>${e.replaceAll('_', ' ')}</option>`
          ).join('')}
        </select>
        <button class="btn btn-primary btn-sm">Actulizar estado</button>
      </form>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="cerrarModal()">Cerrar</button>
      </div>
    `);

    if ($('#formAsignar')) {
      $('#formAsignar').onsubmit = async (evento) => {
        evento.preventDefault();
        try {
          await api(`/ordenes/${id}/asignar`, { method: 'POST', body: JSON.stringify(datosFormulario(evento.target)) });
          toast('Técnico asignado');
          cerrarModal();
          this.render(document.getElementById('contenido'));
        } catch (err) { toast(err.message, 'err'); }
      };
    }
    $('#formEstado').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api(`/ordenes/${id}/estado`, { method: 'PATCH', body: JSON.stringify(datosFormulario(evento.target)) });
        toast('Estado actualizado');
        cerrarModal();
        this.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  listaRepuestosHtml(repuestos) {
    if (!repuestos || !repuestos.length) {
      return '<p class="muted">Sin repuestos registrados.</p>';
    }
    const total = repuestos.reduce((acc, item) => acc + Number(item.costo_total || 0), 0);
    return `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Repuesto</th><th>Cant.</th><th>Costo</th><th>Total</th><th></th></tr></thead>
          <tbody>
            ${repuestos.map((item) => `
              <tr>
                <td>${escapeHtml(item.nombre)}</td>
                <td>${item.cantidad}</td>
                <td>${moneda(item.costo_unitario)}</td>
                <td>${moneda(item.costo_total)}</td>
                <td><button type="button" class="btn btn-danger btn-sm" data-borrar="${item.id_orden_repuesto}">Quitar</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p><strong>Total repuestos: ${moneda(total)}</strong></p>`;
  },

  async repuestos(id) {
    const { datos: orden } = await api(`/ordenes/${id}`);
    const lista = orden.repuestos || [];
    abrirModal(`
      <h3>Repuestos · ${escapeHtml(orden.placa)} · Orden #${orden.id_orden}</h3>
      <div id="listaRepuestos">${this.listaRepuestosHtml(lista)}</div>
      <form id="formRepuestoOrden" class="form-grid two" style="margin-top:12px">
        <label>Repuesto utilizado
          <input name="nombre" required placeholder="Ej. Filtro de aceite">
        </label>
        <label>Cantidad
          <input type="number" name="cantidad" min="1" step="1" value="1" required>
        </label>
        <label>Costo unitario
          <input type="number" name="costo" min="0" step="1" required placeholder="0">
        </label>
        <div class="modal-actions" style="align-items:end">
          <button class="btn btn-teal">Agregar</button>
        </div>
      </form>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cerrar</button>
      </div>
    `);

    const recargar = async () => {
      await this.repuestos(id);
    };

    $('#formRepuestoOrden').onsubmit = async (evento) => {
      evento.preventDefault();
      try {
        await api(`/ordenes/${id}/repuestos`, {
          method: 'POST',
          body: JSON.stringify(datosFormulario(evento.target)),
        });
        toast('Repuesto agregado');
        recargar();
      } catch (err) { toast(err.message, 'err'); }
    };

    document.querySelectorAll('#listaRepuestos [data-borrar]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await api(`/ordenes/${id}/repuestos/${btn.dataset.borrar}`, { method: 'DELETE' });
          toast('Repuesto eliminado');
          recargar();
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  },
};
