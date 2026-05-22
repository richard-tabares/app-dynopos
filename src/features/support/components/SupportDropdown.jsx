import { MessageCircle, Bug } from 'lucide-react'

const WHATSAPP_NUMBER = '573122200815'

export const SupportDropdown = ({ onClose, onOpenModal }) => {
    return (
        <section className='absolute top-full right-0 mt-2 bg-surface border border-outline rounded-xl shadow-lg w-72 z-50 overflow-hidden'>
            <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target='_blank'
                rel='noopener noreferrer'
                onClick={onClose}
                className='flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition cursor-pointer border-b border-outline no-underline'
            >
                <section className='p-2 rounded-lg bg-accent/10 shrink-0'>
                    <MessageCircle className='w-5 h-5 text-accent' />
                </section>
                <section className='flex flex-col'>
                    <span className='text-sm font-semibold text-on-body'>WhatsApp</span>
                    <span className='text-xs text-muted'>Chatea con soporte técnico</span>
                </section>
            </a>
            <button
                onClick={onOpenModal}
                className='w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition cursor-pointer text-left'
            >
                <section className='p-2 rounded-lg bg-accent/10 shrink-0'>
                    <Bug className='w-5 h-5 text-accent' />
                </section>
                <section className='flex flex-col'>
                    <span className='text-sm font-semibold text-on-body'>Registrar Soporte</span>
                    <span className='text-xs text-muted'>Reporta un error o inconsistencia</span>
                </section>
            </button>
        </section>
    )
}
