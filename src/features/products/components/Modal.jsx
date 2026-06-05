import {
    Layers,
    Loader,
    Package,
    Save,
    Plus,
    Trash2,
    Settings2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { sileo } from 'sileo'
import { Modal as SharedModal } from '../../../shared/components/Modal'
import {
    productHasActiveVariations,
    getDefaultVariation,
} from '../../../shared/helpers/productHelpers'
import { procesarCodigoUniversal } from '../../../shared/helpers/procesarCodigoUniversal'

export const Modal = ({
    handleSubmit,
    handleOpenModal,
    editProductData = {},
    categories = {},
    products = [],
    onOpenStockAdjust,
}) => {
    const generalCategory = Array.isArray(categories)
        ? categories.find((cat) => cat.name === 'General')
        : null

    const existingVariations = editProductData.product_variations || []
    const defaultVar = getDefaultVariation(editProductData)

    const initialProductType = productHasActiveVariations(editProductData)
        ? 'variant'
        : 'simple'

    const [productType, setProductTypeState] = useState(initialProductType)

    const [formData, setFormData] = useState({
        sku: defaultVar?.sku || '',
        barcode: defaultVar?.barcode || '',
        name: editProductData.name || '',
        category_id:
            editProductData.categories?.id || generalCategory?.id || '',
        price: defaultVar?.price ?? '',
        unit_cost: defaultVar?.unit_cost ?? '',
        is_active: editProductData.is_active ?? true,
        track_stock: editProductData.track_stock ?? true,
        variation_type: editProductData.variation_type || '',
    })

    const [initialStock, setInitialStock] = useState(
        defaultVar?.stock?.toString() || '',
    )
    const [minStock, setMinStock] = useState(
        defaultVar?.min_stock?.toString() || '',
    )

    const [variations, setVariations] = useState(
        existingVariations.length > 0 && !editProductData.variations_disabled
            ? existingVariations
                  .filter((v) => v.variation_name !== 'Default')
                  .map((v) => ({
                      id: v.id,
                      variation_name: v.variation_name,
                      price: v.price,
                      unit_cost: v.unit_cost || '',
                      sku: v.sku || '',
                      barcode: v.barcode || '',
                      stock: v.stock || 0,
                      min_stock: v.min_stock || 0,
                      is_active: v.is_active !== false,
                  }))
            : [
                  {
                      variation_name: '',
                      price: '',
                      unit_cost: '',
                      sku: '',
                      barcode: '',
                      stock: '',
                      min_stock: '',
                      is_active: true,
                  },
              ],
    )

    const isFormValid =
        productType === 'variant'
            ? formData.name.trim() &&
              formData.variation_type.trim() &&
              variations.some(
                  (v) => v.variation_name.trim() && Number(v.price) > 0,
              )
            : formData.name.trim() && Number(formData.price) > 0
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line
        setFormData(prev => ({ ...prev, unit_cost: defaultVar?.unit_cost ?? '' }))
    }, [defaultVar?.unit_cost])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (type === 'number' && value !== '' && Number(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleVariationChange = (index, field, value) => {
        setVariations((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
        )
    }

    const addVariation = () => {
        setVariations((prev) => [
            {
                variation_name: '',
                price: '',
                unit_cost: '',
                sku: '',
                barcode: '',
                stock: '',
                min_stock: '',
                is_active: true,
            },
            ...prev,
        ])
    }

    const removeVariation = (index) => {
        setVariations((prev) => prev.filter((_, i) => i !== index))
    }

    const setProductType = (type) => {
        setProductTypeState(type)
        if (type === 'variant') {
            const nonDefaultVars = existingVariations.filter(
                (v) => v.variation_name !== 'Default',
            )
            if (nonDefaultVars.length > 0) {
                setVariations(
                    nonDefaultVars.map((v) => ({
                        id: v.id,
                        variation_name: v.variation_name,
                        price: v.price,
                        unit_cost: v.unit_cost || '',
                        sku: v.sku || '',
                        barcode: v.barcode || '',
                        stock: v.stock || 0,
                        min_stock: v.min_stock || 0,
                        is_active: true,
                    })),
                )
            } else {
                setVariations((prev) =>
                    prev.filter((v) => v.variation_name !== 'Default'),
                )
            }
        } else {
            const defaultVariation = existingVariations.find(
                (v) => v.variation_name === 'Default',
            )
            if (defaultVariation) {
                setFormData((prev) => ({
                    ...prev,
                    price: defaultVariation.price,
                    unit_cost: defaultVariation.unit_cost,
                    sku: defaultVariation.sku || prev.sku,
                    barcode: defaultVariation.barcode || prev.barcode,
                }))
                setInitialStock(defaultVariation.stock?.toString() || '')
                setMinStock(defaultVariation.min_stock?.toString() || '')
            }
        }
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        if (formData.sku.trim()) {
            const skuDuplicate = products.some((p) =>
                (p.product_variations || []).some(
                    (v) =>
                        v.sku?.toLowerCase() ===
                            formData.sku.trim().toLowerCase() &&
                        v.id !== (defaultVar?.id || ''),
                ),
            )

            if (skuDuplicate) {
                sileo.error({
                    fill: 'var(--toast-error)',
                    title: 'Error',
                    description: 'Ya existe una variante con este SKU',
                })
                setSubmitting(false)
                return
            }
        }

        const barcodeNormalizado = formData.barcode
            ? procesarCodigoUniversal(formData.barcode).idBusqueda
            : formData.barcode

        const businessId = JSON.parse(localStorage.getItem('dynopos-store'))
            .state.user.data.user.id
        const sanitizedData = {
            ...formData,
            barcode: barcodeNormalizado,
            category_id: formData.category_id || null,
            price:
                productType === 'variant'
                    ? 0
                    : formData.price === ''
                      ? null
                      : formData.price,
            unit_cost:
                productType === 'variant'
                    ? 0
                    : formData.unit_cost === ''
                      ? 0
                      : formData.unit_cost,
            business_id: businessId,
            id: editProductData.id || undefined,
            variation_type:
                productType === 'variant'
                    ? formData.variation_type
                    : editProductData.variation_type || null,
            variations_disabled: productType !== 'variant',
            initial_stock:
                productType === 'variant' ? 0 : Number(initialStock) || 0,
            min_stock_inicial:
                productType === 'variant' ? 0 : Number(minStock) || 0,
            variations:
                productType === 'variant'
                    ? variations.some((v) => v.variation_name.trim())
                        ? variations
                              .filter((v) => v.variation_name.trim())
                              .map((v) => ({
                                  ...v,
                                  barcode: v.barcode
                                      ? procesarCodigoUniversal(v.barcode).idBusqueda
                                      : null,
                                  price: Number(v.price),
                                  unit_cost: Number(v.unit_cost) || 0,
                              }))
                        : !editProductData.variations_disabled
                          ? existingVariations
                                .filter((v) => v.variation_name.trim())
                                .map((v) => ({
                                    id: v.id,
                                    variation_name: v.variation_name,
                                    price: Number(v.price),
                                    unit_cost: Number(v.unit_cost) || 0,
                                    sku: v.sku || null,
                                    barcode: v.barcode
                                        ? procesarCodigoUniversal(v.barcode).idBusqueda
                                        : null,
                                    min_stock: v.min_stock || 0,
                                }))
                          : []
                    : [],
        }
        await handleSubmit(sanitizedData)
        setSubmitting(false)
    }

    return (
        <SharedModal
            onClose={handleOpenModal}
            title={editProductData.id ? 'Editar Producto' : 'Nuevo Producto'}
            icon={Package}
            size='xl'>
            <div className='p-6'>
                <form
                    className='flex flex-col gap-4'
                    onSubmit={handleFormSubmit}>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-2'>
                            Tipo de Producto
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                            <button
                                type='button'
                                onClick={() => setProductType('simple')}
                                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors cursor-pointer ${
                                    productType === 'simple'
                                        ? 'border-accent bg-accent/5 text-accent'
                                        : 'border-outline bg-surface text-on-body hover:bg-accent/10'
                                }`}>
                                <Package className='w-5 h-5' />
                                <span className='font-medium'>
                                    Producto Simple
                                </span>
                            </button>
                            <button
                                type='button'
                                onClick={() => setProductType('variant')}
                                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors cursor-pointer ${
                                    productType === 'variant'
                                        ? 'border-accent bg-accent/5 text-accent'
                                        : 'border-outline bg-surface text-on-body hover:bg-hover'
                                }`}>
                                <Layers className='w-5 h-5' />
                                <span className='font-medium'>
                                    Producto con Variantes
                                </span>
                            </button>
                        </div>
                    </section>

                    {productType === 'simple' ? (
                        <>
                            <div className='grid grid-cols-2 gap-4'>
                                <section>
                                    <label className='block text-sm font-medium text-on-body mb-1'>
                                        SKU o Código del Producto
                                    </label>
                                    <input
                                        type='text'
                                        name='sku'
                                        value={formData.sku}
                                        onChange={handleChange}
                                        autoFocus
                                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                        placeholder='Ingrese el SKU o código del producto'
                                    />
                                </section>
                                <section>
                                    <label className='block text-sm font-medium text-on-body mb-1'>
                                        Código de Barras
                                    </label>
                                    <input
                                        type='text'
                                        name='barcode'
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                        placeholder='Ingrese o escanee el código de barras'
                                    />
                                </section>
                            </div>
                            <section>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Nombre del Producto
                                </label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                    placeholder='Ingrese el nombre del producto'
                                />
                            </section>
                            <section>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Categoría
                                </label>
                                <select
                                    name='category_id'
                                    id='category_id'
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-surface border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-body'>
                                    {categories.map((category) => (
                                        <option
                                            className='text-on-body'
                                            key={category.id}
                                            value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </section>
                            <div className={`grid ${editProductData.id ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                                <section>
                                    <label className='block text-sm font-medium text-on-body mb-1'>
                                        Costo Unitario
                                    </label>
                                    <input
                                        type='number'
                                        name='unit_cost'
                                        value={formData.unit_cost}
                                        onChange={handleChange}
                                        min='0'
                                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                        placeholder='Costo (opcional)'
                                    />
                                </section>
                                <section>
                                    <label className='block text-sm font-medium text-on-body mb-1'>
                                        Precio Unitario
                                    </label>
                                    <input
                                        type='number'
                                        name='price'
                                        value={formData.price}
                                        onChange={handleChange}
                                        min='0'
                                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                        placeholder='Precio del producto'
                                    />
                                </section>
                                {editProductData.id && (
                                    <section>
                                        <label className='block text-sm font-medium text-on-body mb-1'>
                                            Stock Mínimo
                                        </label>
                                        <input
                                            type='number'
                                            value={minStock}
                                            onChange={(e) =>
                                                setMinStock(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            min='0'
                                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                            placeholder='Stock mínimo (opcional)'
                                        />
                                    </section>
                                )}
                            </div>
                            {!editProductData.id && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <section>
                                        <label className='block text-sm font-medium text-on-body mb-1'>
                                            Stock Inicial
                                        </label>
                                        <input
                                            type='number'
                                            value={initialStock}
                                            onChange={(e) =>
                                                setInitialStock(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            min='0'
                                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                            placeholder='Stock inicial del producto'
                                        />
                                    </section>
                                    <section>
                                        <label className='block text-sm font-medium text-on-body mb-1'>
                                            Stock Mínimo
                                        </label>
                                        <input
                                            type='number'
                                            value={minStock}
                                            onChange={(e) =>
                                                setMinStock(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            min='0'
                                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                            placeholder='Stock mínimo (opcional)'
                                        />
                                    </section>
                                </div>
                            )}
                            <section className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-on-body'>
                                    Activo
                                </span>
                                <label className='relative inline-flex items-center cursor-pointer'>
                                    <input
                                        type='checkbox'
                                        name='is_active'
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className='sr-only peer'
                                    />
                                    <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </section>
                            <section className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-on-body'>
                                    Controlar stock
                                </span>
                                <label className='relative inline-flex items-center cursor-pointer'>
                                    <input
                                        type='checkbox'
                                        name='track_stock'
                                        checked={formData.track_stock}
                                        onChange={handleChange}
                                        className='sr-only peer'
                                    />
                                    <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </section>
                        </>
                    ) : (
                        <>
                            <section>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Nombre del Producto
                                </label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoFocus
                                    className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                    placeholder='Ingrese el nombre del producto'
                                />
                            </section>
                            <section>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Categoría
                                </label>
                                <select
                                    name='category_id'
                                    id='category_id'
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-surface border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-body'>
                                    {categories.map((category) => (
                                        <option
                                            className='text-on-body'
                                            key={category.id}
                                            value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </section>
                            <section>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Tipo de variación
                                </label>
                                <input
                                    type='text'
                                    name='variation_type'
                                    value={formData.variation_type}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                    placeholder='ej: Talla, Color, Tamaño'
                                />
                            </section>
                            <div className='space-y-3 p-4 rounded-md'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm font-medium text-on-body'>
                                        Variaciones
                                    </span>
                                    <button
                                        type='button'
                                        onClick={addVariation}
                                        className='flex items-center gap-1 text-xs font-medium text-accent rounded-md border border-accent/85 p-2 hover:bg-accent/10 cursor-pointer'>
                                        <Plus className='w-3.5 h-3.5' /> Agregar
                                    </button>
                                </div>
                                {variations.map((v, index) => (
                                    <div
                                        key={index}
                                        className={`border ${v.is_active ? 'border-accent/85' : 'border-divider'} rounded-lg p-3 py-4`}>
                                        <div className='flex items-center justify-between'>
                                            <span
                                                className={`text-sm font-medium my-1.5 ${v.is_active ? 'text-accent' : 'text-muted'}`}>
                                                Variación{' - '}
                                                {v.variation_name ||
                                                    'Sin nombre'}
                                            </span>
                                            <div className='flex items-center gap-2'>
                                                <label className='flex items-center gap-2.5 text-xs text-on-body cursor-pointer'>
                                                    <input
                                                        type='checkbox'
                                                        checked={
                                                            v.is_active !==
                                                            false
                                                        }
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'is_active',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className='sr-only peer'
                                                    />
                                                    <div className="w-9 h-5 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent relative"></div>
                                                    <span
                                                        className={`text-sm ${
                                                            v.is_active !==
                                                            false
                                                                ? 'text-accent'
                                                                : 'text-muted'
                                                        }
                                                        `}>
                                                        {v.is_active !== false
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                        {editProductData.id ? (
                                            <div className='space-y-3'>
                                                <div className='grid grid-cols-3 gap-x-3'>
                                                    <section>
                                                        <label className='block text-xs font-medium text-on-body mb-1'>
                                                            Nombre
                                                        </label>
                                                        <input
                                                            type='text'
                                                            placeholder='Ej: S, M, Rojo'
                                                            value={v.variation_name}
                                                            onChange={(e) =>
                                                                handleVariationChange(
                                                                    index,
                                                                    'variation_name',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                        />
                                                    </section>
                                                    <section>
                                                        <label className='block text-xs font-medium text-on-body mb-1'>
                                                            SKU
                                                        </label>
                                                        <input
                                                            type='text'
                                                            placeholder='SKU (opcional)'
                                                            value={v.sku}
                                                            onChange={(e) =>
                                                                handleVariationChange(
                                                                    index,
                                                                    'sku',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                        />
                                                    </section>
                                                    <section>
                                                        <label className='block text-xs font-medium text-on-body mb-1'>
                                                            Código de Barras
                                                        </label>
                                                        <input
                                                            type='text'
                                                            placeholder='Código (opcional)'
                                                            value={v.barcode}
                                                            onChange={(e) =>
                                                                handleVariationChange(
                                                                    index,
                                                                    'barcode',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                        />
                                                    </section>
                                                </div>
                                                <div className='grid grid-cols-3 gap-x-3'>
                                                    <section>
                                                        <label className='block text-xs font-medium text-on-body mb-1'>
                                                            Costo Unitario
                                                        </label>
                                                        <input
                                                            type='number'
                                                            placeholder='Costo (opcional)'
                                                            value={v.unit_cost}
                                                            min='0'
                                                            onChange={(e) =>
                                                                handleVariationChange(
                                                                    index,
                                                                    'unit_cost',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                        />
                                                    </section>
                                                    <section>
                                                        <label className='block text-xs font-medium text-on-body mb-1'>
                                                            Precio Unitario
                                                        </label>
                                                        <input
                                                            type='number'
                                                            placeholder='Precio'
                                                            value={v.price}
                                                            min='0'
                                                            onChange={(e) =>
                                                                handleVariationChange(
                                                                    index,
                                                                    'price',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                        />
                                                    </section>
                                                    <section>
                                                        <label className='block text-xs font-medium text-on-body mb-1'>
                                                            Stock Mínimo
                                                        </label>
                                                        <input
                                                            type='number'
                                                            placeholder='Stock mínimo'
                                                            value={v.min_stock}
                                                            min='0'
                                                            onChange={(e) =>
                                                                handleVariationChange(
                                                                    index,
                                                                    'min_stock',
                                                                    e.target
                                                                        .value ===
                                                                        ''
                                                                        ? ''
                                                                        : Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                )
                                                            }
                                                            className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                        />
                                                    </section>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='grid grid-cols-2 gap-x-3 gap-y-3'>
                                                <section className='col-span-2'>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        Nombre de la Variación
                                                    </label>
                                                    <input
                                                        type='text'
                                                        placeholder='Ej: S, M, Rojo'
                                                        value={v.variation_name}
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'variation_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                                <section>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        SKU
                                                    </label>
                                                    <input
                                                        type='text'
                                                        placeholder='SKU (opcional)'
                                                        value={v.sku}
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'sku',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                                <section>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        Código de Barras
                                                    </label>
                                                    <input
                                                        type='text'
                                                        placeholder='Código (opcional)'
                                                        value={v.barcode}
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'barcode',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                                <section>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        Costo Unitario
                                                    </label>
                                                    <input
                                                        type='number'
                                                        placeholder='Costo (opcional)'
                                                        value={v.unit_cost}
                                                        min='0'
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'unit_cost',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                                <section>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        Precio Unitario
                                                    </label>
                                                    <input
                                                        type='number'
                                                        placeholder='Precio'
                                                        value={v.price}
                                                        min='0'
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'price',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                                <section>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        Stock Inicial
                                                    </label>
                                                    <input
                                                        type='number'
                                                        placeholder='Stock inicial'
                                                        value={v.stock}
                                                        min='0'
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'stock',
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                                <section>
                                                    <label className='block text-xs font-medium text-on-body mb-1'>
                                                        Stock Mínimo
                                                    </label>
                                                    <input
                                                        type='number'
                                                        placeholder='Stock mínimo'
                                                        value={v.min_stock}
                                                        min='0'
                                                        onChange={(e) =>
                                                            handleVariationChange(
                                                                index,
                                                                'min_stock',
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        className='w-full px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                                    />
                                                </section>
                                            </div>
                                        )}
                                        {editProductData.id &&
                                            onOpenStockAdjust && (
                                                <div className='flex items-center justify-between py-2 mt-4'>
                                                    <span className='text-sm text-accent font-medium'>
                                                        Stock actual:{' '}
                                                        <span className='font-semibold'>
                                                            {v.stock ?? 0}
                                                        </span>
                                                    </span>
                                                    <div className='flex items-center gap-2'>
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                onOpenStockAdjust(
                                                                    v,
                                                                )
                                                            }
                                                            className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent/5 border border-accent/85 text-accent hover:bg-hover rounded-lg transition cursor-pointer'>
                                                            <Settings2 className='w-3.5 h-3.5' />
                                                            Ajustar Stock
                                                        </button>
                                                        {variations.length > 1 && (
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    removeVariation(
                                                                        index,
                                                                    )
                                                                }
                                                                className='text-red-500 bg-danger/10 hover:bg-danger/30 border border-danger px-2 py-1.5 rounded-sm hover:text-danger-700 cursor-pointer'>
                                                                <Trash2 className='w-3.5 h-3.5' />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        {!editProductData.id && variations.length > 1 && (
                                            <div className='flex justify-end pt-2'>
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        removeVariation(index)
                                                    }
                                                    className='text-red-500 bg-danger/10 hover:bg-danger/30 border border-danger px-2 py-1.5 rounded-sm hover:text-danger-700 cursor-pointer'>
                                                    <Trash2 className='w-3.5 h-3.5' />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <section className='flex flex-col gap-3 pt-4 border-t border-divider'>
                        {editProductData.id &&
                            onOpenStockAdjust &&
                            productType === 'simple' && (
                                <section className='flex flex-row justify-between gap-3'>
                                    <div className='w-1/2 px-4 py-3 border border-accent/85 text-accent rounded-md text-sm flex items-center justify-between'>
                                        <span>Stock actual</span>
                                        <span className='font-semibold text-accent'>
                                            {defaultVar?.stock ?? 0}
                                        </span>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => onOpenStockAdjust()}
                                        className='w-1/2 flex items-center justify-center gap-2 px-4 py-3 bg-accent/5 border border-accent/85 text-accent hover:bg-hover rounded-lg transition cursor-pointer font-medium'>
                                        <Settings2 className='w-4 h-4' />
                                        Ajustar Stock
                                    </button>
                                </section>
                            )}
                        <div className='flex justify-end gap-4'>
                            <button
                                type='button'
                                className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                                onClick={handleOpenModal}>
                                Cancelar
                            </button>
                            <button
                                type='submit'
                                disabled={!isFormValid || submitting}
                                className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                {submitting ? (
                                    <>
                                        <Loader className='w-5 h-5 animate-spin text-surface' />{' '}
                                        {editProductData.id
                                            ? 'Actualizando...'
                                            : 'Guardando...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className='w-5 h-5' />{' '}
                                        {editProductData.id
                                            ? 'Actualizar'
                                            : 'Guardar'}
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </SharedModal>
    )
}
