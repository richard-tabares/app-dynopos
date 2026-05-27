import { Upload, FileSpreadsheet, Loader, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react'
import { useState, useRef } from 'react'
import { Modal as SharedModal } from '../../../shared/components/Modal'
import { bulkUpload } from '../helpers/bulkUpload'
import { useStore } from '../../../app/providers/store'
import { sileo } from 'sileo'

export const BulkUploadModal = ({ onClose, onComplete }) => {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState(null)
    const fileRef = useRef(null)
    const { user } = useStore()

    const businessId = user?.profile?.business_id || user?.data?.user?.id

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            setResult(null)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const dropped = e.dataTransfer.files?.[0]
        if (dropped && (dropped.name.endsWith('.xlsx') || dropped.name.endsWith('.xls'))) {
            setFile(dropped)
            setResult(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setResult(null)

        try {
            const res = await bulkUpload(businessId, file)
            setResult(res)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: `${res.created} de ${res.total} productos creados correctamente`,
            })
        } catch (error) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: error.message,
            })
        } finally {
            setUploading(false)
        }
    }

    const handleDownloadTemplate = () => {
        const apiUrl = import.meta.env.VITE_API_URL
        window.open(`${apiUrl}/api/products/template`, '_blank')
    }

    const handleClose = () => {
        if (result && result.created > 0) {
            onComplete()
        }
        onClose()
    }

    return (
        <SharedModal
            onClose={handleClose}
            title='Carga Masiva de Productos'
            icon={Upload}
            size='lg'>
            <div className='p-6 flex flex-col gap-5'>
                {!result ? (
                    <>
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                file
                                    ? 'border-accent bg-accent/5'
                                    : 'border-divider hover:border-accent hover:bg-accent/5'
                            }`}>
                            <input
                                ref={fileRef}
                                type='file'
                                accept='.xlsx,.xls'
                                onChange={handleFileChange}
                                className='hidden'
                            />
                            {file ? (
                                <div className='flex flex-col items-center gap-2'>
                                    <FileSpreadsheet className='w-10 h-10 text-accent' />
                                    <p className='font-medium text-on-body'>{file.name}</p>
                                    <p className='text-sm text-muted'>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                            if (fileRef.current) fileRef.current.value = ''
                                        }}
                                        className='text-sm text-red-500 hover:text-red-600 cursor-pointer'>
                                        Quitar archivo
                                    </button>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center gap-2'>
                                    <Upload className='w-10 h-10 text-muted' />
                                    <p className='font-medium text-on-body'>
                                        Arrastra un archivo Excel aquí o haz clic para seleccionar
                                    </p>
                                    <p className='text-sm text-muted'>
                                        Formatos aceptados: .xlsx, .xls
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className='bg-subtle border border-divider rounded-lg p-4 text-sm'>
                            <h4 className='font-medium text-on-body flex items-center gap-2 mb-2'>
                                <AlertTriangle className='w-4 h-4 text-amber-500' />
                                Columnas esperadas
                            </h4>
                            <table className='w-full text-xs'>
                                <thead>
                                    <tr className='text-muted uppercase tracking-wider'>
                                        <th className='text-left py-1 pr-2'>Columna</th>
                                        <th className='text-left py-1 pr-2'>Requerido</th>
                                        <th className='text-left py-1'>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody className='text-on-body'>
                                    <tr><td className='py-1 pr-2 font-medium'>Codigo de Barras</td><td className='py-1 pr-2 text-muted'>No</td><td className='py-1'>Código de barras</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>SKU</td><td className='py-1 pr-2 text-muted'>No</td><td className='py-1'>Código único del producto</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>Nombre</td><td className='py-1 pr-2 text-red-500'>Sí</td><td className='py-1'>Nombre del producto</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>Costo Unitario</td><td className='py-1 pr-2 text-muted'>No</td><td className='py-1'>Costo unitario (en moneda local)</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>Precio</td><td className='py-1 pr-2 text-red-500'>Sí</td><td className='py-1'>Precio de venta (en moneda local)</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>Categoria</td><td className='py-1 pr-2 text-muted'>No</td><td className='py-1'>Nombre de la categoría</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>Stock Minimo</td><td className='py-1 pr-2 text-muted'>No</td><td className='py-1'>Stock mínimo (opcional, para notificaciones de stock bajo)</td></tr>
                                    <tr><td className='py-1 pr-2 font-medium'>Stock Inicial</td><td className='py-1 pr-2 text-muted'>No</td><td className='py-1'>Stock inicial (si se envía, habilita control de stock)</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className='flex flex-col gap-4'>
                        <div className='flex items-center gap-4 p-4 bg-accent/10 rounded-lg border border-accent/20'>
                            <CheckCircle2 className='w-10 h-10 text-accent' />
                            <div>
                                <p className='text-lg font-bold text-accent'>
                                    {result.created} productos creados
                                </p>
                                <p className='text-sm text-muted'>
                                    De un total de {result.total} registros procesados
                                </p>
                            </div>
                        </div>

                        {result.errors?.length > 0 && (
                            <div className='border border-red-200 rounded-lg overflow-hidden'>
                                <div className='flex items-center gap-2 p-3 bg-red-50 border-b border-red-200'>
                                    <XCircle className='w-4 h-4 text-red-500' />
                                    <span className='text-sm font-medium text-red-700'>
                                        {result.errors.length} error(es)
                                    </span>
                                </div>
                                <div className='max-h-48 overflow-y-auto'>
                                    {result.errors.map((err, idx) => (
                                        <div
                                            key={idx}
                                            className='flex items-start gap-2 px-3 py-2 text-sm border-b border-red-100 last:border-0'>
                                            <span className='text-red-400 font-medium whitespace-nowrap'>
                                                Fila {err.row}:
                                            </span>
                                            <span className='text-red-600'>{err.error}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className='flex justify-end gap-3 pt-2'>
                    {!result && (
                        <button
                            onClick={handleDownloadTemplate}
                            className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer flex items-center gap-2'>
                            <Download className='w-4 h-4' />
                            Plantilla
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'>
                        {result ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!result && (
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                            {uploading ? (
                                <>
                                    <Loader className='w-5 h-5 animate-spin text-surface' />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className='w-5 h-5' />
                                    Subir archivo
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </SharedModal>
    )
}
