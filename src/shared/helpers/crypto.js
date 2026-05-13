const KEY = 'dynopos-frontend-key'

export const encryptData = (text) => {
  const encoded = btoa(encodeURIComponent(text))
  const xorred = encoded.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length))
  ).join('')
  return btoa(xorred)
}

export const decryptData = (encrypted) => {
  try {
    const xorred = atob(encrypted)
    const decoded = xorred.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length))
    ).join('')
    return decodeURIComponent(atob(decoded))
  } catch {
    return null
  }
}
