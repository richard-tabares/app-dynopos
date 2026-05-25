import { useEffect, useState } from 'react'
import { Tag, Plus, Edit2, Trash2, Search, Loader, Save } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../app/providers/store'
import { Modal } from '../../../shared/components/Modal'
import { getCategories } from '../../categories/helpers/getCategories'
import { createCategory } from '../../categories/helpers/createCategory'
import { updateCategory } from '../../categories/helpers/updateCategory'
import { deleteCategory } from '../../categories/helpers/deleteCategory'
import { useEscape } from '../../../shared/helpers/useEscape'

export const Categories = () => {
    const { user, categories, setCategories } = useStore()
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [categoryName, setCategoryName] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    const [saving, setSaving] = useState(false)

    const handleEscapeCreate = () => {
        setShowModal(false)
        setEditingCategory(null)
        setCategoryName('')
    }

    const handleEscapeDelete = () => setShowDeleteConfirm(null)

    useEscape(
        showModal
            ? handleEscapeCreate
            : showDeleteConfirm
              ? handleEscapeDelete
              : null,
    )

    const businessId = user?.profile?.business_id || user?.data?.user?.id

    const loadCategories = async () => {
        if (!businessId) return
        try {
            const data = await getCategories(businessId)
            setCategories(data)
        } catch {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: 'Error al cargar categorías',
            })
        }
    }

    useEffect(() => {
        loadCategories()
    }, [businessId])

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const openCreateModal = () => {
        setEditingCategory(null)
        setCategoryName('')
        setShowModal(true)
    }

    const openEditModal = (category, e) => {
        e.stopPropagation()
        setEditingCategory(category)
        setCategoryName(category.name)
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!categoryName.trim()) {
            sileo.warning({
                fill: 'var(--toast-warning)',
                title: 'Atención',
                description: 'El nombre de la categoría es obligatorio',
            })
            return
        }

        setSaving(true)
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, {
                    name: categoryName.trim(),
                })
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Categoría actualizada exitosamente',
                })
            } else {
                await createCategory({
                    business_id: businessId,
                    name: categoryName.trim(),
                })
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Categoría creada exitosamente',
                })
            }
            setCategoryName('')
            setEditingCategory(null)
            await loadCategories()
            setShowModal(false)
        } catch (error) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: error.message || 'Error al guardar la categoría',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (e) => {
        e.stopPropagation()
        if (!showDeleteConfirm) return
        setLoading(true)
        try {
            await deleteCategory(showDeleteConfirm.id)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Categoría eliminada exitosamente',
            })
            setShowDeleteConfirm(null)
            await loadCategories()
        } catch (error) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: error.message || 'Error al eliminar la categoría',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Create/Edit Modal */}
            {showModal && (
                <Modal
                    onClose={() => {
                        setShowModal(false)
                        setEditingCategory(null)
                        setCategoryName('')
                    }}
                    title={
                        editingCategory ? 'Editar Categoría' : 'Nueva Categoría'
                    }
                    icon={Tag}>
                    <div className='p-6'>
                        <label className='block text-sm font-medium text-on-body mb-2'>
                            Nombre
                        </label>
                        <input
                            type='text'
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSave()
                                }
                            }}
                            placeholder='Nombre de la categoría'
                            className='w-full border border-divider rounded-md py-3 px-4 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                            autoFocus
                        />
                    </div>
                    <div className='px-6 pb-6 flex gap-3'>
                        <button
                            onClick={() => {
                                setShowModal(false)
                                setEditingCategory(null)
                                setCategoryName('')
                            }}
                            className='flex-1 py-2.5 border border-outline text-on-body rounded-lg font-medium hover:bg-hover transition text-sm cursor-pointer'>
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !categoryName.trim()}
                            className='flex-1 py-2.5 bg-accent text-surface rounded-lg font-bold hover:bg-accent/85 transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {saving ? (
                                <>
                                    <Loader className='w-5 h-5 animate-spin text-surface' />{' '}
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className='w-5 h-5' /> Guardar
                                </>
                            )}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <Modal
                    onClose={() => setShowDeleteConfirm(null)}
                    title='Eliminar Categoría'
                    icon={Trash2}
                    iconColor='text-red-600'
                    size='sm'>
                    <div className='p-6'>
                        <p className='text-sm text-muted'>
                            ¿Estás seguro de eliminar{' '}
                            <strong>{showDeleteConfirm.name}</strong>? Esta
                            acción no se puede deshacer.
                        </p>
                    </div>
                    <div className='px-6 pb-6 flex gap-3'>
                        <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className='flex-1 py-2.5 border border-outline text-on-body rounded-lg font-medium hover:bg-hover transition text-sm cursor-pointer'>
                            Cancelar
                        </button>
                        <button
                            onClick={(e) => handleDelete(e)}
                            disabled={loading}
                            className='flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2'>
                            {loading ? (
                                <>
                                    <Loader className='w-5 h-5 animate-spin text-accent' />{' '}
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className='w-5 h-5' /> Eliminar
                                </>
                            )}
                        </button>
                    </div>
                </Modal>
            )}

            <section className='flex flex-col gap-6'>
                {/* Titulo de la sección categorías */}
                <section>
                    <h1 className='text-2xl font-bold'>Categorías</h1>
                    <p className='text-on-body'>
                        Aquí puedes gestionar las categorías de tus productos,
                        agregar nuevas, editar las existentes y eliminar las que
                        ya no necesites.
                    </p>
                </section>
                <section className='bg-surface border border-outline shadow-xs rounded-lg'>
                    <section className='border-b border-outline flex justify-between items-center px-6 py-4 bg-subtle'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Tag className='w-5 h-5 text-accent' />
                            <span className='flex flex-col'>
                                Lista de Categorías
                                <span className='text-sm text-muted font-medium'>
                                    Total ({filteredCategories.length})
                                </span>
                            </span>
                        </h2>
                        <button
                            className='flex items-center gap-2 px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent/85 transition cursor-pointer'
                            onClick={openCreateModal}>
                            <Tag className='w-5 h-5' />
                            Nueva Categoría
                        </button>
                    </section>
                    <section className='p-6'>
                        <div className='relative mb-4'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                                placeholder='Buscar categorías...'
                            />
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                                <thead>
                                    <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                        <th className='text-left py-3 px-4 font-medium'>
                                            Nombre
                                        </th>
                                        <th className='text-right py-3 px-4 font-medium'>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className='border-b border-divider-light hover:bg-hover cursor-pointer'
                                            onClick={(e) => {
                                                openEditModal(category, e)
                                            }}>
                                            <td className='py-3 px-4'>
                                                <div className='flex items-center gap-2'>
                                                    <Tag className='w-4 h-4 text-accent' />
                                                    <span className='font-medium text-on-surface'>
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='py-3 px-4 text-right'>
                                                <section className='flex items-center justify-end gap-3'>
                                                    <button
                                                        onClick={(e) =>
                                                            openEditModal(
                                                                category,
                                                                e,
                                                            )
                                                        }
                                                        className='bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 p-1.5 rounded-sm cursor-pointer'
                                                        title='Editar Categoría'>
                                                        <Edit2 className='w-4 h-4 text-accent' />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowDeleteConfirm(
                                                                category,
                                                            )
                                                        }}
                                                        className='hover:bg-red-500 bg-red-400 text-white p-1.5 rounded-sm cursor-pointer'
                                                        title='Eliminar Categoría'>
                                                        <Trash2 className='w-4 h-4' />
                                                    </button>
                                                </section>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    {filteredCategories.length === 0 && (
                        <div className='text-center text-faint italic py-12 px-6'>
                            No se encontraron categorías
                        </div>
                    )}
                </section>
            </section>
        </>
    )
}
