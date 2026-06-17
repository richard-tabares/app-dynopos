import { getRawBTBase64, launchRawBT, isAndroid } from './rawbtPrint'
import { useStore } from '../../app/providers/store'

const AGENT_URL = 'http://localhost:9400'
const STORAGE_KEY = 'bykorpos-printer'
const TIMEOUT = 800

export async function checkAgent() {
  try {
    const res = await fetch(`${AGENT_URL}/api/health`, {
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getPrinters() {
  try {
    const res = await fetch(`${AGENT_URL}/api/printers`, {
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (!res.ok) return { printers: [] }
    return await res.json()
  } catch {
    return { printers: [] }
  }
}

export async function printTicket(printerName, ticketData) {
  const res = await fetch(`${AGENT_URL}/api/print`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ printerName, ticketData }),
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al imprimir')
  return data
}

export function getStoredPrinter() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredPrinter(name) {
  try {
    if (name) {
      localStorage.setItem(STORAGE_KEY, name)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage no disponible
  }
}

export async function handlePrint(sale, businessFallback = null) {
  const { user: currentUser } = useStore.getState()
  const userBiz = currentUser?.business
  const business = userBiz || businessFallback || {}
  const profile = currentUser?.profile || {}

  if (!userBiz && !businessFallback) {
    console.warn('[PrintEngine] business NO disponible en store', {
      userKeys: Object.keys(currentUser || {}),
      currentUserType: typeof currentUser,
      userBiz,
      businessFallback,
    })
  }

  const ticketData = {
    businessName: business.business_name || '',
    printerWidth: profile.printer_width || 32,
    ticketNumber: sale.ticketNumber || sale.id,
    date: sale.date || '',
    paymentMethod: sale.paymentMethod || '',
    salesperson: sale.salesperson || '',
    items: (sale.items || []).map((item) => ({
      name: item.name || '',
      variationName: item.variation_name || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      subtotal: item.subtotal || 0,
    })),
    total: sale.total || 0,
    footer: business.ticket_footer || '',
  }

  if (isAndroid()) {
    try {
      const base64 = await getRawBTBase64(ticketData)
      launchRawBT(base64)
      return { success: true }
    } catch (err) {
      return { success: false, fallback: true, error: err.message || 'Error al imprimir en Android' }
    }
  }

  const agent = await checkAgent()
  if (!agent) {
    return { success: false, fallback: true, error: 'Agente no detectado' }
  }

  let printerName = getStoredPrinter()
  const { printers: allPrinters } = await getPrinters()

  if (!printerName) {
    if (allPrinters.length === 0) {
      return { success: false, fallback: true, error: 'No hay impresoras disponibles' }
    }
    if (allPrinters.length === 1) {
      printerName = allPrinters[0].name
      setStoredPrinter(printerName)
    } else {
      return { success: false, needsSelection: true, printers: allPrinters }
    }
  }

  try {
    await printTicket(printerName, ticketData)
    return { success: true }
  } catch (err) {
    const errMsg = err.message || ''
    const printerErrors = [
      'no está conectada', 'NOT-AVAILABLE',
      'does not exist', 'printer or class',
      'permiso denegado', 'permission denied',
    ]
    if (printerErrors.some((e) => errMsg.includes(e))) {
      setStoredPrinter(null)
      return { success: false, fallback: true, error: errMsg }
    }
    return { success: false, fallback: true, error: errMsg }
  }
}
