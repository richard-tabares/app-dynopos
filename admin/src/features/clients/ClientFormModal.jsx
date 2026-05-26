import { useState } from 'react'
import { UserPlus, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Modal } from '../../components/Modal.jsx'
import { createClient } from './helpers/createClient.js'

export const ClientFormModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        business_name: '',
        owner_name: '',
        email: '',
        phone: '',
        password: '',
        billing_frequency: 'monthly',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await createClient(form)
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            title='Nuevo Cliente'
            icon={UserPlus}
            size='lg'>
            <form
                onSubmit={handleSubmit}
                className='p-6 flex flex-col gap-4'>
                {error && (
                    <div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                        <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                        <p className='text-sm text-red-700 dark:text-red-300'>
                            {error}
                        </p>
                    </div>
                )}

                <section className='flex flex-col gap-2'>
                    <label className='block text-sm font-medium text-on-body'>
                        Nombre del negocio{' '}
                        <span className='text-red-500'>*</span>
                    </label>
                    <input
                        name='business_name'
                        value={form.business_name}
                        onChange={handleChange}
                        placeholder='Ej: Mi Tienda'
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                        required
                    />
                </section>

                <section className='flex flex-col gap-2'>
                    <label className='block text-sm font-medium text-on-body'>
                        Nombre del dueño <span className='text-red-500'>*</span>
                    </label>
                    <input
                        name='owner_name'
                        value={form.owner_name}
                        onChange={handleChange}
                        placeholder='Ej: Juan Pérez'
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                        required
                    />
                </section>

                <section className='flex flex-col gap-2'>
                    <label className='block text-sm font-medium text-on-body'>
                        Correo electrónico{' '}
                        <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='email'
                        name='email'
                        value={form.email}
                        onChange={handleChange}
                        placeholder='ejemplo@correo.com'
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                        required
                    />
                </section>

                <section className='flex flex-col gap-2'>
                    <label className='block text-sm font-medium text-on-body'>
                        Teléfono <span className='text-red-500'>*</span>
                    </label>
                    <input
                        name='phone'
                        value={form.phone}
                        onChange={handleChange}
                        placeholder='+57 300 000 0000'
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                        required
                    />
                </section>

                <section className='flex flex-col gap-2'>
                    <label className='block text-sm font-medium text-on-body'>
                        Contraseña temporal{' '}
                        <span className='text-red-500'>*</span>
                    </label>
                    <section className='relative flex items-center'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            value={form.password}
                            onChange={handleChange}
                            placeholder='••••••••'
                            className='w-full px-4 py-3 pr-10 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            required
                        />
                        <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 bg-transparent border-none cursor-pointer text-accent'>
                            {showPassword ? (
                                <EyeOff className='w-5 h-5' />
                            ) : (
                                <Eye className='w-5 h-5' />
                            )}
                        </button>
                    </section>
                </section>

                <section className='flex flex-col gap-2'>
                    <label className='block text-sm font-medium text-on-body'>
                        Frecuencia de facturación
                    </label>
                    <select
                        name='billing_frequency'
                        value={form.billing_frequency}
                        onChange={handleChange}
                        className='w-full px-4 py-3 bg-surface border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-body'>
                        <option value='monthly' className='text-on-body'>Mensual</option>
                        <option value='quarterly' className='text-on-body'>Trimestral</option>
                        <option value='annual' className='text-on-body'>Anual</option>
                    </select>
                </section>

                <section className='flex justify-end gap-4 pt-4 border-t border-divider'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition text-sm cursor-pointer'>
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        disabled={loading}
                        className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                        {loading && <Loader className='w-4 h-4 animate-spin' />}
                        {loading ? 'Creando...' : 'Crear Cliente'}
                    </button>
                </section>
            </form>
        </Modal>
    )
}
