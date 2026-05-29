export const getActiveVariations = (product) =>
  product?.product_variations?.filter(v => v.is_active !== false) ?? []

export const getDefaultVariation = (product) => {
  const variations = getActiveVariations(product)
  return variations.find(v => v.sort_order === 0) || variations[0] || null
}

export const productHasActiveVariations = (product) =>
  !!product?.id && !product?.variations_disabled
