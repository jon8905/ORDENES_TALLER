window.ModuloHistorial = {
  async render(root) {
    root.innerHTML = `
      <form id="formHist" class="toolbar">
        <input name="placa" required placeholder="Buscar por placa" style="text-transform:uppercase">
        <button class="btn btn-primary">Consultar historial</button>
      </form>
      <div id="resultado"></div>`;

    $('#formHist').onsubmit = async (evento) => {
      evento.preventDefault();
      const placa = datosFormulario(evento.target).placa;
      const caja = $('#resultado');
      caja.innerHTML = '<p class="muted">Consultando...</p>';
      try {
        const { datos } = await api(`/historial?placa=${encodeURIComponent(placa)}`);
        caja.innerHTML = this.pintar(datos);
      } catch (err) {
        caja.innerHTML = `<div class="card">${escapeHtml(err.message)}</div>`;
      }
    };
  },

  pintar(h) {
    const m = h.motocicleta;
    return `
      <div class="cards">
        <article class="card stat orange"><div class="label">Placa</div><div class="value">${escapeHtml(m.placa)}</div></article>
        <article class="card stat teal"><div class="label">Ingresos</div><div class="value">${h.total_ingresos}</div></article>
        <article class="card stat info"><div class="label">Último ingreso</div><div class="value" style="font-size:18px">${fecha(h.ultima_fecha_ingreso)}</div></article>
      </div>
      <div class="card" style="margin-top:14px">
        <p><strong>${escapeHtml(m.marca)} ${escapeHtml(m.modelo)}</strong> · ${escapeHtml(m.color)}</p>
        <p>Propietario: ${escapeHtml(m.nombre)} ${escapeHtml(m.apellido)} · ${escapeHtml(m.documento)} · ${escapeHtml(m.telefono)}</p>
      </div>
      ${(h.ordenes || []).map((o) => `
        <article class="card history-item">
          <p><strong>Orden #${o.id_orden}</strong> ${badgeEstadoOrden(o.estado)} · Ingreso ${fecha(o.fecha_ingreso)} · Salida ${fecha(o.fecha_salida)}</p>
          <p>Problema: ${escapeHtml(o.descripcion_problema)}</p>
          <p>Técnicos: ${(o.tecnicos || []).map((t) => `${t.nombre} ${t.apellido}`).join(', ') || '—'}</p>
          <p>Tipo de reparación: ${(o.reportes || []).map((r) => r.tipo_reparacion).join(', ') || '—'}</p>
          <p>Mano de obra: ${(o.mano_obra || []).map((mo) => `${mo.descripcion} (${moneda(mo.valor_aprobado || mo.valor_mano_obra)}) ${mo.estado_aprobacion}`).join(' · ') || '—'}</p>
          ${(o.repuestos && o.repuestos.length)
            ? `<p>Repuestos: ${o.repuestos.map((rp) => `${escapeHtml(rp.nombre)} x${rp.cantidad} (${moneda(rp.costo_total)})`).join(', ')}</p>`
            : ''}
        </article>
      `).join('')}`;
  },
};
