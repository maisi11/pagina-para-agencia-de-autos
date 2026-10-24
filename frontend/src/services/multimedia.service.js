import { apiClient } from '../api/client'

export const MultimediaService = {
  /**
   * Obtiene la firma criptográfica para subida directa desde el backend
   */
  async obtenerFirma(folder = 'concesionaria/vehiculos') {
    return await apiClient(`/multimedia/signature?folder=${encodeURIComponent(folder)}`)
  },

  /**
   * Sube una imagen directamente a Cloudinary vía HTTPS POST con reporte de progreso
   * @param {File|Blob} archivo - Archivo de imagen (preferiblemente comprimido previamente)
   * @param {Object} options - Opciones de subida y callback de progreso
   * @param {Function} options.onProgress - Callback que recibe el porcentaje numérico (0 a 100)
   * @param {string} options.folder - Carpeta destino en Cloudinary
   * @returns {Promise<{ secure_url: string, public_id: string }>}
   */
  async subirACloudinary(archivo, { onProgress, folder } = {}) {
    const firmaData = await this.obtenerFirma(folder)

    if (!firmaData || !firmaData.signature) {
      throw new Error('No se pudo obtener la firma de autenticación para la carga de imágenes.')
    }

    const { timestamp, signature, apiKey, cloudName, folder: targetFolder } = firmaData

    const formData = new FormData()
    formData.append('file', archivo)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', targetFolder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', uploadUrl)

      // Reporte de progreso de subida en tiempo real
      if (xhr.upload && typeof onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const porcentaje = Math.round((event.loaded / event.total) * 100)
            onProgress(porcentaje)
          }
        }
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
            resolve({
              secure_url: response.secure_url,
              public_id: response.public_id,
              width: response.width,
              height: response.height,
              format: response.format,
              bytes: response.bytes,
            })
          } else {
            const errorMsg = response?.error?.message || `Error en Cloudinary (HTTP ${xhr.status})`
            reject(new Error(errorMsg))
          }
        } catch (e) {
          reject(new Error('Respuesta inválida recibida desde el servidor de imágenes.'))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Fallo de red al intentar transferir la imagen a Cloudinary.'))
      }

      xhr.send(formData)
    })
  },
}
