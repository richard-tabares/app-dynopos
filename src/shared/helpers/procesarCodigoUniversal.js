/**
 * Procesa cualquier código de barras y extrae la identidad del producto.
 * @param {string} codigoCrudo - La cadena de texto directa del escáner.
 * @returns {Object} { idBusqueda, tipo, metadata }
 */
export function procesarCodigoUniversal(codigoCrudo) {
  if (!codigoCrudo || typeof codigoCrudo !== 'string') {
    return { idBusqueda: codigoCrudo, tipo: null, metadata: null }
  }

  const codigo = codigoCrudo.trim()

  // 1. DETECTAR CÓDIGOS SEGMENTADOS AVANZADOS (GS1-128 / DataBar)
  if (codigo.startsWith('01') && codigo.length > 14) {
    const gtin14 = codigo.substring(2, 16)
    const idBusqueda = gtin14.startsWith('0') ? gtin14.substring(1) : gtin14

    let vencimiento = null
    if (codigo.substring(16, 18) === '17') {
      vencimiento = codigo.substring(18, 24)
    }

    return {
      idBusqueda,
      tipo: 'GS1-Segmentado',
      metadata: { vencimiento, completo: codigo },
    }
  }

  // 2. DETECTAR CÓDIGOS DE SUPERMERCADO ESTÁNDAR (EAN-13)
  if (codigo.length === 13) {
    return {
      idBusqueda: codigo,
      tipo: 'EAN-13',
      metadata: null,
    }
  }

  // 3. DETECTAR CÓDIGOS NORTEAMERICANOS / IMPORTADOS (UPC-A)
  if (codigo.length === 12) {
    return {
      idBusqueda: codigo,
      tipo: 'UPC-A',
      metadata: null,
    }
  }

  // 4. DETECTAR CÓDIGOS MINIATURA (EAN-8)
  if (codigo.length === 8) {
    return {
      idBusqueda: codigo,
      tipo: 'EAN-8',
      metadata: null,
    }
  }

  // 5. CASO COMODÍN
  return {
    idBusqueda: codigo,
    tipo: 'Interno/Alfanumérico',
    metadata: null,
  }
}
