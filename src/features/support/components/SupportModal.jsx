import { X, Loader, Send, MessageCircleQuestionMark } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useEscape } from '../../../shared/helpers/useEscape'
import { createSupportTicket } from '../helpers/createSupportTicket'

const reportTypes = [
    { value: 'bug', label: 'Error del sistema' },
    { value: 'feature_request', label: 'Solicitud de función' },
    { value: 'billing', label: 'Problema de facturación' },
    { value: 'other', label: 'Otro' },
]

export const SupportModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        type: '',
        subject: '',
        description: '',
    })
    const [submitting, setSubmitting] = useState(false)

    useEscape(onClose)

    const isFormValid = formData.type && formData.subject.trim() && formData.description.trim()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await createSupportTicket(formData)
            toast.success('Ticket de soporte creado con éxito')
            onClose()
        } catch (error) {
            toast.error(error.message || 'Error al crear el ticket')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-50 p-4'>
            <section
                className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}>
                <section className='flex items-center justify-between px-6 py-4 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <MessageCircleQuestionMark className='w-5 h-5 text-accent' />
                        Registrar Soporte
                    </h2>
                    <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-6 h-6' />
                    </button>
                </section>
                <div className='p-6'>
                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Tipo de reporte
                            </label>
                            <select
                                name='type'
                                value={formData.type}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-surface'>
                                <option value=''>Seleccione un tipo</option>
                                {reportTypes.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Asunto
                            </label>
                            <input
                                type='text'
                                name='subject'
                                value={formData.subject}
                                onChange={handleChange}
                                autoFocus
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                placeholder='Describa brevemente el problema'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Descripción
                            </label>
                            <textarea
                                name='description'
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 resize-none'
                                placeholder='Explique el problema con detalle'
                            />
                        </section>
                        <section className='flex justify-end gap-4 pt-4 border-t border-divider'>
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
                                    ? <><Loader className='w-5 h-5 animate-spin' /> Enviando...</>
                                    : <><Send className='w-5 h-5' /> Enviar</>}
                            </button>
                        </section>
                    </form>
                </div>
            </section>
        </section>
    )
}
