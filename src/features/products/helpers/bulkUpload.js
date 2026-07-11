import { apiFetch } from '../../../shared/helpers/apiFetch'

export const bulkUpload = async (businessId, file, onProgress) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const formData = new FormData()
    formData.append('file', file)
    formData.append('business_id', businessId)

    const response = await apiFetch(`${apiUrl}/api/products/bulk-upload`, {
        method: 'POST',
        body: formData,
        contentType: null,
    })

    if (response.status === 400) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Error al procesar la carga masiva')
    }

    if (!response.body) {
        const data = await response.json()
        return data
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    return new Promise((resolve, reject) => {
        const read = async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        if (!line.trim()) continue
                        let data
                        try { data = JSON.parse(line) } catch { continue }

                        switch (data.type) {
                            case 'total':
                                onProgress?.({ current: 0, total: data.total })
                                break
                            case 'progress':
                                onProgress?.({ current: data.current, total: data.total })
                                break
                            case 'complete':
                                resolve(data.results)
                                return
                            case 'error':
                                reject(new Error(data.error))
                                return
                        }
                    }
                }
            } catch (err) {
                reject(err)
            }
        }

        read()
    })
}
