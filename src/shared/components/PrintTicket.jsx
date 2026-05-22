import { useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'

export const defaultPrintCss = `
    @page { margin: 0; size: 57mm auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
        width: 57mm;
        background: white;
        font-family: monospace;
    }
    body { padding: 2mm; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .gap-1 { gap: 0.25rem; }
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mt-0\\.5 { margin-top: 0.125rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-6 { margin-top: 1.5rem; }
    .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
    .pt-1 { padding-top: 0.25rem; }
    .pt-2 { padding-top: 0.5rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .border-b { border-bottom: 1px dashed #999; }
    .border-t { border-top: 1px dashed #999; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .uppercase { text-transform: uppercase; }
    .capitalize { text-transform: capitalize; }
    .tracking-widest { letter-spacing: 0.1em; }
    .leading-tight { line-height: 1.25; }
    .text-\\[9px\\] { font-size: 9px; }
    .text-\\[10px\\] { font-size: 10px; }
    .text-\\[11px\\] { font-size: 11px; }
    .text-base { font-size: 14px; }
    .text-lg { font-size: 16px; }
    .text-muted { color: #666; }
    .text-faint { color: #999; }
    .text-on-surface { color: #000; }
    .text-on-body { color: #444; }
    .shrink-0 { flex-shrink: 0; }
    .flex-1 { flex: 1; }
    .min-w-0 { min-width: 0; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .break-words { word-wrap: break-word; }
    .no-print { display: none !important; }
`

export const PrintTicket = ({ children, pageStyle, printRef }) => {
    const contentRef = useRef(null)

    const handlePrint = useReactToPrint({
        contentRef,
        ignoreGlobalStyles: true,
        pageStyle: pageStyle || defaultPrintCss,
    })

    useEffect(() => {
        if (printRef) {
            printRef.current = handlePrint
        }
    }, [handlePrint, printRef])

    return (
        <div ref={contentRef} style={{ display: 'contents' }}>
            {children}
        </div>
    )
}
