function moneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function fecha(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function datosTaller() {
  return {
    nombre: process.env.TALLER_NOMBRE || 'Taller Motocicletas',
    direccion: process.env.TALLER_DIRECCION || '',
    telefono: process.env.TALLER_TELEFONO || '',
    nit: process.env.TALLER_NIT || '',
  };
}

function encabezado(doc, titulo) {
  const taller = datosTaller();
  doc.rect(0, 0, doc.page.width, 72).fill('#1c1917');
  doc.fillColor('#f97316').fontSize(16).text(taller.nombre, 40, 18, { continued: false });
  doc.fillColor('#e7e5e4').fontSize(9)
    .text(`${taller.direccion}  ·  Tel: ${taller.telefono}  ·  NIT: ${taller.nit}`, 40, 40);
  doc.fillColor('#1c1917').fontSize(14).text(titulo, 40, 90);
  doc.moveTo(40, 110).lineTo(doc.page.width - 40, 110).strokeColor('#f97316').stroke();
  doc.fillColor('#292524');
}

module.exports = { moneda, fecha, datosTaller, encabezado };
