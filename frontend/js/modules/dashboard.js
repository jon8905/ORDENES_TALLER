window.ModuloDashboard = {
  async render(root) {
    const { datos } = await api('/dashboard');
    const usuario = Auth.usuario();

    if (datos.tipo === 'ADMIN') {
      root.innerHTML = this.admin(datos);
    } else if (datos.tipo === 'JEFE_TALLER') {
      root.innerHTML = this.jefe(datos);
    } else {
      root.innerHTML = this.tecnico(datos, usuario);
    }
  },

  admin(d) {
    return `
      <div class="cards">
        ${this.card('Usuarios', d.total_usuarios, 'orange')}
        ${this.card('Técnicos activos', d.total_tecnicos, 'teal')}
        ${this.card('Motocicletas', d.motocicletas_registradas, 'info')}
        ${this.card('En reparación', d.motocicletas_en_reparacion, 'warn')}
        ${this.card('Órdenes pendientes', d.ordenes_pendientes, 'orange')}
        ${this.card('Órdenes terminadas', d.ordenes_terminadas, 'ok')}
        ${this.card('M/O por aprobar', d.mano_obra_pendiente, 'warn')}
      </div>`;
  },

  jefe(d) {
    return `
      <div class="cards">
        ${this.card('Recibidas', d.motocicletas_recibidas, 'info')}
        ${this.card('Sin asignar', d.pendientes_asignacion, 'warn')}
        ${this.card('En reparación', d.en_reparacion, 'orange')}
        ${this.card('M/O por aprobar', d.mano_obra_pendiente, 'warn')}
        ${this.card('Técnicos activos', d.tecnicos_activos, 'teal')}
        ${this.card('Reparaciones terminadas', d.reparaciones_terminadas, 'ok')}
        ${this.card('Liquidaciones pendientes', d.liquidaciones_pendientes, 'info')}
      </div>`;
  },

  tecnico(d, usuario) {
    const t = d.totales || {};
    return `
      <p class="muted">Bienvenido, ${escapeHtml(usuario.nombre)}. Estas son sus motocicletas y totales.</p>
      <div class="cards">
        ${this.card('Asignadas activas', d.motocicletas_asignadas, 'orange')}
        ${this.card('M/O pendiente', d.mano_obra_pendiente, 'warn')}
        ${this.card('Total M/O aprobada', moneda(t.total_mo_aprobada || d.total_mo_aprobada), 'ok')}
        ${this.card('Total a pagar', moneda(t.total_a_pagar || 0), 'info')}
      </div>
      <p class="muted" style="margin-top:16px">Use el menú <strong>Órdenes de trabajo</strong> para registrar mano de obra y reportes.</p>`;
  },

  card(label, value, color) {
    return `<article class="card stat ${color}"><div class="label">${label}</div><div class="value">${value}</div></article>`;
  },
};
