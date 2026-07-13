import { Loader, Send, MessageCircleQuestionMark } from 'lucide-react'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Modal } from '../../../shared/components/Modal'
import { RequiredIndicator } from '../../../shared/components/RequiredIndicator'
import { useIsMobileDevice } from '../../../shared/hooks/useIsMobileDevice'
import { createSupportTicket } from '../helpers/createSupportTicket'

const reportTypes = [
    { value: 'bug', label: 'Error del sistema' },
    { value: 'feature_request', label: 'Solicitud de función' },
    { value: 'billing', label: 'Problema de facturación' },
    { value: 'other', label: 'Otro' },
]

export const SupportModal = ({ onClose }) => {
    const isMobileDevice = useIsMobileDevice()
    const [formData, setFormData] = useState({
        type: '',
        subject: '',
        description: '',
    })
    const [submitting, setSubmitting] = useState(false)

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
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Ticket de soporte creado con éxito'})
            onClose()
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al crear el ticket'})
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            title='Registrar Soporte'
            icon={MessageCircleQuestionMark}
        >
            <div className='p-6'>
                <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Tipo de reporte{' '}<RequiredIndicator />
                        </label>
                        <select
                            name='type'
                            value={formData.type}
                            onChange={handleChange}
                            className='w-full px-4 py-3 bg-surface border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-body'>
                            <option className='text-on-body' value=''>Seleccione un tipoaaa</option>
                            {reportTypes.map((t) => (
                                <option className='text-on-body' key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </section>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Asunto{' '}<RequiredIndicator />
                        </label>
                        <input
                            type='text'
                            name='subject'
                            value={formData.subject}
                            onChange={handleChange}
                            autoFocus={!isMobileDevice}
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Describa brevemente el problema'
                        />
                    </section>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Descripción{' '}<RequiredIndicator />
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
                                ? <><Loader className='w-5 h-5 animate-spin text-surface' /> Enviando...</>
                                : <><Send className='w-5 h-5' /> Enviar</>}
                        </button>
                    </section>
                </form>
            </div>
        </Modal>
    )
}
