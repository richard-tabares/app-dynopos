export const normalizeSearch = (str) => {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!¡¿?;:(){}"'`´-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}
