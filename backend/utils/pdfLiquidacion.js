const PDFDocument = require('pdfkit');
const { moneda, fecha, encabezado } = require('./pdfHelpers');

function generarPdfLiquidacion(liquidacion, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename=liquidacion-${liquidacion.id_liquidacion}.pdf`
  );
  doc.pipe(res);

  encabezado(doc, `Liquidación de técnico #${liquidacion.id_liquidacion}`);

  doc.fontSize(11).fillColor('#1c1917').text('Técnico', 40, 125);
  doc.fontSize(10).fillColor('#44403c')
    .text(`${liquidacion.tecnico_nombre} ${liquidacion.tecnico_apellido}`, 40, 142)
    .text(`Período: ${liquidacion.fecha_inicio} a ${liquidacion.fecha_fin}`)
    .text(`Estado: ${liquidacion.estado}`)
    .text(`Liquidado por: ${liquidacion.liquidador_nombre} ${liquidacion.liquidador_apellido}`)
    .text(`Fecha: ${fecha(liquidacion.fecha_liquidacion)}`);

  const detalles = liquidacion.detalles || [];
  let y = 240;
  doc.fillColor('#1c1917').fontSize(11).text('Manos de obra incluidas', 40, y);
  y = doc.y + 10;

  doc.rect(40, y, 515, 20).fill('#1c1917');
  doc.fillColor('#fff').fontSize(9)
    .text('Placa', 48, y + 6)
    .text('Descripción', 120, y + 6)
    .text('Valor aprobado', 430, y + 6);
  y += 20;

  detalles.forEach((item, index) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
    if (index % 2 === 0) doc.rect(40, y, 515, 20).fill('#f5f5f4');
    doc.fillColor('#44403c').fontSize(9)
      .text(item.placa, 48, y + 6)
      .text(item.descripcion, 120, y + 6, { width: 290 })
      .text(moneda(item.valor_aplicado), 430, y + 6);
    y += 22;
  });

  y += 16;
  doc.fillColor('#1c1917').fontSize(11)
    .text(`Total mano de obra: ${moneda(liquidacion.total_mano_obra)}`, 40, y)
    .text(`Porcentaje aplicado: ${liquidacion.porcentaje_aplicado}%`)
    .text(`TOTAL A PAGAR: ${moneda(liquidacion.total_pagar)}`);

  doc.end();
}

module.exports = { generarPdfLiquidacion };
