import { useEffect, useState } from 'react'
import { Tag, Plus, Edit2, Trash2, Search, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { useStore } from '../../../app/providers/store'
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

    useEscape(showModal ? handleEscapeCreate : showDeleteConfirm ? handleEscapeDelete : null)

    const businessId = user?.data?.user?.id

    const loadCategories = async () => {
        if (!businessId) return
        try {
            const data = await getCategories(businessId)
            setCategories(data)
        } catch {
            toast.error('Error al cargar categorías')
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

    const openEditModal = (category) => {
        setEditingCategory(category)
        setCategoryName(category.name)
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!categoryName.trim()) {
            toast.warn('El nombre de la categoría es obligatorio')
            return
        }

        setSaving(true)
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, {
                    name: categoryName.trim(),
                })
                toast.success('Categoría actualizada exitosamente')
            } else {
                await createCategory({
                    business_id: businessId,
                    name: categoryName.trim(),
                })
                toast.success('Categoría creada exitosamente')
            }
            setCategoryName('')
            setEditingCategory(null)
            await loadCategories()
            setShowModal(false)
        } catch (error) {
            toast.error(error.message || 'Error al guardar la categoría')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!showDeleteConfirm) return
        setLoading(true)
        try {
            await deleteCategory(showDeleteConfirm.id)
            toast.success('Categoría eliminada exitosamente')
            setShowDeleteConfirm(null)
            await loadCategories()
        } catch (error) {
            toast.error(error.message || 'Error al eliminar la categoría')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Create/Edit Modal */}
            {showModal && (
                <section className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'>
                    <section className='bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden'>
                        <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
                            <h3 className='text-lg font-bold text-gray-900'>
                                {editingCategory
                                    ? 'Editar Categoría'
                                    : 'Nueva Categoría'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setEditingCategory(null)
                                    setCategoryName('')
                                }}
                                className='p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer'>
                                <X className='w-5 h-5 text-gray-500' />
                            </button>
                        </div>
                        <div className='p-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Nombre
                            </label>
                            <input
                                type='text'
                                value={categoryName}
                                onChange={(e) =>
                                    setCategoryName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleSave()
                                    }
                                }}
                                placeholder='Nombre de la categoría'
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'
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
                                className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm cursor-pointer'>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !categoryName.trim()}
                                className='flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition text-sm disabled:opacity-50 cursor-pointer'>
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </section>
                </section>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <section
                    className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'
                    onClick={() => setShowDeleteConfirm(null)}>
                    <section
                        className='bg-white rounded-lg shadow-2xl w-full max-w-sm relative overflow-hidden'
                        onClick={(e) => e.stopPropagation()}>
                        <div className='p-6 text-center'>
                            <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                                <Trash2 className='w-6 h-6 text-red-600' />
                            </div>
                            <h3 className='text-lg font-bold text-gray-900 mb-2'>
                                Eliminar Categoría
                            </h3>
                            <p className='text-sm text-gray-500'>
                                ¿Estás seguro de eliminar{' '}
                                <strong>{showDeleteConfirm.name}</strong>? Esta
                                acción no se puede deshacer.
                            </p>
                        </div>
                        <div className='px-6 pb-6 flex gap-3'>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm cursor-pointer'>
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className='flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm disabled:opacity-50 cursor-pointer'>
                                {loading ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </section>
                </section>
            )}

            <section className='flex flex-col gap-6'>
                {/* Titulo de la sección categorías */}
                <section>
                    <h1 className='text-2xl font-bold'>Categorías</h1>
                    <p className='text-gray-600'>
                        Aquí puedes gestionar las categorías de tus productos,
                        agregar nuevas, editar las existentes y eliminar las que
                        ya no necesites.
                    </p>
                </section>
                <section className='bg-white border border-gray-300 shadow-sm overflow-hidden rounded-lg'>
                    {/* Titulo y boton de nueva categoría de la tabla */}
                    <section className='border-b border-gray-300 flex justify-between items-center px-6 py-4 bg-gray-50/50'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Tag className='w-5 h-5 text-primary-600' />
                            Lista de Categorías
                            <span className='text-sm text-gray-500 font-medium'>
                                Total ({filteredCategories.length})
                            </span>
                        </h2>
                        <button
                            className='flex items-center font-medium px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition cursor-pointer'
                            onClick={openCreateModal}>
                            <Plus className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                            Nueva Categoría
                        </button>
                    </section>
                    {/* Contenido de la tabla de categorías */}
                    <section className='px-6 py-4 border-b border-gray-200'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                                placeholder='Buscar categorías...'
                            />
                        </div>
                    </section>
                    <section className='overflow-x-auto scrollbar-thin'>
                        <table className='w-full text-left'>
                            <thead>
                                <tr className='bg-gray-100 border-b border-gray-300'>
                                    <th className='px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider'>
                                        Nombre
                                    </th>
                                    <th className='px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right'>
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {filteredCategories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className='hover:bg-gray-50 transition-colors text-sm'>
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center gap-2'>
                                                <Tag className='w-4 h-4 text-primary-600' />
                                                <span className='font-medium text-gray-900'>
                                                    {category.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            <section className='flex items-center justify-end gap-2'>
                                                <button
                                                    onClick={() =>
                                                        openEditModal(category)
                                                    }
                                                    className='hover:bg-gray-200 p-2 rounded-sm cursor-pointer'
                                                    title='Editar Categoría'>
                                                    <Edit2 className='w-4 h-4 text-primary-600' />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowDeleteConfirm(
                                                            category,
                                                        )
                                                    }
                                                    className='hover:bg-red-700 bg-red-600 text-white p-2 rounded-sm cursor-pointer'
                                                    title='Eliminar Categoría'>
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </section>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    {filteredCategories.length === 0 && (
                        <div className='p-12 text-center'>
                            <Tag className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                            <p className='text-gray-500 font-medium'>
                                No se encontraron categorías
                            </p>
                        </div>
                    )}
                </section>
            </section>
        </>
    )
}
