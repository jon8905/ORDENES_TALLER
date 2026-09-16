window.ModuloUsuarios = {
  async render(root) {
    const [{ datos: usuarios }, { datos: roles }] = await Promise.all([
      api('/usuarios'),
      api('/roles'),
    ]);
    this.roles = roles;
    root.innerHTML = `
      <div class="section-title">
        <p class="muted">Administración de cuentas y roles. El porcentaje de M/O solo aplica a técnicos.</p>
        <button class="btn btn-primary" id="btnNuevo">Nuevo usuario</button>
      </div>
      <div class="card table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            ${usuarios.map((u) => `
              <tr>
                <td>${escapeHtml(u.nombre)} ${escapeHtml(u.apellido)}</td>
                <td>${escapeHtml(u.documento)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.nombre_rol)}</td>
                <td>${u.activo ? '<span class="badge b-green">ACTIVO</span>' : '<span class="badge b-red">INACTIVO</span>'}</td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm" data-editar="${u.id_usuario}">Editar</button>
                  <button class="btn btn-sm ${u.activo ? 'btn-warn' : 'btn-ok'}" data-estado="${u.id_usuario}" data-activo="${u.activo ? 0 : 1}">
                    ${u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    $('#btnNuevo').onclick = () => this.formulario();
    root.querySelectorAll('[data-editar]').forEach((btn) => {
      btn.onclick = () => this.formulario(usuarios.find((u) => u.id_usuario == btn.dataset.editar));
    });
    root.querySelectorAll('[data-estado]').forEach((btn) => {
      btn.onclick = async () => {
        const ok = await confirmar('¿Desea cambiar el estado de este usuario?');
        if (!ok) return;
        try {
          await api(`/usuarios/${btn.dataset.estado}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ activo: Number(btn.dataset.activo) }),
          });
          toast('Estado actualizado');
          this.render(root);
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  },

  formulario(usuario = null) {
    const opciones = this.roles.map((r) =>
      `<option value="${r.id_rol}" ${usuario && usuario.id_rol == r.id_rol ? 'selected' : ''}>${r.nombre_rol}</option>`
    ).join('');
    abrirModal(`
      <h3>${usuario ? 'Editar usuario' : 'Nuevo usuario'}</h3>
      <form id="formUsuario" class="form-grid two">
        <label>Nombre <input name="nombre" required value="${escapeHtml(usuario?.nombre || '')}"></label>
        <label>Apellido <input name="apellido" required value="${escapeHtml(usuario?.apellido || '')}"></label>
        <label>Documento <input name="documento" required value="${escapeHtml(usuario?.documento || '')}"></label>
        <label>Teléfono <input name="telefono" value="${escapeHtml(usuario?.telefono || '')}"></label>
        <label>Dirección <input name="direccion" value="${escapeHtml(usuario?.direccion || '')}"></label>
        <label>Email <input type="email" name="email" required value="${escapeHtml(usuario?.email || '')}"></label>
        <label>Contraseña <input type="password" name="password" ${usuario ? '' : 'required'} placeholder="${usuario ? 'Dejar vacío para no cambiar' : ''}"></label>
        <label>Rol
          <select name="id_rol" id="selRol" required>${opciones}</select>
        </label>
        <label id="campoPorcentaje" style="display:none">Porcentaje de mano de obra
          <select name="porcentaje_mano_obra">
            ${[40, 45, 50, 55, 60, 65, 70].map((p) =>
              `<option value="${p}" ${usuario && Number(usuario.porcentaje_mano_obra) === p ? 'selected' : ''}>${p}%</option>`
            ).join('')}
          </select>
        </label>
        <div class="modal-actions" style="grid-column:1/-1">
          <button type="button" class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
          <button class="btn btn-primary">${usuario ? 'Guardar' : 'Crear'}</button>
        </div>
      </form>
    `);

    const toggle = () => {
      const rol = this.roles.find((r) => String(r.id_rol) === $('#selRol').value);
      $('#campoPorcentaje').style.display = rol && rol.nombre_rol === 'TECNICO' ? 'grid' : 'none';
    };
    $('#selRol').onchange = toggle;
    toggle();

    $('#formUsuario').onsubmit = async (evento) => {
      evento.preventDefault();
      const body = datosFormulario(evento.target);
      try {
        if (usuario) {
          await api(`/usuarios/${usuario.id_usuario}`, { method: 'PUT', body: JSON.stringify(body) });
          toast('Usuario actualizado');
        } else {
          await api('/usuarios', { method: 'POST', body: JSON.stringify(body) });
          toast('Usuario creado');
        }
        cerrarModal();
        window.ModuloUsuarios.render(document.getElementById('contenido'));
      } catch (err) { toast(err.message, 'err'); }
    };
  },
};
