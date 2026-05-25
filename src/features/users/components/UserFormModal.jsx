import { X, Loader, Save, Trash2, Eye, EyeClosed, Users, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { sileo } from 'sileo'
import { useEscape } from '../../../shared/helpers/useEscape'
import { createUser } from '../helpers/createUser'
import { updateUser } from '../helpers/updateUser'
import { deleteUser } from '../helpers/deleteUser'
import { PermissionSelector } from '../../../shared/components/PermissionSelector'
import { getDefaultPermissions } from '../../../shared/helpers/permissions'

const roles = [
    { value: 'cajero', label: 'Cajero' },
    { value: 'supervisor', label: 'Supervisor' },
]

export const UserFormModal = ({ mode, userData, onClose, onSuccess }) => {
    const isEdit = mode === 'edit'
    const [formData, setFormData] = useState({
        display_name: userData?.display_name || '',
        email: '',
        password: '',
        confirm_password: '',
        role: userData?.role || 'cajero',
    })
    const [permissions, setPermissions] = useState(userData?.permissions || [])
    const [submitting, setSubmitting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEscape(onClose)

    const validatePassword = (password) => {
        const hasLetters = /[a-zA-Z]/.test(password)
        const hasNumbers = /[0-9]/.test(password)
        const isLongEnough = password.length >= 8
        return hasLetters && hasNumbers && isLongEnough
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const handleBlur = (e) => {
        const { name } = e.target
        setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const isFormValid = isEdit
        ? formData.display_name.trim().length > 0
        : formData.display_name.trim().length > 0
            && validateEmail(formData.email)
            && validatePassword(formData.password)
            && formData.password === formData.confirm_password

    const validateForm = () => {
        const newErrors = {}
        if (!validateEmail(formData.email)) {
            newErrors.email = 'Por favor, ingresa un email válido'
        }
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria'
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                'La contraseña debe tener al menos 8 caracteres con letras y números'
        }
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Debes confirmar la contraseña'
        } else if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Las contraseñas no coinciden'
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isEdit) {
            const newErrors = validateForm()
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                setTouched({
                    email: true,
                    password: true,
                    confirm_password: true,
                })
                return
            }
        }

        setSubmitting(true)
        try {
            const payload = {
                display_name: formData.display_name,
                role: formData.role,
                permissions,
            }
            if (isEdit) {
                await updateUser(userData.id, payload)
                sileo.success({ fill: 'var(--toast-success)', title: 'Actualizado', description: 'Usuario actualizado correctamente' })
            } else {
                await createUser({ ...payload, email: formData.email, password: formData.password })
                sileo.success({ fill: 'var(--toast-success)', title: 'Creado', description: 'Usuario creado correctamente' })
            }
            onSuccess()
            onClose()
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteUser(userData.id)
            sileo.success({ fill: 'var(--toast-success)', title: 'Eliminado', description: 'Usuario eliminado correctamente' })
            onSuccess()
            onClose()
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <section className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-50 p-4'>
            <section
                className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}>
                <section className='flex items-center justify-between px-6 py-4 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Users className='w-5 h-5 text-accent' />
                        {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-6 h-6' />
                    </button>
                </section>
                <form onSubmit={handleSubmit} className='p-6 flex flex-col gap-4'>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Nombre
                        </label>
                        <input
                            type='text'
                            name='display_name'
                            value={formData.display_name}
                            onChange={handleChange}
                            autoFocus
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Nombre del usuario'
                        />
                    </section>

                    {!isEdit && (
                        <>
                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Correo electrónico{' '}
                                    <span className='text-red-500 font-bold'>*</span>
                                </label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-3 border rounded-md transition-all duration-300 focus:outline-none ${
                                        touched.email && errors.email
                                            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0'
                                            : 'border-divider focus:border-accent focus:ring-0'
                                    }`}
                                    placeholder='correo@ejemplo.com'
                                />
                                {touched.email && errors.email && (
                                    <p className='text-xs font-semibold text-red-500'>
                                        {errors.email}
                                    </p>
                                )}
                            </section>

                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Contraseña{' '}
                                    <span className='text-red-500 font-bold'>*</span>
                                </label>
                                <section className='relative flex items-center'>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name='password'
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder='Mínimo 8 caracteres (letras y números)'
                                        className={`w-full px-4 py-3 pr-10 border rounded-md transition-all duration-300 focus:outline-none ${
                                            touched.password && errors.password
                                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0'
                                                : 'border-divider focus:border-accent focus:ring-0'
                                        }`}
                                    />
                                    <button
                                        type='button'
                                        className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <Eye /> : <EyeClosed />}
                                    </button>
                                </section>
                                {touched.password && errors.password && (
                                    <p className='text-xs font-semibold text-red-500'>
                                        {errors.password}
                                    </p>
                                )}
                                {formData.password && !errors.password && (
                                    <section className='bg-accent/10 border-l-4 border-accent p-3 rounded flex flex-col gap-1.5'>
                                        <p className='text-xs font-semibold text-on-surface'>
                                            Requisitos cumplidos:
                                        </p>
                                        <section
                                            className={`text-xs transition-colors duration-300 ${/[a-zA-Z]/.test(formData.password) ? 'text-green-600 font-semibold' : 'text-muted'}`}>
                                            ✓ Contiene letras
                                        </section>
                                        <section
                                            className={`text-xs transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'text-green-600 font-semibold' : 'text-muted'}`}>
                                            ✓ Contiene números
                                        </section>
                                        <section
                                            className={`text-xs transition-colors duration-300 ${formData.password.length >= 8 ? 'text-green-600 font-semibold' : 'text-muted'}`}>
                                            ✓ Mínimo 8 caracteres
                                        </section>
                                    </section>
                                )}
                            </section>

                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body mb-1'>
                                    Confirmar contraseña{' '}
                                    <span className='text-red-500 font-bold'>*</span>
                                </label>
                                <section className='relative flex items-center'>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name='confirm_password'
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder='Confirma tu contraseña'
                                        className={`w-full px-4 py-3 pr-10 border rounded-md transition-all duration-300 focus:outline-none ${
                                            touched.confirm_password &&
                                            errors.confirm_password
                                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0'
                                                : 'border-divider focus:border-accent focus:ring-0'
                                        }`}
                                    />
                                    <button
                                        type='button'
                                        className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }>
                                        {showConfirmPassword ? <Eye /> : <EyeClosed />}
                                    </button>
                                </section>
                                {touched.confirm_password && errors.confirm_password && (
                                    <p className='text-xs font-semibold text-red-500'>
                                        {errors.confirm_password}
                                    </p>
                                )}
                                {formData.confirm_password &&
                                    formData.password === formData.confirm_password &&
                                    !errors.confirm_password && (
                                        <p className='text-xs font-semibold text-green-600'>
                                            ✓ Las contraseñas coinciden
                                        </p>
                                    )}
                            </section>
                        </>
                    )}

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Rol
                        </label>
                        <select
                            name='role'
                            value={formData.role}
                            onChange={(e) => {
                                handleChange(e)
                                setPermissions(getDefaultPermissions(e.target.value))
                            }}
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-surface'>
                            {roles.map((r) => (
                                <option className='text-select-input' key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1 flex items-center gap-1.5'>
                            <ShieldCheck className='w-4 h-4 text-accent' />
                            Permisos por sección
                        </label>
                        <section className='border border-divider rounded-md px-3 py-1 bg-body/20'>
                            <PermissionSelector
                                value={permissions}
                                onChange={setPermissions}
                                role={formData.role}
                            />
                        </section>
                    </section>

                    {isEdit && showDeleteConfirm ? (
                        <section className='bg-danger/5 border border-danger/20 rounded-lg p-4 space-y-3'>
                            <p className='text-sm font-medium text-danger text-center'>
                                ¿Estás seguro de eliminar este usuario?
                            </p>
                            <section className='flex gap-3'>
                                <button
                                    type='button'
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className='flex-1 px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'>
                                    Cancelar
                                </button>
                                <button
                                    type='button'
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className='flex-1 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/85 font-medium transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2'>
                                    {deleting ? <Loader className='w-4 h-4 animate-spin' /> : <Trash2 className='w-4 h-4' />}
                                    Eliminar
                                </button>
                            </section>
                        </section>
                    ) : isEdit ? (
                        <button
                            type='button'
                            onClick={() => setShowDeleteConfirm(true)}
                            className='w-full flex items-center justify-center gap-2 px-4 py-3 border border-danger/30 text-danger hover:bg-danger/5 rounded-lg transition cursor-pointer font-medium'>
                            <Trash2 className='w-4 h-4' />
                            Eliminar este usuario
                        </button>
                    ) : null}

                    <section className='flex justify-end gap-4 pt-4'>
                        <button
                            type='button'
                            className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                            onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={!isFormValid || submitting}
                            className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {submitting
                                ? <><Loader className='w-5 h-5 animate-spin' /> Guardando...</>
                                : <><Save className='w-5 h-5' /> {isEdit ? 'Guardar' : 'Crear Usuario'}</>}
                        </button>
                    </section>
                </form>
            </section>
        </section>
    )
}
