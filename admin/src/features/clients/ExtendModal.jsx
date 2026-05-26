import { useState } from 'react'
import { Calendar, Loader } from 'lucide-react'
import { Modal } from '../../components/Modal.jsx'
import { extendSubscription } from './helpers/updateClient.js'

export const ExtendModal = ({ client, onClose, onSuccess }) => {
    const [newDate, setNewDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newDate) return
        setError('')
        setLoading(true)
        try {
            await extendSubscription(client.id, newDate)
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal onClose={onClose} title='Extender Suscripción' icon={Calendar}>
            <form onSubmit={handleSubmit} className='p-6 flex flex-col gap-4'>
                    <p className='text-sm text-on-body'>
                        Cliente: <span className='font-semibold text-on-surface'>{client.business_name}</span>
                    </p>

                    {error && (
                        <p className='text-xs font-semibold text-red-500'>{error}</p>
                    )}

                    <section className='flex flex-col gap-2'>
                        <label className='block text-sm font-medium text-on-body'>Nueva fecha de vencimiento</label>
                        <input
                            type='date'
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            required
                        />
                    </section>

                    <section className='flex justify-end gap-4 pt-4 border-t border-divider'>
                        <button type='button' onClick={onClose} className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition text-sm cursor-pointer'>
                            Cancelar
                        </button>
                        <button type='submit' disabled={loading} className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                            {loading && <Loader className='w-4 h-4 animate-spin' />}
                            {loading ? 'Guardando...' : 'Extender'}
                        </button>
                    </section>
                </form>
        </Modal>
    )
}
