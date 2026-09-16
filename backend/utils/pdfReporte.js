const PDFDocument = require('pdfkit');
const { moneda, fecha, encabezado } = require('./pdfHelpers');

function generarPdfReporte(reporte, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=reporte-${reporte.id_reporte}.pdf`);
  doc.pipe(res);

  encabezado(doc, `Reporte técnico #${reporte.id_reporte}`);

  doc.fontSize(11).text('Cliente', 40, 125);
  doc.fontSize(10).fillColor('#44403c')
    .text(`${reporte.cliente_nombre} ${reporte.cliente_apellido}`, 40, 142)
    .text(`Documento: ${reporte.cliente_documento}`)
    .text(`Teléfono: ${reporte.cliente_telefono || '—'}`)
    .text(`Dirección: ${reporte.cliente_direccion || '—'}`);

  doc.fillColor('#1c1917').fontSize(11).text('Motocicleta', 320, 125);
  doc.fontSize(10).fillColor('#44403c')
    .text(`Placa: ${reporte.placa}`, 320, 142)
    .text(`Marca / modelo: ${reporte.marca} ${reporte.modelo}`)
    .text(`Color: ${reporte.color}`)
    .text(`Técnico: ${reporte.tecnico_nombre} ${reporte.tecnico_apellido}`)
    .text(`Fecha: ${fecha(reporte.fecha_reporte)}`);

  let y = 230;
  doc.fillColor('#1c1917').fontSize(11).text('Diagnóstico', 40, y);
  y += 18;
  doc.fontSize(10).fillColor('#44403c').text(reporte.diagnostico || '—', 40, y, { width: 515 });
  y = doc.y + 14;

  doc.fillColor('#1c1917').fontSize(11).text(`Tipo de reparación: ${reporte.tipo_reparacion}`, 40, y);
  y = doc.y + 12;
  doc.fontSize(11).text('Trabajo realizado', 40, y);
  y = doc.y + 8;
  doc.fontSize(10).fillColor('#44403c').text(reporte.descripcion_trabajo || '—', 40, y, { width: 515 });
  y = doc.y + 14;

  if (reporte.recomendaciones) {
    doc.fillColor('#1c1917').fontSize(11).text('Recomendaciones', 40, y);
    y = doc.y + 8;
    doc.fontSize(10).fillColor('#44403c').text(reporte.recomendaciones, 40, y, { width: 515 });
    y = doc.y + 16;
  }

  const repuestos = reporte.repuestos || [];
  doc.fillColor('#1c1917').fontSize(11).text('Repuestos utilizados', 40, y);
  y = doc.y + 10;

  doc.fontSize(9).fillColor('#fff');
  doc.rect(40, y, 515, 20).fill('#1c1917');
  doc.text('Repuesto', 48, y + 6);
  doc.text('Cant.', 300, y + 6);
  doc.text('Costo unit.', 360, y + 6);
  doc.text('Total', 480, y + 6);
  y += 20;

  let totalRepuestos = 0;
  doc.fillColor('#44403c');
  repuestos.forEach((item, index) => {
    if (y > 740) {
      doc.addPage();
      y = 50;
    }
    if (index % 2 === 0) doc.rect(40, y, 515, 18).fill('#f5f5f4');
    doc.fillColor('#44403c').fontSize(9)
      .text(`${item.marca} ${item.nombre}`, 48, y + 5, { width: 240 })
      .text(String(item.cantidad), 300, y + 5)
      .text(moneda(item.costo_unitario), 360, y + 5)
      .text(moneda(item.costo_total), 480, y + 5);
    totalRepuestos += Number(item.costo_total || 0);
    y += 18;
  });

  if (repuestos.length === 0) {
    doc.text('Sin repuestos registrados', 48, y + 6);
    y += 22;
  }

  y += 16;
  doc.fillColor('#1c1917').fontSize(11).text(`Total repuestos: ${moneda(totalRepuestos)}`, 40, y);
  y += 30;
  doc.fontSize(9).fillColor('#78716c')
    .text('Documento generado para impresión. Taller Motocicletas ORDEN.', 40, y);

  doc.end();
}

module.exports = { generarPdfReporte };
