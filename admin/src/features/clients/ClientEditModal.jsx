import { useState, useRef } from 'react'
import { Edit3, Loader, AlertCircle, UserCheck, UserX, Calendar, RefreshCw, AlertTriangle, Trash2, RotateCcw } from 'lucide-react'
import { Modal } from '../../components/Modal.jsx'
import { toggleClientStatus, changeBillingFrequency, extendSubscription, manualRenewal, updateClientInfo } from './helpers/updateClient.js'
import { clearClientData } from './helpers/clearClientData.js'
import { deleteClient } from './helpers/deleteClient.js'
import { sileo } from 'sileo'

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

export const ClientEditModal = ({ client, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        business_name: client.business_name || '',
        owner_name: client.owner_name || '',
        email: client.email || '',
        phone: client.phone || '',
    })
    const [extendDate, setExtendDate] = useState(() => client.subscription?.current_period_end || '')
    const [error, setError] = useState('')
    const [savingInfo, setSavingInfo] = useState(false)
    const [toggling, setToggling] = useState(false)
    const [renewing, setRenewing] = useState(false)
    const [extending, setExtending] = useState(false)
    const [isEditingDate, setIsEditingDate] = useState(false)
    const [liveSub, setLiveSub] = useState(client.subscription)
    const [confirmAction, setConfirmAction] = useState(null)
    const [confirmText, setConfirmText] = useState('')
    const [clearing, setClearing] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const dateInputRef = useRef(null)

    const sub = liveSub
    const isActive = sub?.status === 'active'
    const extendDateExpired = extendDate && extendDate < new Date().toLocaleDateString('en-CA')

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSaveInfo = async () => {
        setError('')
        setSavingInfo(true)
        try {
            await updateClientInfo(client.id, form)
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSavingInfo(false)
        }
    }

    const handleToggle = async () => {
        setError('')
        setToggling(true)
        try {
            await toggleClientStatus(client.id, !isActive)
            setLiveSub((prev) => ({ ...prev, status: isActive ? 'expired' : 'active' }))
            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setToggling(false)
        }
    }

    const handleFreqChange = async (freq) => {
        setError('')
        try {
            await changeBillingFrequency(client.id, freq)
            setLiveSub((prev) => ({ ...prev, billing_frequency: freq }))
            onSuccess()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleExtend = async () => {
        if (!extendDate) return
        setError('')
        setExtending(true)
        try {
            await extendSubscription(client.id, extendDate)
            setLiveSub((prev) => ({ ...prev, current_period_end: extendDate, status: 'active' }))
            setExtendDate(extendDate)
            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setExtending(false)
        }
    }

    const handleRenew = async () => {
        setError('')
        setRenewing(true)
        try {
            await manualRenewal(client.id)
            const freq = liveSub?.billing_frequency || 'monthly'
            const daysMap = { monthly: 30, quarterly: 90, annual: 365 }
            // const now = new Date()
            const now = liveSub?.current_period_end
            console.log(now)
            const newEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (daysMap[freq] || 30))
            const newEnd = newEndDate.toLocaleDateString('en-CA')
            setLiveSub((prev) => ({ ...prev, current_period_end: newEnd, status: 'active' }))
            setExtendDate(newEnd)
            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setRenewing(false)
        }
    }

    const handleClearData = async () => {
        setError('')
        setClearing(true)
        try {
            await clearClientData(client.id)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Datos del cliente limpiados exitosamente',
            })
            setConfirmAction(null)
            setConfirmText('')
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setClearing(false)
        }
    }

    const handleDeleteAccount = async () => {
        setError('')
        setDeleting(true)
        try {
            await deleteClient(client.id)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Cuenta eliminada completamente',
            })
            setConfirmAction(null)
            setConfirmText('')
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    const openConfirm = (action) => {
        setConfirmAction(action)
        setConfirmText('')
    }

    const cancelConfirm = () => {
        setConfirmAction(null)
        setConfirmText('')
    }

    return (
        <Modal onClose={onClose} title='Editar Cliente' icon={Edit3} size='lg'>
            <div className='p-6 flex flex-col gap-6'>
                    {error && (
                        <div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                            <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                            <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
                        </div>
                    )}

                    <section>
                        <h3 className='text-sm font-semibold text-on-body uppercase tracking-wider mb-4'>Información del Negocio</h3>
                        <div className='flex flex-col gap-4'>
                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body'>Nombre del negocio</label>
                                <input name='business_name' value={form.business_name} onChange={handleChange} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0' />
                            </section>
                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body'>Nombre del dueño</label>
                                <input name='owner_name' value={form.owner_name} onChange={handleChange} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0' />
                            </section>
                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body'>Correo electrónico</label>
                                <input type='email' name='email' value={form.email} onChange={handleChange} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0' />
                            </section>
                            <section className='flex flex-col gap-2'>
                                <label className='block text-sm font-medium text-on-body'>Teléfono</label>
                                <input name='phone' value={form.phone} onChange={handleChange} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0' />
                            </section>
                        </div>
                    </section>

                    <section className='border-t border-divider' />

                    <section>
                        <h3 className='text-sm font-semibold text-on-body uppercase tracking-wider mb-4'>Suscripción</h3>
                        <div className='flex flex-col gap-4'>
                            <div className='flex items-center justify-between py-2'>
                                <span className='text-sm text-on-body'>Plan</span>
                                <span className='text-sm font-medium text-on-surface'>{sub?.plan?.name || 'Plan Emprendedor'}</span>
                            </div>

                            <div className='flex items-center justify-between py-2'>
                                <span className='text-sm text-on-body'>Estado</span>
                                <div className='flex items-center gap-3'>
                                    {isActive ? (
                                        <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'>Activa</span>
                                    ) : sub?.status === 'cancelled' ? (
                                        <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'>Cancelada</span>
                                    ) : (
                                        <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'>Expirada</span>
                                    )}
                                    <button
                                        onClick={handleToggle}
                                        disabled={toggling}
                                        className={`p-1.5 rounded-sm cursor-pointer transition flex items-center gap-1.5 text-xs font-medium ${isActive ? 'hover:bg-red-100 text-red-500' : 'hover:bg-green-100 text-green-500'}`}
                                    >
                                        {toggling ? <Loader className='w-4 h-4 animate-spin' /> : isActive ? <UserX className='w-4 h-4' /> : <UserCheck className='w-4 h-4' />}
                                        {isActive ? 'Desactivar' : 'Activar'}
                                    </button>
                                </div>
                            </div>

                            <div className='flex items-center justify-between py-2'>
                                <span className='text-sm text-on-body'>Frecuencia</span>
                                <div className='flex items-center gap-3'>
                                    <select
                                        value={sub?.billing_frequency || 'monthly'}
                                        onChange={(e) => handleFreqChange(e.target.value)}
                                        className='text-sm px-3 py-1.5 border border-divider rounded-md bg-surface text-on-body cursor-pointer focus:outline-none focus:border-accent'
                                    >
                                        <option value='monthly' className='text-on-body'>Mensual</option>
                                        <option value='quarterly' className='text-on-body'>Trimestral</option>
                                        <option value='annual' className='text-on-body'>Anual</option>
                                    </select>
                                    <button
                                        onClick={handleRenew}
                                        disabled={renewing}
                                        className='flex items-center gap-2 px-3 py-1.5 border border-accent text-accent rounded-md text-sm font-medium hover:bg-accent/5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {renewing ? <Loader className='w-4 h-4 animate-spin' /> : <RefreshCw className='w-4 h-4' />}
                                        Renovar
                                    </button>
                                </div>
                            </div>

                            <div className='flex items-center gap-3 py-2'>
                                <span className='text-sm text-on-body shrink-0'>Extender</span>
                                <span className='flex-1' />
                                <span className='relative w-5 h-5 flex items-center justify-center'>
                                    <Calendar
                                        className={`w-4 h-4 transition-all duration-200 cursor-pointer hover:text-accent z-10 ${
                                            isEditingDate ? 'text-accent' : 'text-on-body hover:text-accent'
                                        }`}
                                        onClick={() => dateInputRef.current?.showPicker()}
                                    />
                                    <input
                                        ref={dateInputRef}
                                        type='date'
                                        value={extendDate}
                                        onChange={(e) => {
                                            setExtendDate(e.target.value)
                                            setIsEditingDate(false)
                                        }}
                                        onFocus={() => setIsEditingDate(true)}
                                        onBlur={() => setIsEditingDate(false)}
                                        className='absolute top-0 left-0 inset-0 opacity-0 border-0'
                                    />
                                </span>
                                <span
                                    className={`text-sm font-medium truncate hover:text-accent transition-all duration-200 cursor-pointer ${extendDateExpired ? 'text-red-600' : 'text-on-surface'}`}
                                    onClick={() => dateInputRef.current?.showPicker()}
                                >
                                    {extendDate ? formatDate(extendDate) : 'Seleccionar fecha'}
                                </span>
                                <button
                                    onClick={handleExtend}
                                    disabled={extending || !extendDate}
                                    className='flex items-center gap-2 px-3 py-1.5 border border-accent text-accent rounded-md text-sm font-medium hover:bg-accent/5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {extending ? <Loader className='w-4 h-4 animate-spin' /> : <><Calendar className='w-4 h-4' /> Extender</>}
                                </button>
                            </div>
                        </div>
                    </section>
                    <section className='border-t border-divider' />

                    <section>
                        <div className='flex items-center gap-2 mb-4'>
                            <AlertTriangle className='w-4 h-4 text-red-500' />
                            <h3 className='text-sm font-semibold text-red-500 uppercase tracking-wider'>Zona de Peligro</h3>
                        </div>
                        <div className='border border-red-200 dark:border-red-900/50 rounded-lg divide-y divide-red-200 dark:divide-red-900/50'>
                            <div className='p-4 flex flex-col gap-3'>
                                <div className='flex items-start justify-between gap-4'>
                                    <div>
                                        <p className='text-sm font-medium text-on-surface'>Limpiar datos del cliente</p>
                                        <p className='text-xs text-muted mt-1'>
                                            Elimina todas las ventas, productos, inventario, categorías, movimientos y tickets de soporte.
                                            La suscripción, datos del negocio y pagos se conservan.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openConfirm('clear')}
                                        disabled={confirmAction === 'clear' || clearing}
                                        className='shrink-0 flex items-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {clearing ? <Loader className='w-4 h-4 animate-spin' /> : <RotateCcw className='w-4 h-4' />}
                                        {clearing ? 'Limpiando...' : 'Limpiar Datos'}
                                    </button>
                                </div>
                                {confirmAction === 'clear' && (
                                    <div className='bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 flex flex-col gap-3'>
                                        <div className='flex items-start gap-2'>
                                            <AlertTriangle className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
                                            <div>
                                                <p className='text-sm font-medium text-red-700 dark:text-red-300'>¿Estás seguro?</p>
                                                <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                                                    Esta acción eliminará permanentemente todos los datos operacionales de <strong>{client.business_name}</strong>.
                                                    No se puede deshacer. Escribe <strong>CONFIRMAR</strong> para continuar.
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type='text'
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder='Escribe CONFIRMAR'
                                            className='w-full px-4 py-3 border border-red-300 dark:border-red-700 rounded-md text-sm bg-surface focus:outline-none focus:border-red-500 focus:ring-0'
                                            autoFocus
                                        />
                                        <div className='flex gap-2 justify-end'>
                                            <button
                                                onClick={cancelConfirm}
                                                className='px-3 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition text-sm cursor-pointer'
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleClearData}
                                                disabled={confirmText !== 'CONFIRMAR' || clearing}
                                                className='flex items-center gap-2 px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-800 font-medium transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {clearing && <Loader className='w-4 h-4 animate-spin' />}
                                                {clearing ? 'Limpiando...' : 'Sí, limpiar datos'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='p-4 flex flex-col gap-3'>
                                <div className='flex items-start justify-between gap-4'>
                                    <div>
                                        <p className='text-sm font-medium text-red-600 dark:text-red-400'>Eliminar cuenta</p>
                                        <p className='text-xs text-muted mt-1'>
                                            Elimina permanentemente el negocio, suscripción, pagos, usuarios y todos los datos asociados.
                                            El cliente no podrá acceder nunca más.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openConfirm('delete')}
                                        disabled={confirmAction === 'delete' || deleting}
                                        className='shrink-0 flex items-center gap-2 px-3 py-2 bg-red-600/80 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {deleting ? <Loader className='w-4 h-4 animate-spin' /> : <Trash2 className='w-4 h-4' />}
                                        {deleting ? 'Eliminando...' : 'Eliminar Cuenta'}
                                    </button>
                                </div>
                                {confirmAction === 'delete' && (
                                    <div className='bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 flex flex-col gap-3'>
                                        <div className='flex items-start gap-2'>
                                            <AlertTriangle className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
                                            <div>
                                                <p className='text-sm font-medium text-red-700 dark:text-red-300'>¡Esta acción es irreversible!</p>
                                                <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                                                    Se eliminará <strong>todo</strong> lo relacionado con <strong>{client.business_name}</strong>:
                                                    negocio, suscripción, pagos, usuarios y datos operacionales.
                                                    El cliente no podrá recuperar nada. Escribe <strong>ELIMINAR</strong> para continuar.
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type='text'
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder='Escribe ELIMINAR'
                                            className='w-full px-4 py-3 border border-red-300 dark:border-red-700 rounded-md text-sm bg-surface focus:outline-none focus:border-red-500 focus:ring-0'
                                            autoFocus
                                        />
                                        <div className='flex gap-2 justify-end'>
                                            <button
                                                onClick={cancelConfirm}
                                                className='px-3 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition text-sm cursor-pointer'
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={confirmText !== 'ELIMINAR' || deleting}
                                                className='flex items-center gap-2 px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700 font-medium transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {deleting && <Loader className='w-4 h-4 animate-spin' />}
                                                {deleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <section className='flex justify-end gap-4 px-6 py-4 border-t border-divider'>
                    <button type='button' onClick={onClose} className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition text-sm cursor-pointer'>
                        Cancelar
                    </button>
                    <button
                        type='button'
                        onClick={handleSaveInfo}
                        disabled={savingInfo}
                        className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                        {savingInfo && <Loader className='w-4 h-4 animate-spin' />}
                        {savingInfo ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </section>
        </Modal>
    )
}
