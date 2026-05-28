export const getActiveVariations = (product) =>
  product?.product_variations?.filter(v => v.is_active !== false) ?? []

export const productHasActiveVariations = (product) =>
  !product?.variations_disabled &&
  !!product?.variation_type &&
  getActiveVariations(product).length > 0
