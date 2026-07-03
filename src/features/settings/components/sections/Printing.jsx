import { useState, useEffect, useCallback } from 'react'
import { Printer, Loader, CheckCircle, XCircle, RotateCw } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../../app/providers/store'
import { updateProfile } from '../../account/helpers/updateProfile'
import { checkAgent, getPrinters, printTicket, setStoredPrinter, getStoredPrinter } from '../../../../shared/helpers/printEngine'
import { isAndroid, getRawBTPlayStoreUrl } from '../../../../shared/helpers/rawbtPrint'

export const Printing = () => {
    const { user, setProfile } = useStore()

    const [agentStatus, setAgentStatus] = useState(null)
    const [availablePrinters, setAvailablePrinters] = useState([])
    const [selectedPrinter, setSelectedPrinter] = useState(getStoredPrinter() || '')
    const [checkingAgent, setCheckingAgent] = useState(false)
    const [testingPrint, setTestingPrint] = useState(false)
    const [thermalPrintingEnabled, setThermalPrintingEnabled] = useState(
        user?.profile?.thermal_printing_enabled ?? true
    )
    const [printerWidth, setPrinterWidth] = useState(
        user?.profile?.printer_width ?? 32
    )

    const handleTogglePrinting = async () => {
        const newValue = !thermalPrintingEnabled
        const profileId = user?.profile?.id || user?.data?.user?.id
        if (!profileId) return
        try {
            await updateProfile(profileId, { thermal_printing_enabled: newValue })
            setProfile({ thermal_printing_enabled: newValue })
            setThermalPrintingEnabled(newValue)
        } catch (err) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: err.message || 'Error al actualizar la configuración' })
        }
    }

    const handlePrinterWidthChange = async (e) => {
        const newValue = parseInt(e.target.value)
        const profileId = user?.profile?.id || user?.data?.user?.id
        if (!profileId) return
        try {
            await updateProfile(profileId, { printer_width: newValue })
            setProfile({ printer_width: newValue })
            setPrinterWidth(newValue)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Ancho de impresión actualizado',
            })
        } catch (err) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: err.message || 'Error al actualizar el ancho de impresión',
            })
        }
    }

    const refreshAgentStatus = useCallback(async () => {
        setCheckingAgent(true)
        try {
            const health = await checkAgent()
            if (health) {
                setAgentStatus('connected')
                const result = await getPrinters()
                setAvailablePrinters(result.printers || [])
            } else {
                setAgentStatus('disconnected')
                setAvailablePrinters([])
            }
        } catch {
            setAgentStatus('disconnected')
            setAvailablePrinters([])
        } finally {
            setCheckingAgent(false)
        }
    }, [])

    useEffect(() => {
        refreshAgentStatus()
    }, [refreshAgentStatus])

    const handlePrinterChange = (e) => {
        const name = e.target.value
        setSelectedPrinter(name)
        if (name) setStoredPrinter(name)
        else setStoredPrinter(null)
    }

    const handleTestPrint = async () => {
        if (!selectedPrinter) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Selecciona una impresora primero' })
            return
        }
        setTestingPrint(true)
        try {
            await printTicket(selectedPrinter, {
                businessName: user?.business?.business_name || 'DynoPOS',
                ticketNumber: 'TEST',
                date: new Date().toLocaleDateString('es-CO'),
                paymentMethod: '---',
                items: [{ name: 'Prueba de impresión', quantity: 1, price: 0, subtotal: 0 }],
                total: 0,
                footer: 'Impresión de prueba exitosa',
            })
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Impresión de prueba exitosa' })
        } catch (err) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: err.message || 'Error en la impresión de prueba' })
        } finally {
            setTestingPrint(false)
        }
    }

    return (
        <section className='bg-surface border border-outline shadow-sm rounded-lg'>
            <div className='px-6 py-4 border-b border-divider bg-body/50'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <Printer className='w-5 h-5 text-accent' />
                    Impresora Térmica
                </h2>
            </div>
            <div className='p-6 space-y-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-on-body font-medium'>Habilitar impresión térmica</p>
                        <p className='text-muted text-sm'>Permite imprimir tickets automáticamente al confirmar ventas</p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            className='sr-only peer'
                            checked={thermalPrintingEnabled}
                            onChange={handleTogglePrinting}
                        />
                        <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </div>

                <div>
                    <label className='block text-sm font-medium text-on-body mb-1'>
                        Ancho de impresión
                    </label>
                    <select
                        value={printerWidth}
                        onChange={handlePrinterWidthChange}
                        className='w-full px-4 py-3 bg-surface text-on-body border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'>
                        <option value={32}>50mm (32 caracteres)</option>
                        <option value={42}>80mm (42 caracteres)</option>
                    </select>
                    <p className='text-xs text-muted mt-1'>
                        Selecciona el tamaño de papel de tu impresora térmica
                    </p>
                </div>

                <div className={`${!thermalPrintingEnabled ? 'opacity-50 pointer-events-none' : ''} space-y-4`}>
                    {isAndroid() ? (
                        <>
                            <div className='rounded-lg bg-accent/5 border border-accent/20 p-4'>
                                <p className='text-sm text-on-body font-medium mb-1'>
                                    Impresión vía rawBT (Android)
                                </p>
                                <p className='text-sm text-muted'>
                                    Se usará la app rawBT para imprimir en tu impresora Bluetooth.
                                    Asegúrate de tenerla instalada y configurada.
                                </p>
                            </div>
                            <div className='flex justify-end'>
                                <a
                                    href={getRawBTPlayStoreUrl()}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent text-sm font-medium rounded-lg hover:bg-accent/5 transition cursor-pointer'>
                                    <Printer className='w-4 h-4' />
                                    Instalar rawBT
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-on-body font-medium'>Estado del Agente</p>
                                    <p className='text-muted text-sm'>Agente local de impresión en esta computadora</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {checkingAgent ? (
                                        <Loader className='w-5 h-5 animate-spin text-accent' />
                                    ) : agentStatus === 'connected' ? (
                                        <div className='flex items-center gap-1.5 text-accent'>
                                            <CheckCircle className='w-4 h-4' />
                                            <span className='text-sm font-medium'>Conectado</span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-1.5 text-danger'>
                                            <XCircle className='w-4 h-4' />
                                            <span className='text-sm font-medium'>Desconectado</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={refreshAgentStatus}
                                        className='p-1.5 border border-outline rounded-md hover:bg-hover transition cursor-pointer'
                                        title='Actualizar estado'>
                                        <RotateCw className='w-3.5 h-3.5 text-muted' />
                                    </button>
                                </div>
                            </div>

                            {agentStatus === 'connected' && (
                                <>
                                    <div>
                                        <label className='block text-sm font-medium text-on-body mb-1'>
                                            Impresora predeterminada
                                        </label>
                                        <select
                                            value={selectedPrinter}
                                            onChange={handlePrinterChange}
                                            disabled={!thermalPrintingEnabled}
                                            className='w-full px-4 py-3 bg-surface text-on-body border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed'>
                                            <option value=''>Seleccionar impresora...</option>
                                            {availablePrinters.map((p) => (
                                                <option key={p.name} value={p.name}>
                                                    {p.name}{p.autoDetected ? ' (USB)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className='text-xs text-muted mt-1'>
                                            Se usará esta impresora para imprimir tickets de venta automáticamente
                                        </p>
                                    </div>

                                    <div className='flex justify-end'>
                                        <button
                                            onClick={handleTestPrint}
                                            disabled={testingPrint || !selectedPrinter || !thermalPrintingEnabled}
                                            className='flex items-center gap-2 px-4 py-2 border border-accent text-accent text-sm font-medium rounded-lg hover:bg-accent/5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
                                            {testingPrint ? (
                                                <Loader className='w-4 h-4 animate-spin' />
                                            ) : (
                                                <Printer className='w-4 h-4' />
                                            )}
                                            Probar impresión
                                        </button>
                                    </div>
                                </>
                            )}

                            {agentStatus === 'disconnected' && (
                                <div className='rounded-lg bg-danger/5 border border-danger/20 p-4'>
                                    <p className='text-sm text-on-body'>
                                        El agente de impresión no está corriendo en esta computadora.{' '}
                                        <a
                                            href='/docs/agente-impresion'
                                            className='text-accent hover:underline'
                                            target='_blank'
                                            rel='noopener noreferrer'>
                                            ¿Cómo instalarlo?
                                        </a>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
