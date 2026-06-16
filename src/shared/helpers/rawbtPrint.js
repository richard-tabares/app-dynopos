const RAWB_PACKAGE = 'ru.a402d.rawbtprinter'
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${RAWB_PACKAGE}`

export async function getRawBTBase64(ticketData) {
  const apiUrl = import.meta.env.VITE_API_URL
  const res = await fetch(`${apiUrl}/api/print/build-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketData }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al generar ticket')
  return data.base64
}

export function launchRawBT(base64) {
  const a = document.createElement('a')
  a.href = `rawbt:base64,${base64}`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  return true
}

export function getRawBTPlayStoreUrl() {
  return PLAY_STORE_URL
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}
